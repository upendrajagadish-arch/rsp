import Link from "next/link";
import { FileSearch } from "lucide-react";
import { AdminGlass, AdminPageTitle } from "@/components/admin/admin-theme-shell";
import { AdminReviewForm } from "@/components/product/admin-review-form";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { requireSession } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/mode";
import { demoAdminStudents } from "@/lib/demo/admin-intelligence";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type QueueItem = {
  id: string;
  title: string;
  issuer: string;
  status: string;
  pipeline: string;
  createdAt: string;
  passportId: string;
  studentLabel: string;
  canReview: boolean;
  demo?: boolean;
};

export default async function VerificationQueuePage() {
  const session = await requireSession(["college_admin"]);
  const demo = session.demo || isDemoMode();
  const supabase = await createClient();

  const { data: certificates } = await supabase
    .from("certificates")
    .select(
      "id, title, issuing_organization, verification_status, pipeline_status, created_at, student_profiles(passport_id, degree, branch)",
    )
    .eq("organization_id", session.organizationId)
    .in("verification_status", ["pending", "unavailable"])
    .order("created_at", { ascending: true });

  let queue: QueueItem[] = (certificates ?? []).map((cert) => {
    const student = cert.student_profiles as unknown as {
      passport_id: string;
      degree: string | null;
      branch: string | null;
    } | null;
    return {
      id: cert.id,
      title: cert.title || "Untitled credential",
      issuer: cert.issuing_organization || "Unknown issuer",
      status: cert.verification_status,
      pipeline: cert.pipeline_status,
      createdAt: cert.created_at,
      passportId: student?.passport_id ?? "—",
      studentLabel:
        [student?.degree, student?.branch].filter(Boolean).join(" · ") || "Student",
      canReview: cert.verification_status !== "issuer_verified",
    };
  });

  if (!queue.length && demo) {
    queue = demoAdminStudents
      .filter((s) => s.certificateStats.pending > 0)
      .flatMap((s, idx) =>
        Array.from({ length: s.certificateStats.pending }).map((_, i) => ({
          id: `demo-cert-${s.id}-${i}`,
          title: i === 0 ? "Campus skill certificate" : "Evidence upload",
          issuer: "Demo Institute / External issuer",
          status: "pending",
          pipeline: "needs_review",
          createdAt: s.lastActivityAt ?? new Date().toISOString(),
          passportId: s.passportId,
          studentLabel: `${s.name} · ${s.branch}`,
          canReview: false,
          demo: true,
        })),
      );
  }

  return (
    <div className="space-y-5 text-[#303030]">
      <AdminPageTitle
        title="Verification queue"
        description="Interactive review board for pending and unavailable credentials. Issuer-verified items are never overridden here."
        actions={
          <span className="rounded-full bg-[#303030] px-4 py-2 text-sm text-white">
            {queue.length} in queue
          </span>
        }
      />

      {!queue.length ? (
        <AdminGlass className="flex flex-col items-center gap-3 p-12 text-center">
          <FileSearch className="h-10 w-10 text-[#898989]" />
          <p className="text-lg">Queue is empty</p>
          <p className="max-w-md text-sm text-[#898989]">
            Pending and unavailable credentials in your organization will appear here for
            review.
          </p>
        </AdminGlass>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {queue.map((item) => (
            <li key={item.id}>
              <AdminGlass className="flex h-full flex-col gap-4 p-5 transition hover:bg-white/80">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-[#898989]">
                      {item.issuer} · Passport {item.passportId}
                    </p>
                    <p className="mt-1 text-xs text-[#898989]">
                      {item.studentLabel} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <VerificationStamp status={item.status as "pending"} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#FFD85F] px-3 py-1 text-xs">
                    Pipeline {item.pipeline.replaceAll("_", " ")}
                  </span>
                  <span className="rounded-full border border-[#898989]/25 px-3 py-1 text-xs capitalize">
                    {item.status.replaceAll("_", " ")}
                  </span>
                </div>
                {item.demo ? (
                  <p className="text-xs text-[#898989]">
                    Demo queue item — open Analytics or Students for related evidence. Live
                    review forms appear when Supabase certificates exist.
                  </p>
                ) : (
                  <AdminReviewForm certificateId={item.id} canReview={item.canReview} />
                )}
                {!item.demo ? (
                  <Link
                    href={`/student/certificates/${item.id}/verification`}
                    className="text-sm text-[#303030] underline-offset-2 hover:underline"
                  >
                    View verification timeline
                  </Link>
                ) : (
                  <Link
                    href="/admin/students"
                    className="text-sm text-[#303030] underline-offset-2 hover:underline"
                  >
                    Jump to student directory
                  </Link>
                )}
              </AdminGlass>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
