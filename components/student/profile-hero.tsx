"use client";

import Link from "next/link";
import { ArrowLeft, LogIn, Trophy } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { initials } from "@/lib/utils";

export type ProfileHeroData = {
  fullName: string;
  passportId: string;
  organizationName: string;
  degree: string | null;
  branch: string | null;
  graduationYear: number | null;
  skills: { id: string; name: string }[];
  certificates: {
    id: string;
    title: string;
    verification_status: string;
  }[];
  projectsCount: number;
  institutionReviewedCount: number;
  skillsCount: number;
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "Student", last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function watermarkFromPassport(passportId: string, year: number | null) {
  const digits = passportId.replace(/\D/g, "");
  if (digits.length >= 2) return digits.slice(-2);
  if (year) return String(year).slice(-2);
  return "01";
}

export function StudentProfileHero({ data }: { data: ProfileHeroData }) {
  const { first, last } = splitName(data.fullName);
  const mark = watermarkFromPassport(data.passportId, data.graduationYear);
  const skillsN = useCountUp(data.skillsCount, 400);
  const reviewedN = useCountUp(data.institutionReviewedCount, 700);
  const projectsN = useCountUp(data.projectsCount, 1000);

  const chips = [
    ...data.skills.slice(0, 3).map((s) => ({
      id: s.id,
      label: s.name.slice(0, 2).toUpperCase(),
      title: s.name,
    })),
    ...data.certificates.slice(0, 2).map((c) => ({
      id: c.id,
      label: c.title.slice(0, 2).toUpperCase(),
      title: c.title,
    })),
  ].slice(0, 4);

  return (
    <section className="passport-phones-hero relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1a2438 0%, #0a0e1c 55%, #05070f 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(7,155,131,0.18), transparent 45%), radial-gradient(circle at 80% 70%, rgba(198,255,46,0.08), transparent 40%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] z-[1] -translate-x-1/2 -translate-y-1/2 select-none font-extrabold leading-none text-white/[0.06]"
        style={{ fontSize: "clamp(180px, 42vw, 520px)", letterSpacing: "-0.08em" }}
      >
        {mark}
      </div>

      <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/student"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lime)] text-[10px] font-extrabold text-[var(--navy)]">
              SP
            </div>
            <span className="hidden text-sm font-semibold tracking-tight text-white sm:inline">
              Skill Passport
            </span>
          </div>
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#overview" className="transition hover:text-white">
            Overview
          </a>
          <a href="#evidence" className="transition hover:text-white">
            Evidence
          </a>
          <Link href="/student/journey" className="transition hover:text-white">
            Journey
          </Link>
        </nav>

        <Link
          href="/student/settings"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--navy)]"
        >
          <LogIn className="h-4 w-4" />
          Edit profile
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1400px] grid-cols-1 px-5 pb-8 pt-2 md:grid-cols-[1fr_minmax(280px,42%)_1fr] md:px-10 md:pb-10">
        <div className="relative z-20 flex flex-col justify-between py-4 md:py-8">
          <div className="animate-fade-slide-up delay-200">
            <div className="mb-2 flex items-center gap-2 text-[15px] text-white/55">
              <span>{data.organizationName}</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[9px] font-bold text-[var(--lime)]">
                UN
              </span>
            </div>
            <h2
              className="max-w-[14ch] font-normal text-white"
              style={{
                fontSize: "clamp(32px, 4.2vw, 56px)",
                lineHeight: 0.92,
                letterSpacing: "-0.05em",
              }}
            >
              {data.branch || "Computer Science"}
              <br />
              {data.degree || "B.Tech"}
              {data.graduationYear ? ` ’${String(data.graduationYear).slice(-2)}` : ""}
            </h2>
            <p className="mt-3 text-sm text-white/45">{data.passportId}</p>
          </div>

          <div className="animate-fade-slide-up delay-500 mt-10 md:mt-0">
            <div className="mb-4 flex items-center gap-2">
              {chips.map((chip, i) => (
                <div
                  key={chip.id}
                  title={chip.title}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0a0e1c] bg-white/10 text-[11px] font-bold text-white backdrop-blur-md"
                  style={{ marginLeft: i === 0 ? 0 : -10 }}
                >
                  {chip.label}
                </div>
              ))}
              <Link
                href="/student/skills"
                className="ml-1 flex h-11 items-center justify-center rounded-full bg-[var(--lime)] px-4 text-xs font-bold text-[var(--navy)]"
              >
                All
              </Link>
            </div>
            <h1
              id="overview"
              className="animate-speed-reveal delay-700 font-semibold text-white"
              style={{
                fontSize: "clamp(48px, 7vw, 92px)",
                lineHeight: 0.82,
                letterSpacing: "-0.05em",
              }}
            >
              {first}
              {last ? (
                <>
                  <br />
                  {last}
                </>
              ) : null}
            </h1>
            <p className="mt-3 max-w-xs text-sm text-white/45">
              Skills, certificates, and projects with evidence — not fabricated readiness scores.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-center">
          <div className="animate-scale-in delay-300 relative flex h-[min(70vh,640px)] w-full max-w-[520px] items-end justify-center">
            <div
              className="absolute bottom-[8%] left-1/2 h-[55%] w-[70%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(7,155,131,0.45) 0%, rgba(198,255,46,0.12) 45%, transparent 70%)",
              }}
            />
            <div className="relative z-[2] flex h-full w-full flex-col items-center justify-end pb-6">
              <div className="relative flex h-[78%] w-[78%] flex-col items-center justify-center overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
                <div className="relative z-[1] flex h-40 w-40 items-center justify-center rounded-full border border-white/20 bg-[var(--navy)]/60 text-5xl font-semibold tracking-tight text-[var(--lime)] backdrop-blur-md">
                  {initials(data.fullName)}
                </div>
                <p className="relative z-[1] mt-6 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                  Digital passport
                </p>
                <p className="relative z-[1] mt-2 text-lg font-semibold text-white/90">{data.passportId}</p>
              </div>
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] h-[42%]"
                style={{
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  mask: "linear-gradient(to bottom, transparent 0%, black 55%)",
                  WebkitMask: "linear-gradient(to bottom, transparent 0%, black 55%)",
                }}
              />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[4] h-[35%] bg-gradient-to-t from-[#0a0e1c] via-[#0a0e1c]/80 to-transparent" />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-col justify-between py-4 md:items-end md:py-8">
          <div className="animate-fade-slide-up delay-400 w-full max-w-[280px] md:ml-auto">
            <p className="mb-2 text-right text-xs uppercase tracking-[0.14em] text-white/45">
              Skill journey
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
              <svg viewBox="0 0 240 140" className="h-auto w-full" aria-hidden>
                <path
                  d="M18 110 C 50 110, 55 30, 100 30 S 150 110, 222 55"
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M100 30 C 120 30, 130 70, 155 85"
                  fill="none"
                  stroke="#c6ff2e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(198,255,46,0.8))" }}
                />
                <circle cx="18" cy="110" r="5" fill="#0a0e1c" stroke="white" strokeWidth="1.5" />
                <circle cx="100" cy="30" r="6" fill="#0a0e1c" stroke="#c6ff2e" strokeWidth="2" />
                <circle cx="222" cy="55" r="5" fill="#0a0e1c" stroke="white" strokeWidth="1.5" />
              </svg>
              <div className="mt-2 flex justify-between text-[10px] text-white/45">
                <span>Foundations</span>
                <span className="text-[var(--lime)]">Build</span>
                <span>Evidence</span>
              </div>
            </div>
          </div>

          <div id="evidence" className="animate-fade-slide-up delay-600 mt-10 w-full max-w-[300px] md:mt-0 md:text-right">
            <div className="mb-3 flex items-center gap-2 md:justify-end">
              <span className="text-sm text-white/55">Evidence on record</span>
              <Trophy className="h-4 w-4 text-[var(--lime)]" />
            </div>
            <div className="space-y-1">
              <p
                className="bg-clip-text font-semibold tracking-[-0.06em] text-transparent"
                style={{
                  fontSize: "clamp(64px, 9vw, 110px)",
                  lineHeight: 0.72,
                  backgroundImage:
                    "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.4) 50%, transparent 85%)",
                }}
              >
                {skillsN}
              </p>
              <p
                className="bg-clip-text font-semibold tracking-[-0.06em] text-transparent"
                style={{
                  fontSize: "clamp(64px, 9vw, 110px)",
                  lineHeight: 0.72,
                  backgroundImage:
                    "linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 55%, transparent 85%)",
                }}
              >
                {reviewedN}
              </p>
              <p
                className="font-semibold tracking-[-0.06em] text-[var(--lime)]"
                style={{ fontSize: "clamp(72px, 10vw, 120px)", lineHeight: 0.72 }}
              >
                {projectsN}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/45 md:text-right">
              <span>Skills</span>
              <span>Reviewed certs</span>
              <span>Projects</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 md:justify-end">
              <Link
                href="/student/certificates"
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                Certificates
              </Link>
              <Link
                href="/student/passport"
                className="rounded-full bg-[var(--lime)] px-3 py-1.5 text-xs font-semibold text-[var(--navy)]"
              >
                Share passport
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
