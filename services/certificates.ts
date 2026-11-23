import { createHash, randomUUID } from "crypto";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { writeAuditLog } from "@/services/audit";

export function hashBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function uploadCertificate(params: {
  userId: string;
  organizationId: string;
  studentProfileId: string;
  file: File;
}) {
  const mime = params.file.type;
  if (!ALLOWED_MIME.includes(mime as (typeof ALLOWED_MIME)[number])) {
    throw new Error("Only PDF, JPG, and PNG files are accepted.");
  }
  if (params.file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds the 12MB upload limit.");
  }

  const buffer = Buffer.from(await params.file.arrayBuffer());
  const contentHash = hashBuffer(buffer);
  const supabase = await createClient();

  const { data: duplicate } = await supabase
    .from("certificates")
    .select("id, title, verification_status")
    .eq("student_profile_id", params.studentProfileId)
    .eq("content_hash", contentHash)
    .maybeSingle();

  if (duplicate) {
    return {
      duplicate: true as const,
      certificate: duplicate,
      message: "This exact file was already uploaded. Skills and counts will not be duplicated.",
    };
  }

  const objectId = randomUUID();
  const storagePath = `${params.userId}/${params.organizationId}/${objectId}`;

  const { error: storageError } = await supabase.storage
    .from("certificates")
    .upload(storagePath, buffer, { contentType: mime, upsert: false });
  if (storageError) throw new Error(storageError.message);

  const { data: certificate, error } = await supabase
    .from("certificates")
    .insert({
      organization_id: params.organizationId,
      student_profile_id: params.studentProfileId,
      uploaded_by: params.userId,
      storage_path: storagePath,
      mime_type: mime,
      file_size_bytes: params.file.size,
      content_hash: contentHash,
      pipeline_status: "uploaded",
      verification_status: "pending",
      title: params.file.name.replace(/\.[^.]+$/, ""),
    })
    .select("*")
    .single();

  if (error || !certificate) {
    throw new Error(error?.message ?? "Failed to create certificate record");
  }

  const service = createServiceClient();
  await service.from("processing_jobs").insert({
    organization_id: params.organizationId,
    certificate_id: certificate.id,
    job_type: "extract_certificate",
    idempotency_key: `extract:${certificate.id}`,
    payload: { storage_path: storagePath, mime_type: mime },
  });

  await writeAuditLog({
    organizationId: params.organizationId,
    actorId: params.userId,
    action: "certificate.uploaded",
    entityType: "certificate",
    entityId: certificate.id,
    metadata: { contentHash, mime },
  });

  return { duplicate: false as const, certificate };
}

export async function confirmExtraction(
  certificateId: string,
  studentProfileId: string,
  fields: {
    title: string;
    issuing_organization?: string;
    recipient_name?: string;
    issue_date?: string;
    expiration_date?: string;
    credential_number?: string;
    credential_url?: string;
  },
) {
  const supabase = await createClient();
  const { data: cert } = await supabase
    .from("certificates")
    .select("id, organization_id, student_profile_id")
    .eq("id", certificateId)
    .eq("student_profile_id", studentProfileId)
    .single();
  if (!cert) throw new Error("Certificate not found");

  await supabase
    .from("certificates")
    .update({
      ...fields,
      student_asserted: fields,
      pipeline_status: "confirmed",
      verification_status: "pending",
    })
    .eq("id", certificateId);

  await supabase
    .from("certificate_extractions")
    .update({ student_confirmed: true, confirmed_at: new Date().toISOString(), structured: fields })
    .eq("certificate_id", certificateId);

  const service = createServiceClient();
  await service.from("processing_jobs").upsert(
    {
      organization_id: cert.organization_id,
      certificate_id: certificateId,
      job_type: "verify_certificate",
      idempotency_key: `verify:${certificateId}:${fields.credential_number ?? "none"}`,
      status: "queued",
      payload: fields,
    },
    { onConflict: "idempotency_key" },
  );

  return { ok: true };
}
