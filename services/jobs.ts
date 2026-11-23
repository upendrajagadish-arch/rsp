import { createServiceClient } from "@/lib/supabase/server";
import { getOcrAdapter } from "@/adapters/ocr";
import { runVerificationPipeline } from "@/services/verification";
import { recalculateStudentSkills } from "@/services/skills";

export async function claimJobs(workerId: string, limit = 5) {
  const supabase = createServiceClient();
  const { data: candidates } = await supabase
    .from("processing_jobs")
    .select("*")
    .in("status", ["queued", "failed"])
    .lte("run_after", new Date().toISOString())
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(limit);

  const claimed = [];
  for (const job of candidates ?? []) {
    const { data } = await supabase
      .from("processing_jobs")
      .update({
        status: "processing",
        locked_at: new Date().toISOString(),
        locked_by: workerId,
        attempts: job.attempts + 1,
      })
      .eq("id", job.id)
      .in("status", ["queued", "failed"])
      .select("*")
      .maybeSingle();
    if (data) claimed.push(data);
  }
  return claimed;
}

export async function processJob(job: {
  id: string;
  job_type: string;
  certificate_id: string | null;
  payload: Record<string, unknown>;
}) {
  const supabase = createServiceClient();
  try {
    if (job.job_type === "extract_certificate" && job.certificate_id) {
      const { data: cert } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", job.certificate_id)
        .single();
      if (!cert) throw new Error("Certificate missing");

      await supabase
        .from("certificates")
        .update({ pipeline_status: "processing" })
        .eq("id", cert.id);

      const { data: file, error } = await supabase.storage
        .from("certificates")
        .download(cert.storage_path);
      if (error || !file) throw new Error(error?.message ?? "Download failed");

      const buffer = Buffer.from(await file.arrayBuffer());
      const adapter = getOcrAdapter(cert.mime_type);
      const extraction = await adapter.extract(buffer, cert.mime_type);

      await supabase.from("certificate_extractions").upsert(
        {
          certificate_id: cert.id,
          raw_text: extraction.rawText,
          structured: {
            ...extraction.structured,
            unavailableReason: extraction.unavailableReason ?? null,
          },
          provider: extraction.provider,
          confidence: extraction.confidence,
          student_confirmed: false,
        },
        { onConflict: "certificate_id" },
      );

      await supabase
        .from("certificates")
        .update({
          pipeline_status: "needs_review",
          title: extraction.structured.title ?? cert.title,
          issuing_organization: extraction.structured.issuing_organization ?? null,
          recipient_name: extraction.structured.recipient_name ?? null,
          credential_number: extraction.structured.credential_number ?? null,
          credential_url: extraction.structured.credential_url ?? null,
          extraction_metadata: {
            provider: extraction.provider,
            confidence: extraction.confidence,
            unavailableReason: extraction.unavailableReason ?? null,
          },
        })
        .eq("id", cert.id);

      await supabase.from("notifications").insert({
        user_id: cert.uploaded_by,
        title: "Certificate ready for review",
        body: extraction.unavailableReason
          ? `Extraction unavailable: ${extraction.unavailableReason}`
          : "Review and confirm extracted certificate fields.",
        link: `/student/certificates/${cert.id}`,
      });
    }

    if (job.job_type === "verify_certificate" && job.certificate_id) {
      await runVerificationPipeline(job.certificate_id);
    }

    if (job.job_type === "recalculate_skills") {
      const studentId = String(job.payload.student_profile_id ?? "");
      if (studentId) await recalculateStudentSkills(studentId);
    }

    await supabase
      .from("processing_jobs")
      .update({ status: "completed", result: { ok: true }, locked_at: null, locked_by: null })
      .eq("id", job.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job failed";
    await supabase
      .from("processing_jobs")
      .update({
        status: "failed",
        last_error: message,
        run_after: new Date(Date.now() + 60_000).toISOString(),
        locked_at: null,
        locked_by: null,
      })
      .eq("id", job.id);
    throw error;
  }
}
