"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Student360 } from "@/lib/admin/types";
import { studentPhoto } from "@/lib/admin/student-photos";
import { AdminGlass } from "@/components/admin/admin-theme-shell";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TABS = [
  "overview",
  "academics",
  "skills",
  "certificates",
  "training",
  "assessments",
  "projects",
  "placement",
  "activity",
] as const;

type Tab = (typeof TABS)[number];

export function Student360View({ data }: { data: Student360 }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = (searchParams.get("tab") as Tab | null) ?? "overview";
  const tab: Tab = TABS.includes(tabParam) ? tabParam : "overview";
  const { profile } = data;

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-5 text-[#303030]">
      <AdminGlass className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={studentPhoto(profile)}
            alt=""
            className="h-20 w-20 rounded-3xl object-cover shadow-[0_2px_20px_rgba(0,0,0,0.10)]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#898989]">
              Student 360°
            </p>
            <h1 className="mt-1 text-2xl tracking-tight sm:text-3xl">{profile.name}</h1>
            <p className="mt-1 text-sm text-[#898989]">
              {profile.rollNumber} · {profile.passportId} · {profile.email}
            </p>
            <p className="mt-1 text-sm text-[#898989]">
              {profile.degree} · {profile.branch} · {profile.academicYear} · Batch{" "}
              {profile.graduationYear}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  profile.academicEligible
                    ? "bg-[#303030] text-white"
                    : "bg-[#898989]/20 text-[#303030]"
                }`}
              >
                {profile.academicEligible ? "Academically eligible" : "Not eligible"}
              </span>
              <span className="rounded-full bg-[#FFD85F] px-3 py-1 text-xs capitalize">
                {profile.placementStatus.replaceAll("_", " ")}
              </span>
              {profile.needsSupport ? (
                <span className="rounded-full border border-[#898989]/30 px-3 py-1 text-xs">
                  Needs support
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <Link
          href="/admin/students"
          className="mt-4 inline-block text-sm text-[#898989] hover:text-[#303030]"
        >
          ← Back to directory
        </Link>
      </AdminGlass>

      <div className="flex flex-wrap gap-1 rounded-full border border-[#898989]/20 bg-white/60 p-1 backdrop-blur-xl">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
              tab === t
                ? "bg-[#303030] text-white"
                : "text-[#898989] hover:text-[#303030]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminGlass className="p-5">
            <p className="text-lg">Summary</p>
            <p className="mt-3 text-sm text-[#898989]">{data.overview.summary}</p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-[#898989]">
              {data.overview.evidenceHighlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </AdminGlass>
          <AdminGlass className="grid grid-cols-2 gap-3 p-5">
            <Metric label="CGPA" value={profile.cgpa.toFixed(1)} />
            <Metric label="Training" value={`${profile.trainingCompletionPercent}%`} />
            <Metric
              label="Assessment avg"
              value={profile.assessmentAverage != null ? String(profile.assessmentAverage) : "—"}
            />
            <Metric label="Certificates" value={String(profile.certificateStats.total)} />
            <Metric
              label="Issuer verified"
              value={String(profile.certificateStats.issuerVerified)}
            />
            <Metric label="Pending certs" value={String(profile.certificateStats.pending)} />
          </AdminGlass>
        </div>
      ) : null}

      {tab === "academics" ? (
        <AdminGlass className="grid gap-3 p-5 text-sm sm:grid-cols-2">
          <Metric label="Degree" value={data.academics.degree} />
          <Metric label="Branch" value={data.academics.branch} />
          <Metric label="Academic year" value={data.academics.academicYear} />
          <Metric label="Graduation year" value={String(data.academics.graduationYear)} />
          <Metric label="CGPA" value={data.academics.cgpa.toFixed(2)} />
          <Metric
            label="Eligibility"
            value={data.academics.academicEligible ? "Eligible" : "Not eligible"}
          />
          <p className="sm:col-span-2 text-[#898989]">{data.academics.eligibilityNote}</p>
        </AdminGlass>
      ) : null}

      {tab === "skills" ? (
        <AdminGlass className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[#898989]/15 text-xs uppercase text-[#898989]">
              <tr>
                <th className="px-4 py-3 text-left">Skill</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Strongest evidence</th>
                <th className="px-4 py-3 text-left">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {data.skills.map((s) => (
                <tr key={s.name} className="border-b border-[#898989]/10 last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.category}</td>
                  <td className="px-4 py-3">{s.strongestEvidence.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{s.evidenceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminGlass>
      ) : null}

      {tab === "certificates" ? (
        <ul className="space-y-3">
          {!data.certificates.length ? (
            <Empty>No certificates on record.</Empty>
          ) : (
            data.certificates.map((c) => (
              <li key={c.id}>
                <AdminGlass className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-[#898989]">
                      {c.issuer}
                      {c.credentialNumber ? ` · ${c.credentialNumber}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-[#898989]">{c.evidenceNote}</p>
                    <p className="mt-1 text-xs text-[#898989]">
                      Issued {formatDate(c.issuedOn)} · Expires {formatDate(c.expiresOn)}
                    </p>
                  </div>
                  <VerificationStamp status={c.status} />
                </AdminGlass>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "training" ? (
        <ul className="space-y-3">
          {!data.training.length ? (
            <Empty>No training enrollments.</Empty>
          ) : (
            data.training.map((t) => (
              <li key={t.id}>
                <AdminGlass className="p-5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{t.programTitle}</p>
                    <span className="rounded-full bg-[#FFD85F] px-3 py-1 text-xs capitalize">
                      {t.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#898989]/15">
                    <div
                      className="h-full rounded-full bg-[#303030]"
                      style={{ width: `${t.progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[#898989]">Progress {t.progressPercent}%</p>
                  <p className="mt-1 text-xs text-[#898989]">
                    Skills gained: {t.skillsGained.join(", ") || "—"}
                  </p>
                </AdminGlass>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "assessments" ? (
        <ul className="space-y-3">
          {!data.assessments.length ? (
            <Empty>No assessment results recorded.</Empty>
          ) : (
            data.assessments.map((a) => (
              <li key={a.id}>
                <AdminGlass className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-[#898989]">
                      {a.skill ?? "General"} · {formatDate(a.completedAt)}
                    </p>
                  </div>
                  <p className="text-2xl">
                    {a.score}/{a.maxScore}
                  </p>
                </AdminGlass>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "projects" ? (
        <ul className="space-y-3">
          {!data.projects.length ? (
            <Empty>No projects submitted.</Empty>
          ) : (
            data.projects.map((p) => (
              <li key={p.id}>
                <AdminGlass className="p-5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{p.title}</p>
                    <span className="rounded-full border border-[#898989]/30 px-3 py-1 text-xs capitalize">
                      {p.reviewStatus.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-[#898989]">{p.description}</p>
                  <p className="mt-2 text-xs text-[#898989]">
                    Skills: {p.skills.join(", ") || "—"}
                  </p>
                  {p.url ? (
                    <a
                      href={p.url}
                      className="mt-2 inline-block text-[#303030] underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open project
                    </a>
                  ) : null}
                </AdminGlass>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "placement" ? (
        <div className="space-y-4">
          <AdminGlass className="p-5 text-sm">
            <p className="font-medium">
              Status: {data.placement.status.replaceAll("_", " ")}
            </p>
            <p className="mt-2 text-[#898989]">{data.placement.note}</p>
          </AdminGlass>
          {!data.placement.applications.length ? (
            <Empty>No placement applications on record.</Empty>
          ) : (
            data.placement.applications.map((app) => (
              <AdminGlass key={app.id} className="p-5 text-sm">
                <p className="font-medium">
                  {app.companyName} · {app.jobRoleTitle}
                </p>
                <p className="mt-1 text-[#898989]">
                  Stage: {app.stage.replaceAll("_", " ")} · {app.status}
                </p>
                <p className="mt-1 text-xs text-[#898989]">
                  Applied {formatDate(app.appliedAt)}
                  {app.missingSkills.length
                    ? ` · Missing skills: ${app.missingSkills.join(", ")}`
                    : ""}
                </p>
              </AdminGlass>
            ))
          )}
        </div>
      ) : null}

      {tab === "activity" ? (
        <ol className="relative space-y-3 border-l-2 border-[#898989]/20 pl-6">
          {!data.activity.length ? (
            <Empty>No activity events.</Empty>
          ) : (
            data.activity.map((a, i) => (
              <li key={a.id} className="relative">
                <span
                  className={`absolute top-4 -left-[1.9rem] h-3 w-3 rounded-full ${
                    i === 0 ? "bg-[#FFD85F]" : "bg-[#303030]"
                  }`}
                />
                <AdminGlass className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-[#898989]">{formatDate(a.createdAt)}</p>
                  </div>
                  {a.detail ? <p className="mt-1 text-[#898989]">{a.detail}</p> : null}
                </AdminGlass>
              </li>
            ))
          )}
        </ol>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/50 p-3">
      <p className="text-xs uppercase tracking-wide text-[#898989]">{label}</p>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <AdminGlass className="px-4 py-10 text-center text-sm text-[#898989]">
      {children}
    </AdminGlass>
  );
}
