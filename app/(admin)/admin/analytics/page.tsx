import { requireSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { demoAdminStudents } from "@/lib/demo/admin-intelligence";
import { createClient } from "@/lib/supabase/server";
import { getAdminOverview } from "@/services/admin-intelligence";
import { AdminAnalytics } from "@/components/admin/admin-analytics";
import type { VerificationStatus, CertificatePipelineStatus } from "@/types/supabase";

const STATUS_ORDER: VerificationStatus[] = [
  "pending",
  "issuer_verified",
  "institution_reviewed",
  "unavailable",
  "rejected",
  "expired",
  "revoked",
];

const PIPELINE_ORDER: CertificatePipelineStatus[] = [
  "uploaded",
  "processing",
  "needs_review",
  "confirmed",
  "verifying",
  "complete",
  "failed",
];

export default async function AdminAnalyticsPage() {
  const session = await requireSession(["college_admin"]);
  const metrics = await getAdminOverview(session.organizationId);
  const supabase = await createClient();

  const { data } = await supabase
    .from("certificates")
    .select("verification_status, pipeline_status")
    .eq("organization_id", session.organizationId);

  const certificates = data as Array<{
    verification_status: VerificationStatus;
    pipeline_status: CertificatePipelineStatus;
  }> | null;

  const verificationCounts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<
    VerificationStatus,
    number
  >;
  const pipelineCounts = Object.fromEntries(PIPELINE_ORDER.map((s) => [s, 0])) as Record<
    CertificatePipelineStatus,
    number
  >;

  for (const row of certificates ?? []) {
    const v = row.verification_status as VerificationStatus;
    const p = row.pipeline_status as CertificatePipelineStatus;
    if (STATUS_ORDER.includes(v)) verificationCounts[v] += 1;
    if (PIPELINE_ORDER.includes(p)) pipelineCounts[p] += 1;
  }

  const demo = session.demo || isDemoMode();

  return (
    <AdminAnalytics
      metrics={metrics}
      students={demo ? demoAdminStudents : []}
      verificationSeries={STATUS_ORDER.map((status) => ({
        status: status.replaceAll("_", " "),
        count: verificationCounts[status],
      }))}
      pipelineSeries={PIPELINE_ORDER.map((stage) => ({
        stage,
        count: pipelineCounts[stage],
      }))}
    />
  );
}
