import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/product/page-header";
import { CertificateConfirmForm } from "@/components/product/certificate-confirm-form";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Json } from "@/types/supabase";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession(["student"]);
  if (!session.studentProfileId) notFound();

  const supabase = await createClient();
  const { data: cert } = await supabase
    .from("certificates")
    .select(
      "id, title, issuing_organization, recipient_name, issue_date, expiration_date, credential_number, credential_url, verification_status, pipeline_status, created_at, mime_type, file_size_bytes, student_asserted",
    )
    .eq("id", id)
    .eq("student_profile_id", session.studentProfileId)
    .maybeSingle();

  if (!cert) notFound();

  const { data: extraction } = await supabase
    .from("certificate_extractions")
    .select("structured, student_confirmed, confidence, provider")
    .eq("certificate_id", id)
    .maybeSingle();

  const structured = (extraction?.structured ?? cert.student_asserted ?? {}) as Json;
  const fromStruct = typeof structured === "object" && structured && !Array.isArray(structured)
    ? (structured as Record<string, unknown>)
    : {};

  const initial = {
    title: cert.title || asString(fromStruct.title) || "Untitled credential",
    issuing_organization: cert.issuing_organization || asString(fromStruct.issuing_organization),
    recipient_name: cert.recipient_name || asString(fromStruct.recipient_name),
    issue_date: cert.issue_date?.slice(0, 10) || asString(fromStruct.issue_date).slice(0, 10),
    expiration_date:
      cert.expiration_date?.slice(0, 10) || asString(fromStruct.expiration_date).slice(0, 10),
    credential_number: cert.credential_number || asString(fromStruct.credential_number),
    credential_url: cert.credential_url || asString(fromStruct.credential_url),
  };

  const needsConfirm =
    cert.pipeline_status === "uploaded" ||
    cert.pipeline_status === "needs_review" ||
    cert.pipeline_status === "processing" ||
    !extraction?.student_confirmed;

  return (
    <div>
      <PageHeader
        title={cert.title || "Certificate details"}
        description="Review extracted fields before verification runs. Status stamps reflect adapter and institutional review only."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/student/certificates/${id}/verification`}>Verification timeline</Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <VerificationStamp status={cert.verification_status} certificateId={cert.id} />
        <Badge variant="secondary">{cert.pipeline_status.replaceAll("_", " ")}</Badge>
        <span className="text-sm text-[var(--muted)]">
          Uploaded {formatDate(cert.created_at)} · {(cert.file_size_bytes / 1024).toFixed(0)} KB · {cert.mime_type}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stored fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Title" value={initial.title} />
            <Row label="Issuer" value={initial.issuing_organization || "—"} />
            <Row label="Recipient" value={initial.recipient_name || "—"} />
            <Row label="Issue date" value={formatDate(initial.issue_date || null)} />
            <Row label="Expiration" value={formatDate(initial.expiration_date || null)} />
            <Row label="Credential number" value={initial.credential_number || "—"} />
            <Row label="Verification URL" value={initial.credential_url || "—"} />
            {extraction?.provider ? (
              <p className="text-xs text-[var(--muted)]">
                Extraction: {extraction.provider}
                {typeof extraction.confidence === "number"
                  ? ` · confidence ${Math.round(extraction.confidence * 100)}%`
                  : ""}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirm extracted data</CardTitle>
          </CardHeader>
          <CardContent>
            {extraction?.student_confirmed && cert.pipeline_status !== "needs_review" ? (
              <p className="text-sm text-[var(--muted)]">
                You already confirmed these fields. Update them only if something changed — verification
                will re-queue.
              </p>
            ) : null}
            <CertificateConfirmForm
              certificateId={cert.id}
              initial={initial}
              disabled={!needsConfirm && cert.pipeline_status === "complete"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="font-medium text-[var(--navy)] break-all">{value}</p>
    </div>
  );
}