import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/product/page-header";
import { EmptyState } from "@/components/product/empty-state";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { VERIFICATION_LABELS } from "@/lib/constants";
import type { VerificationStatus } from "@/types/supabase";

export default async function CertificateVerificationPage({
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
    .select("id, title, verification_status, pipeline_status, independently_verified")
    .eq("id", id)
    .eq("student_profile_id", session.studentProfileId)
    .maybeSingle();

  if (!cert) notFound();

  const [{ data: verifications }, { data: events }] = await Promise.all([
    supabase
      .from("credential_verifications")
      .select("id, method, status, source, evidence, reviewer_notes, checked_at, is_current")
      .eq("certificate_id", id)
      .order("checked_at", { ascending: false }),
    supabase
      .from("verification_events")
      .select("id, event_type, payload, created_at, actor_id")
      .eq("certificate_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const current =
    (verifications ?? []).find((v) => v.is_current) ?? (verifications ?? [])[0] ?? null;

  return (
    <div>
      <PageHeader
        title="Verification details"
        description="Issuer verification requires a trusted adapter result — it is never set from this UI."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/student/certificates/${id}`}>Back to certificate</Link>
          </Button>
        }
      />

      <LabelCard title={cert.title} status={cert.verification_status} pipeline={cert.pipeline_status} />

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Current verification</CardTitle>
          </CardHeader>
          <CardContent>
            {!current ? (
              <EmptyState
                title="No verification checks yet"
                description="Confirm certificate fields to queue the verification job. Until then, status stays pending."
              />
            ) : (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-[var(--muted)]">Method</dt>
                  <dd className="font-medium">{current.method}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[var(--muted)]">Source</dt>
                  <dd className="font-medium">{current.source ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[var(--muted)]">Checked</dt>
                  <dd className="font-medium">{formatDate(current.checked_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-[var(--muted)]">Status</dt>
                  <dd>
                    <VerificationStamp status={current.status} />
                  </dd>
                </div>
                {current.reviewer_notes ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase text-[var(--muted)]">Reviewer notes</dt>
                    <dd className="text-[var(--navy)]">{current.reviewer_notes}</dd>
                  </div>
                ) : null}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-[var(--navy)]">Event timeline</h2>
      {!events?.length ? (
        <p className="text-sm text-[var(--muted)]">No events recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm">
              <p className="font-medium text-[var(--navy)]">{event.event_type.replaceAll("_", " ")}</p>
              <p className="text-xs text-[var(--muted)]">{formatDate(event.created_at)}</p>
            </li>
          ))}
        </ul>
      )}

      {cert.independently_verified ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Independent verification snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-slate-50 p-3 text-xs text-slate-800">
              {JSON.stringify(cert.independently_verified, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function LabelCard({
  title,
  status,
  pipeline,
}: {
  title: string | null;
  status: VerificationStatus;
  pipeline: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-semibold text-[var(--navy)]">{title || "Certificate"}</p>
          <p className="text-sm text-[var(--muted)]">
            {VERIFICATION_LABELS[status]} · Pipeline {pipeline.replaceAll("_", " ")}
          </p>
        </div>
        <VerificationStamp status={status} />
      </CardContent>
    </Card>
  );
}
