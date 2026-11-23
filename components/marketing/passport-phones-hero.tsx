"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { useCountUp } from "@/hooks/use-count-up";

const BG =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260709_152331_bd312d1a-1f20-46b9-9b68-12bcdcf6d53e.png&w=1280&q=85";

const PROFILE_MENU = [
  { label: "Dashboard", href: "/student" },
  { label: "My Journey", href: "/student/journey" },
  { label: "Certificates", href: "/student/certificates" },
] as const;

export type PassportPhonesHeroProps = {
  mode?: "marketing" | "profile";
  studentName?: string | null;
  passportId?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
};

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "Student", last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function ScreenBackground() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BG} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="absolute inset-0 z-[1] bg-black/60" />
    </>
  );
}

function PhoneNav({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-30 mt-[20px] flex h-14 items-center justify-between px-5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--lime)] text-[10px] font-extrabold text-[var(--navy)]">
          SP
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">Skill Passport</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/student/settings"
          className="flex h-14 w-14 items-center justify-center bg-white"
          aria-label="Edit profile"
        >
          <span className="text-xs font-bold text-[var(--navy)]">ME</span>
        </Link>
        <button
          type="button"
          onClick={onMenu}
          className="flex h-14 w-14 flex-col items-center justify-center gap-[5px]"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
          aria-label="Open menu"
        >
          <span className="h-[2px] w-[21px] rounded-full bg-white" />
          <span className="h-[2px] w-[10px] rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
}

function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col px-6 pb-8 pt-16 transition-opacity duration-[400ms] ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{
        background: "linear-gradient(160deg, #0f1626 0%, #0d3d36 40%, #079b83 100%)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-8 text-white"
        aria-label="Close menu"
      >
        <X className="h-7 w-7" />
      </button>
      <nav className="mt-10 flex flex-col gap-5">
        {PROFILE_MENU.map((link, i) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-3xl font-bold tracking-tight text-white transition-colors hover:text-[var(--lime)]"
            style={{
              transform: open ? "translateX(0)" : "translateX(-20px)",
              opacity: open ? 1 : 0,
              transition: `transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.08}s, opacity 0.5s ease ${0.1 + i * 0.08}s`,
            }}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/student"
        className="mt-auto block w-full bg-white py-4 text-center text-sm font-semibold text-[var(--navy)]"
        onClick={onClose}
      >
        Back to dashboard
      </Link>
    </div>
  );
}

function ScreenPassportHero({
  onMenu,
  studentName,
  passportId,
  degree,
  branch,
  graduationYear,
}: {
  onMenu: () => void;
  studentName: string;
  passportId: string;
  degree: string;
  branch: string;
  graduationYear: string;
}) {
  const { first, last } = splitName(studentName);
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden px-5 pb-0 pt-[76px]">
      <ScreenBackground />
      <PhoneNav onMenu={onMenu} />

      <div className="animate-fade-slide-up delay-300 relative z-10 mb-2 mt-4">
        <div className="flex items-center gap-2 text-[16px] text-white/60">
          <span>Campus placement</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)]/20 text-[10px] font-bold text-[var(--lime)]">
            SSP
          </span>
        </div>
        <h2 className="text-[48px] font-normal leading-[0.95] tracking-[-0.05em] text-white">
          Skill
          <br />
          Journey
        </h2>
      </div>

      <div className="absolute inset-0 z-[5] flex items-end justify-center">
        <div className="animate-scale-in delay-500 relative origin-bottom w-[calc(140%-5px)] max-w-none">
          <div className="mx-auto flex h-[420px] w-full items-end justify-center">
            <div className="relative mb-8 w-[78%] overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-b from-white/15 to-white/5 p-5 shadow-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--lime)]">
                Digital passport
              </p>
              <p className="mt-3 text-3xl font-semibold leading-none tracking-tight text-white">
                {first}
                {last ? (
                  <>
                    <br />
                    {last}
                  </>
                ) : null}
              </p>
              <p className="mt-3 text-sm text-white/55">
                {passportId} · {branch || degree || "—"} · {graduationYear}
              </p>
              <div className="mt-6 flex gap-2">
                <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80">Python</span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80">SQL</span>
                <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-white/80">React</span>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-[50%]"
            style={{
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              mask: "linear-gradient(to bottom, transparent 0%, black 50%)",
              WebkitMask: "linear-gradient(to bottom, transparent 0%, black 50%)",
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-0 z-10 px-5 pb-5">
        <div className="animate-fade-slide-up delay-700 mb-3 flex gap-2 overflow-hidden">
          {["Journey", "Skills", "Proof"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white/80 backdrop-blur-md"
            >
              {label}
            </span>
          ))}
        </div>
        <h3 className="animate-speed-reveal delay-800 text-[64px] font-semibold leading-[0.82] tracking-[-0.05em] text-white">
          Learn
          <br />
          Prove
        </h3>
      </div>
    </div>
  );
}

