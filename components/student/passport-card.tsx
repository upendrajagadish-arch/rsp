"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { initials } from "@/lib/utils";

export type PassportCardData = {
  fullName: string;
  passportId: string;
  rollNumber: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  organizationName: string;
  degree: string | null;
  branch: string | null;
  graduationYear: number | null;
  location: string | null;
  cgpa: string | null;
  headline: string | null;
  preferredRoles: string | null;
  journeyTitle: string | null;
  coveragePercent: number;
  skills: { id: string; name: string }[];
  certificatesCount: number;
  projectsCount: number;
  institutionReviewed: boolean;
};

function handleFromName(fullName: string) {
  return fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function batchRange(year: number | null) {
  if (!year) return null;
  return `${year - 4}–${year}`;
}

export function PassportCard({
  data,
  onOpenSkills,
  onOpenFullProfile,
}: {
  data: PassportCardData;
  onOpenSkills: () => void;
  onOpenFullProfile: () => void;
}) {
  const handle = handleFromName(data.fullName);
  const visibleSkills = data.skills.slice(0, 6);
  const moreSkills = Math.max(0, data.skills.length - visibleSkills.length);
  const roles =
    data.headline ||
    data.preferredRoles ||
    data.journeyTitle ||
    [data.degree, data.branch].filter(Boolean).join(" · ") ||
    "Student";
  const batch = data.graduationYear ? `Batch ${data.graduationYear}` : data.organizationName;
  const years = batchRange(data.graduationYear);

  return (
    <div className="passport-phones-hero overflow-hidden rounded-[24px] border border-white/10 bg-[#070a12] text-white shadow-[0_40px_100px_rgba(0,0,0,0.55)]">
      {/* Banner */}
      <div
        className="relative h-[88px]"
        style={{
          background:
            "radial-gradient(ellipse 90% 120% at 20% 40%, #1a3a4a 0%, #0f1a2e 45%, #0a0e1c 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 75% 30%, rgba(198,255,46,0.12), transparent 40%), radial-gradient(circle at 30% 80%, rgba(7,155,131,0.25), transparent 45%)",
          }}
        />
      </div>

      {/* Avatar + actions */}
      <div className="relative px-4">
        <div className="-mt-11 flex items-end justify-between gap-3">
          <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-2 border-[#070a12] bg-[#0a0e1c] shadow-lg">
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt={data.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold tracking-tight text-[var(--lime)]">
                {initials(data.fullName)}
              </div>
            )}
          </div>

          <div className="mb-1 flex flex-1 items-center justify-end gap-2">
            <a
              href={`mailto:${data.email}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Email"
              title={data.email}
            >
              <Mail className="h-4 w-4" />
            </a>
            {data.phone ? (
              <a
                href={`tel:${data.phone.replace(/\s+/g, "")}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition hover:border-white/30 hover:text-white"
                aria-label="Phone"
                title={data.phone}
              >
                <Phone className="h-4 w-4" />
              </a>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/25"
                title="Phone not added"
              >
                <Phone className="h-4 w-4" />
              </span>
            )}
            {data.linkedinUrl ? (
              <a
                href={data.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition hover:border-white/30 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            ) : (
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/25"
                title="LinkedIn not linked"
              >
                <Linkedin className="h-4 w-4" />
              </span>
            )}
            {data.portfolioUrl || data.githubUrl ? (
              <a
                href={data.portfolioUrl || data.githubUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/70 transition hover:border-white/30 hover:text-white"
                aria-label="Portfolio or GitHub"
              >
                <Globe className="h-4 w-4" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={onOpenFullProfile}
              className="ml-1 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium tracking-tight text-white transition hover:border-[var(--lime)]/50 hover:bg-white/10"
            >
              Full profile
            </button>
          </div>
        </div>

        {/* Identity */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[22px] font-semibold leading-none tracking-[-0.04em] text-white">
              {data.fullName}
            </h2>
            {data.institutionReviewed ? (
              <BadgeCheck
                className="h-[18px] w-[18px] shrink-0 text-[var(--lime)]"
                aria-label="Institution-reviewed evidence on passport"
              />
            ) : null}
          </div>
          <p className="mt-1.5 text-[13px] tracking-tight text-white/45">
            @{handle}
            {data.rollNumber ? ` · ${data.rollNumber}` : ` · ${data.passportId}`}
          </p>
          <p className="mt-2 line-clamp-2 text-[13px] leading-snug tracking-tight text-white/55">
            {roles}
            {data.degree || data.branch
              ? ` · ${[data.branch, data.degree].filter(Boolean).join(", ")}`
              : ""}
          </p>
        </div>

        {/* Metrics */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-y border-white/10 py-3">
          <Metric value={String(data.skills.length)} label="Skills" onClick={onOpenSkills} />
          <Metric value={data.cgpa || "—"} label="CGPA" />
          <Metric value={`${data.coveragePercent}%`} label="Coverage" />
        </div>

        {/* Contact & academics */}
        <div className="mt-4">
          <SectionLabel>Contact & academics</SectionLabel>
          <div className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <a
              href={`mailto:${data.email}`}
              className="flex items-center gap-2 text-[13px] tracking-tight text-white/75 transition hover:text-[var(--lime)]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span className="truncate">{data.email}</span>
            </a>
            <div className="flex items-center gap-2 text-[13px] tracking-tight text-white/75">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span className="truncate">{data.branch || data.organizationName}</span>
            </div>
            {data.location ? (
              <div className="flex items-center gap-2 text-[13px] tracking-tight text-white/75">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <span className="truncate">{data.location}</span>
              </div>
            ) : null}
            {data.phone ? (
              <a
                href={`tel:${data.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 text-[13px] tracking-tight text-white/75 transition hover:text-[var(--lime)]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <span>{data.phone}</span>
              </a>
            ) : (
              <div className="flex items-center gap-2 text-[13px] tracking-tight text-white/35">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/25" />
                <span>Phone not added</span>
              </div>
            )}
            {years ? (
              <div className="flex items-center gap-2 text-[13px] tracking-tight text-white/75">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-white/40" />
                <span>{years}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-[13px] tracking-tight text-white/75 sm:col-span-2">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span className="truncate">
                {batch}
                {data.degree ? ` · ${data.degree}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-4 pb-1">
          <SectionLabel>Skills · {data.skills.length}</SectionLabel>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {visibleSkills.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={onOpenSkills}
                className="rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[12px] tracking-tight text-white/85 transition hover:border-[var(--lime)]/40 hover:text-white"
              >
                {s.name}
              </button>
            ))}
            {moreSkills > 0 ? (
              <button
                type="button"
                onClick={onOpenSkills}
                className="rounded-md border border-[var(--lime)]/30 bg-[var(--lime)]/10 px-2.5 py-1 text-[12px] font-medium tracking-tight text-[var(--lime)] transition hover:bg-[var(--lime)]/20"
              >
                +{moreSkills}
              </button>
            ) : null}
            {!data.skills.length ? (
              <p className="text-[13px] tracking-tight text-white/40">No skills on record yet.</p>
            ) : null}
          </div>
          <p className="mt-3 text-[11px] tracking-tight text-white/30">
            {data.passportId} · Evidence-based passport — not a fabricated score.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <p className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
        {children}
      </p>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Metric({
  value,
  label,
  onClick,
}: {
  value: string;
  label: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="text-left transition hover:opacity-90"
    >
      <p className="text-[20px] font-semibold leading-none tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1 text-[11px] tracking-tight text-white/40">{label}</p>
    </Comp>
  );
}
