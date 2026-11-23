import { createServiceClient } from "@/lib/supabase/server";
import { getIssuerAdapters } from "@/adapters/issuer";
import { writeAuditLog } from "@/services/audit";
import { recalculateStudentSkills } from "@/services/skills";
import type { VerificationStatus } from "@/types/supabase";

export async function runVerificationPipeline(certificateId: string) {
  const supabase = createServiceClient();
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .single();
  if (!cert) throw new Error("Certificate not found");

  await supabase
    .from("certificates")
    .update({ pipeline_status: "verifying", verification_status: "pending" })
    .eq("id", certificateId);

  const input = {
    credentialNumber: cert.credential_number,
    recipientName: cert.recipient_name,
    title: cert.title,
    credentialUrl: cert.credential_url,
    issuingOrganization: cert.issuing_organization,
  };

  const adapters = getIssuerAdapters().filter((a) => a.supports(input));
  let finalStatus: VerificationStatus = "unavailable";
  let currentVerificationId: string | null = null;

  await supabase
    .from("credential_verifications")
    .update({ is_current: false })
    .eq("certificate_id", certificateId)
    .eq("is_current", true);

  for (const adapter of adapters) {
    const result = await adapter.verify(input);
    const { data: verification } = await supabase
      .from("credential_verifications")
      .insert({
        certificate_id: certificateId,
        method: result.method,
        status: result.status,
        evidence: result.evidence,
        source: result.source,
        is_current: true,
      })
      .select("id")
      .single();

    currentVerificationId = verification?.id ?? null;
    await supabase.from("verification_events").insert({
      certificate_id: certificateId,
      verification_id: currentVerificationId,
      event_type: "verification_check",
      payload: { adapter: adapter.id, result },
    });

    if (result.status === "issuer_verified") {
      finalStatus = "issuer_verified";
      break;
    }
    if (result.status === "rejected") {
      finalStatus = "rejected";
      break;
    }
    finalStatus = result.status;
  }

  // Never promote to issuer_verified unless an adapter explicitly returned it.
  if (finalStatus === "issuer_verified") {
    await supabase
      .from("certificates")
      .update({
        verification_status: "issuer_verified",
        pipeline_status: "complete",
        independently_verified: {
          title: cert.title,
          issuing_organization: cert.issuing_organization,
          credential_number: cert.credential_number,
          recipient_name: cert.recipient_name,
        },
      })
      .eq("id", certificateId);
  } else {
    await supabase
      .from("certificates")
      .update({
        verification_status: finalStatus,
        pipeline_status: finalStatus === "rejected" ? "complete" : "complete",
      })
      .eq("id", certificateId);
  }

  await writeAuditLog({
    organizationId: cert.organization_id,
    action: "certificate.verification_completed",
    entityType: "certificate",
    entityId: certificateId,
    metadata: { finalStatus },
  });

  await supabase.from("notifications").insert({
    user_id: cert.uploaded_by,
    title: "Certificate verification updated",
    body: `Status is now ${finalStatus.replaceAll("_", " ")}. This is based on available evidence only.`,
    link: `/student/certificates/${certificateId}/verification`,
  });

  await recalculateStudentSkills(cert.student_profile_id);
  return { status: finalStatus, verificationId: currentVerificationId };
}

export async function institutionReview(params: {
  certificateId: string;
  reviewerId: string;
  decision: "institution_reviewed" | "rejected";
  notes: string;
}) {
  const supabase = createServiceClient();
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", params.certificateId)
    .single();
  if (!cert) throw new Error("Certificate not found");

  if (cert.verification_status === "issuer_verified") {
    await writeAuditLog({
      organizationId: cert.organization_id,
      actorId: params.reviewerId,
      action: "certificate.issuer_override_attempt",
      entityType: "certificate",
      entityId: cert.id,
      metadata: {
        notes: params.notes,
        message: "Admin cannot silently change issuer_verified without override record",
      },
    });
    throw new Error(
      "Issuer-verified results require an audited override. Record an override event instead of replacing the issuer stamp.",
    );
  }

  await supabase
    .from("credential_verifications")
    .update({ is_current: false })
    .eq("certificate_id", cert.id)
    .eq("is_current", true);

  const { data: verification } = await supabase
    .from("credential_verifications")
    .insert({
      certificate_id: cert.id,
      method: "institutional_review",
      status: params.decision,
      evidence: { notes: params.notes },
      source: "college_admin",
      reviewer_id: params.reviewerId,
      reviewer_notes: params.notes,
      is_current: true,
    })
    .select("id")
    .single();

  await supabase.from("verification_events").insert({
    certificate_id: cert.id,
    verification_id: verification?.id,
    event_type: "institutional_review",
    actor_id: params.reviewerId,
    payload: { decision: params.decision, notes: params.notes },
  });

  await supabase
    .from("certificates")
    .update({
      verification_status: params.decision,
      pipeline_status: "complete",
    })
    .eq("id", cert.id);

  await writeAuditLog({
    organizationId: cert.organization_id,
    actorId: params.reviewerId,
    action: "certificate.institutional_review",
    entityType: "certificate",
    entityId: cert.id,
    metadata: { decision: params.decision, notes: params.notes },
  });

  await recalculateStudentSkills(cert.student_profile_id);
  return { ok: true };
}