function ScreenJourneyStats({ onMenu }: { onMenu: () => void }) {
  const a = useCountUp(12, 800);
  const b = useCountUp(86, 1000);
  const c = useCountUp(3, 1200);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden px-5 pb-8 pt-[76px]">
      <ScreenBackground />
      <PhoneNav onMenu={onMenu} />

      <div className="animate-fade-slide-up delay-400 relative z-10 mb-4">
        <div className="flex items-center gap-2 text-[16px] text-white/60">
          <span>Career roadmap</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-300">
            OK
          </span>
        </div>
        <h2 className="text-[48px] font-normal leading-[0.95] tracking-[-0.05em] text-white">
          Frontend
          <br />
          Path
        </h2>
      </div>

      <div className="animate-scale-in delay-600 relative z-10 mx-[-20px] flex min-h-0 flex-1 items-center justify-center px-2">
        <div className="relative h-full w-full max-h-[280px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden>
            <path
              d="M20 160 C 70 160, 80 40, 140 40 S 210 160, 300 80"
              fill="none"
              stroke="rgba(198,255,46,0.85)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {[
              [20, 160],
              [140, 40],
              [300, 80],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="8" fill="#0a0e1c" stroke="#c6ff2e" strokeWidth="2" />
                <text x={x} y={y - 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">
                  {["Foundations", "Build", "Evidence"][i]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="animate-fade-slide-up delay-800 relative z-10 mt-auto pt-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
          <span>Evidence on record</span>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[10px] font-bold text-[var(--navy)]">
            ✓
          </span>
        </div>
        <div className="space-y-1">
          <p
            className="bg-clip-text font-semibold tracking-[-0.06em] text-transparent"
            style={{
              fontSize: 110,
              lineHeight: 0.72,
              backgroundImage:
                "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.4) 50%, transparent 85%)",
            }}
          >
            {a}
          </p>
          <p
            className="bg-clip-text font-semibold tracking-[-0.06em] text-transparent"
            style={{
              fontSize: 110,
              lineHeight: 0.72,
              backgroundImage:
                "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.4) 50%, transparent 85%)",
            }}
          >
            {b}
          </p>
          <p
            className="font-semibold tracking-[-0.06em] text-[var(--lime)]"
            style={{ fontSize: 110, lineHeight: 0.72 }}
          >
            {c}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-white/50">
          <span>Skills mapped</span>
          <span>Institution reviewed</span>
          <span>Projects reviewed</span>
        </div>
      </div>
    </div>
  );
}

function ScreenCareerTrack({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <ScreenBackground />
      <PhoneNav onMenu={onMenu} />

      <div className="animate-fade-slide-up delay-300 absolute left-5 top-[100px] z-10">
        <div className="mb-1 flex items-center gap-2 text-[15px] text-white/60">
          <span>Target role</span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-500/30 text-[9px] font-bold text-emerald-200">
            JR
          </span>
        </div>
        <h2
          className="font-normal text-white"
          style={{ fontSize: 52, lineHeight: 0.83, letterSpacing: "-0.08em" }}
        >
          Frontend
          <br />
          Developer
        </h2>
      </div>

      <div className="animate-fade-slide-up delay-500 absolute left-5 top-[245px] z-10">
        <div className="mb-1 flex items-center gap-2 text-sm text-white/60">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/20 text-[9px]">
            M1
          </span>
          <span>Milestone</span>
        </div>
        <p
          className="font-semibold text-[var(--lime)]"
          style={{ fontSize: 120, lineHeight: 0.79, letterSpacing: "-0.08em" }}
        >
          FE-01
        </p>
      </div>

      <div className="animate-fade-slide-left delay-700 absolute left-3 right-3 top-[390px] z-10 w-[calc(100%-24px)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.12em] text-white/50">Next recommended step</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-white">Web foundations</p>
          <p className="mt-1 text-sm text-white/55">
            Build evidence for HTML, CSS, and accessible layout — explore freely, no artificial locks.
          </p>
        </div>
      </div>

      <div className="animate-fade-slide-up delay-900 absolute bottom-0 left-0 right-0 z-10 flex">
        {[
          { name: "Institution reviewed", value: "02", hint: "Credentials" },
          { name: "Skill evidence", value: "04", hint: "Mapped skills" },
        ].map((card) => (
          <div
            key={card.name}
            className="h-[200px] w-1/2 rounded-t-2xl p-3"
            style={{
              background: "rgba(20,20,30,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "none",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-white/60">{card.name}</span>
              <span className="text-[10px] text-white/40">{card.hint}</span>
            </div>
            <p
              className="mt-4 font-semibold text-white"
              style={{ fontSize: 110, lineHeight: 0.79, letterSpacing: "-0.08em" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneScreen({
  children,
}: {
  children: (api: { openMenu: () => void }) => React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative h-[844px] w-[390px]">
      {children({ openMenu: () => setMenuOpen(true) })}
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

export function PassportPhonesHero({
  mode = "profile",
  studentName = "Student",
  passportId = "SSP-—",
  degree = null,
  branch = null,
  graduationYear = null,
}: PassportPhonesHeroProps) {
  const name = studentName?.trim() || "Student";
  const pid = passportId || "SSP-—";
  const year = graduationYear != null ? String(graduationYear) : "—";
  const branchLabel = branch || degree || "—";

  return (
    <section className="passport-phones-hero relative w-full overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BG} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
      <div className="absolute inset-0 z-[1] bg-black/70" />

      <div className="relative z-[3] flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lime)] text-xs font-extrabold text-[var(--navy)]">
            SP
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {mode === "profile" ? "Your profile" : "Smart Skill Passport"}
            </p>
            <p className="text-xs text-white/50">
              {mode === "profile" ? name : "Learn · Prove · Share"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/student" className="hidden text-sm text-white/70 hover:text-white sm:inline">
            Dashboard
          </Link>
          <Link
            href="/student/settings"
            className="rounded-full bg-[var(--lime)] px-4 py-2 text-sm font-semibold text-[var(--navy)]"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <div className="relative z-[2] hidden h-[calc(100vh-72px)] w-full items-center justify-center py-6 md:flex">
        <div className="flex items-end justify-center gap-[2vw]">
          <div className="animate-fade-slide-up delay-300">
            <PhoneMockup>
              <PhoneScreen>
                {({ openMenu }) => (
                  <ScreenPassportHero
                    onMenu={openMenu}
                    studentName={name}
                    passportId={pid}
                    degree={degree || "—"}
                    branch={branchLabel}
                    graduationYear={year}
                  />
                )}
              </PhoneScreen>
            </PhoneMockup>
          </div>
          <div className="animate-fade-slide-up delay-500 -mb-6">
            <PhoneMockup>
              <PhoneScreen>
                {({ openMenu }) => <ScreenJourneyStats onMenu={openMenu} />}
              </PhoneScreen>
            </PhoneMockup>
          </div>
          <div className="animate-fade-slide-up delay-700">
            <PhoneMockup>
              <PhoneScreen>
                {({ openMenu }) => <ScreenCareerTrack onMenu={openMenu} />}
              </PhoneScreen>
            </PhoneMockup>
          </div>
        </div>
      </div>

      <div className="relative z-[2] flex flex-col items-center gap-[50px] px-[20px] py-[20px] md:hidden">
        <div className="animate-fade-slide-up delay-300">
          <PhoneMockup>
            <PhoneScreen>
              {({ openMenu }) => (
                <ScreenPassportHero
                  onMenu={openMenu}
                  studentName={name}
                  passportId={pid}
                  degree={degree || "—"}
                  branch={branchLabel}
                  graduationYear={year}
                />
              )}
            </PhoneScreen>
          </PhoneMockup>
        </div>
        <div className="animate-fade-slide-up delay-500">
          <PhoneMockup>
            <PhoneScreen>{({ openMenu }) => <ScreenJourneyStats onMenu={openMenu} />}</PhoneScreen>
          </PhoneMockup>
        </div>
        <div className="animate-fade-slide-up delay-700">
          <PhoneMockup>
            <PhoneScreen>{({ openMenu }) => <ScreenCareerTrack onMenu={openMenu} />}</PhoneScreen>
          </PhoneMockup>
        </div>
      </div>

      <div className="relative z-[3] mx-auto max-w-3xl px-6 pb-16 pt-4 text-center">
        <p className="text-sm text-white/55">
          Your learning journey, credential evidence, and career path — shown without fabricated
          issuer verification or hiring predictions.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/student/journey"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[var(--navy)]"
          >
            Open My Journey
          </Link>
          <Link
            href="/student/passport"
            className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white"
          >
            Share passport
          </Link>
        </div>
      </div>

      <span className="sr-only">
        <Menu />
      </span>
    </section>
  );
}
