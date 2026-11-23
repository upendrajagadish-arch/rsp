"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogEyebrow,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VerificationStamp } from "@/components/product/verification-stamp";
import {
  JourneyCircuitMap,
  type CircuitCheckpoint,
} from "@/components/student/journey-circuit";
import { PassportCard } from "@/components/student/passport-card";
import { EditProfileForm } from "@/components/student/edit-profile-form";
import { useCountUp } from "@/hooks/use-count-up";
import { cn, initials } from "@/lib/utils";
import type { LookingFor } from "@/lib/journey/types";
import type { VerificationStatus } from "@/types/supabase";

export type StudentHomePanel =
  | "overview"
  | "journey"
  | "certificates"
  | "passport"
  | "projects"
  | "skills"
  | "settings"
  | null;

export type StudentHomeData = {
  fullName: string;
  passportId: string;
  organizationName: string;
  degree: string | null;
  branch: string | null;
  graduationYear: number | null;
  rollNumber: string | null;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  leetcodeUrl: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  cgpa: string | null;
  experienceLevel: string;
  lookingFor: LookingFor;
  preferredRoles: string | null;
  technologies: string[];
  skills: { id: string; name: string; category: string; strongest_evidence: string }[];
  certificates: {
    id: string;
    title: string;
    issuing_organization: string;
    verification_status: VerificationStatus;
  }[];
  projects: { id: string; title: string; description: string | null; url: string | null }[];
  journeyTitle: string | null;
  journeySummary: string | null;
  coveragePercent: number;
  nextActionTitle: string | null;
  nextActionReason: string | null;
  milestones: CircuitCheckpoint[];
};

const NAV_ITEMS: { id: Exclude<StudentHomePanel, null>; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Evidence" },
  { id: "journey", label: "Journey" },
  { id: "certificates", label: "Certificates" },
  { id: "passport", label: "Passport" },
  { id: "projects", label: "Projects" },
  { id: "settings", label: "Edit profile" },
];

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "Student", last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/** Last 4 digits of the student roll number for the hero watermark. */
export function watermarkFromRollNumber(rollNumber: string | null | undefined) {
  const digits = (rollNumber ?? "").replace(/\D/g, "");
  if (digits.length >= 4) return digits.slice(-4);
  if (digits.length > 0) return digits.padStart(4, "0");
  return "0000";
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 text-sm tracking-tight transition-colors",
        active ? "text-white" : "text-white/65 hover:text-white",
      )}
    >
      {label}
    </button>
  );
}

function PanelRow({
  title,
  meta,
  detail,
}: {
  title: string;
  meta?: string;
  detail?: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/10 py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-medium tracking-[-0.03em] text-white">{title}</p>
        {meta ? (
          <p className="shrink-0 text-[12px] capitalize tracking-tight text-[var(--lime)]">{meta}</p>
        ) : null}
      </div>
      {detail ? (
        <div className="mt-1 line-clamp-3 text-[12px] leading-snug tracking-tight text-white/50">
          {detail}
        </div>
      ) : null}
    </div>
  );
}

export function StudentHome({ data }: { data: StudentHomeData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelParam = searchParams.get("panel") as StudentHomePanel;
  const [panel, setPanel] = useState<StudentHomePanel>(panelParam || null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const { first, last } = splitName(data.fullName);
  const mark = watermarkFromRollNumber(data.rollNumber);
  const skillsN = useCountUp(data.skills.length, 400);
  const reviewedN = useCountUp(
    data.certificates.filter((c) => c.verification_status === "institution_reviewed").length,
    700,
  );
  const projectsN = useCountUp(data.projects.length, 1000);

  const openPanel = useCallback(
    (next: StudentHomePanel) => {
      setPanel(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("panel", next);
      else params.delete("panel");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    setPanel(panelParam || null);
  }, [panelParam]);

  const chips = [
    ...data.skills.slice(0, 3).map((s) => ({
      id: s.id,
      label: s.name.slice(0, 2).toUpperCase(),
      title: s.name,
      panel: "skills" as const,
    })),
    ...data.certificates.slice(0, 2).map((c) => ({
      id: c.id,
      label: c.title.slice(0, 2).toUpperCase(),
      title: c.title,
      panel: "certificates" as const,
    })),
  ].slice(0, 4);

  const showPhoto = Boolean(data.avatarUrl) && !avatarBroken;

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

      <header className="relative z-20 flex flex-col gap-4 px-5 py-5 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lime)] text-[10px] font-extrabold text-[#0a0e1c]">
              SP
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Skill Passport</span>
          </div>

          <div className="flex items-center gap-3">
            <NavButton label="Edit profile" onClick={() => openPanel("settings")} />
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white/10"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* One continuous nav row — same style, no icons, no duplicate Journey */}
        <nav className="flex items-center gap-5 overflow-x-auto pb-1 text-sm md:justify-center md:gap-7">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              label={item.label}
              active={panel === item.id}
              onClick={() => openPanel(item.id)}
            />
          ))}
        </nav>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-130px)] max-w-[1400px] grid-cols-1 px-5 pb-8 pt-2 md:grid-cols-[1fr_minmax(280px,42%)_1fr] md:px-10 md:pb-10">
        <div className="relative z-20 flex flex-col justify-between py-4 md:py-8">
          <div className="animate-fade-slide-up delay-200">
            <div className="mb-2 flex items-center gap-2 text-[16px] text-white/55">
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
            <p className="mt-3 text-sm text-white/45">
              {data.passportId}
              {data.rollNumber ? ` · Roll ${data.rollNumber}` : ""}
            </p>
          </div>

          <div className="animate-fade-slide-up delay-500 mt-10 md:mt-0">
            <div className="mb-4 flex items-center gap-2">
              {chips.map((chip, i) => (
                <button
                  key={chip.id}
                  type="button"
                  title={chip.title}
                  onClick={() => openPanel(chip.panel)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#0a0e1c] bg-white/10 text-[11px] font-bold text-white backdrop-blur-md hover:bg-white/20"
                  style={{ marginLeft: i === 0 ? 0 : -10 }}
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => openPanel("skills")}
                className="ml-1 flex h-11 items-center justify-center rounded-full bg-[var(--lime)] px-4 text-xs font-bold text-[#0a0e1c]"
              >
                All
              </button>
            </div>
            <h1
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
            <p className="mt-3 max-w-xs text-[15px] text-white/45">
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
              <button
                type="button"
                onClick={() => openPanel("settings")}
                className="relative flex h-[78%] w-[78%] flex-col items-center justify-center overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-2xl"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_55%)]" />
                {showPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.avatarUrl!}
                    alt={data.fullName}
                    className="relative z-[1] h-40 w-40 rounded-full object-cover ring-2 ring-white/20"
                    onError={() => setAvatarBroken(true)}
                  />
                ) : (
                  <div className="relative z-[1] flex h-40 w-40 items-center justify-center rounded-full border border-white/20 bg-[#0a0e1c]/60 text-5xl font-semibold tracking-tight text-[var(--lime)] backdrop-blur-md">
                    {initials(data.fullName)}
                  </div>
                )}
                <p className="relative z-[1] mt-6 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                  Digital passport
                </p>
                <p className="relative z-[1] mt-2 text-lg font-semibold text-white/90">
                  {data.passportId}
                </p>
                {data.linkedinUrl ? (
                  <p className="relative z-[1] mt-2 text-[11px] text-[var(--lime)]/80">
                    Photo from LinkedIn
                  </p>
                ) : null}
              </button>
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
          <button
            type="button"
            onClick={() => openPanel("journey")}
            className="animate-fade-slide-up delay-400 w-full max-w-[280px] text-left md:ml-auto md:text-right"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/45">Skill journey</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md transition hover:border-white/25">
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
          </button>

          <div className="animate-fade-slide-up delay-600 mt-10 w-full max-w-[300px] md:mt-0 md:text-right">
            <p className="mb-3 text-sm text-white/55">Evidence on record</p>
            <div className="space-y-1">
              <button type="button" onClick={() => openPanel("skills")} className="block w-full md:text-right">
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
              </button>
              <button
                type="button"
                onClick={() => openPanel("certificates")}
                className="block w-full md:text-right"
              >
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
              </button>
              <button
                type="button"
                onClick={() => openPanel("projects")}
                className="block w-full md:text-right"
              >
                <p
                  className="font-semibold tracking-[-0.06em] text-[var(--lime)]"
                  style={{ fontSize: "clamp(72px, 10vw, 120px)", lineHeight: 0.72 }}
                >
                  {projectsN}
                </p>
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/45 md:text-right">
              <span>Skills</span>
              <span>Reviewed certs</span>
              <span>Projects</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={panel === "overview"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogEyebrow>Snapshot</DialogEyebrow>
            <DialogTitle>Overview</DialogTitle>
            <DialogDescription>Your current learning snapshot.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <PanelRow title="Career path" detail={data.journeyTitle ?? "Not set yet"} />
            <PanelRow
              title="Journey coverage"
              meta={`${data.coveragePercent}%`}
              detail="Based on evidenced skills — not a hiring prediction."
            />
            <PanelRow
              title="Next step"
              detail={
                <>
                  <p className="text-white/80">{data.nextActionTitle ?? "Explore your journey"}</p>
                  <p className="mt-1">{data.nextActionReason}</p>
                </>
              }
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "journey"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent className="w-[min(96vw,860px)]">
          <DialogHeader className="flex flex-row items-start justify-between gap-6">
            <div className="min-w-0">
              <DialogEyebrow>Skill journey</DialogEyebrow>
              <DialogTitle>{data.journeyTitle ?? "Career path"}</DialogTitle>
            </div>
            <DialogDescription className="mt-0 max-w-[300px] shrink-0 text-right line-clamp-2">
              {data.journeySummary ?? "Click the road to race stage to stage."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {data.milestones.length ? (
              <JourneyCircuitMap
                pathTitle={data.journeyTitle ?? "Your skill circuit"}
                coveragePercent={data.coveragePercent}
                checkpoints={data.milestones}
              />
            ) : (
              <p className="py-2 text-[13px] tracking-tight text-white/50">
                Complete onboarding to generate your roadmap.
              </p>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "certificates"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogEyebrow>Evidence</DialogEyebrow>
            <DialogTitle>Certificates</DialogTitle>
            <DialogDescription>
              Trusted evidence only — never fake issuer-verified stamps.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {data.certificates.slice(0, 4).map((c) => (
              <PanelRow
                key={c.id}
                title={c.title}
                detail={
                  <>
                    <p>{c.issuing_organization}</p>
                    <div className="mt-2">
                      <VerificationStamp status={c.verification_status} certificateId={c.id} />
                    </div>
                  </>
                }
              />
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "skills"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogEyebrow>Evidence</DialogEyebrow>
            <DialogTitle>Skills</DialogTitle>
            <DialogDescription>Skills with their strongest evidence source.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {data.skills.slice(0, 6).map((s) => (
              <PanelRow
                key={s.id}
                title={s.name}
                meta={s.strongest_evidence.replaceAll("_", " ")}
                detail={s.category}
              />
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "projects"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogEyebrow>Evidence</DialogEyebrow>
            <DialogTitle>Projects</DialogTitle>
            <DialogDescription>Self-submitted and reviewed project evidence.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            {data.projects.slice(0, 4).map((p) => (
              <PanelRow
                key={p.id}
                title={p.title}
                detail={
                  <>
                    <p className="line-clamp-2">{p.description}</p>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-[12px] tracking-tight text-[var(--lime)] hover:underline"
                      >
                        Open project
                      </a>
                    ) : null}
                  </>
                }
              />
            ))}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "passport"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent
          className="w-[min(94vw,420px)] border-0 p-0 shadow-none"
          style={{ background: "transparent" }}
        >
          <DialogTitle className="sr-only">Passport</DialogTitle>
          <DialogDescription className="sr-only">
            Digital skill passport for {data.fullName}
          </DialogDescription>
          <div className="relative">
            <PassportCard
              data={{
                fullName: data.fullName,
                passportId: data.passportId,
                rollNumber: data.rollNumber,
                email: data.email,
                phone: data.phone,
                avatarUrl: data.avatarUrl,
                linkedinUrl: data.linkedinUrl,
                githubUrl: data.githubUrl,
                portfolioUrl: data.portfolioUrl,
                organizationName: data.organizationName,
                degree: data.degree,
                branch: data.branch,
                graduationYear: data.graduationYear,
                location: data.location,
                cgpa: data.cgpa,
                headline: data.headline,
                preferredRoles: data.preferredRoles,
                journeyTitle: data.journeyTitle,
                coveragePercent: data.coveragePercent,
                skills: data.skills,
                certificatesCount: data.certificates.length,
                projectsCount: data.projects.length,
                institutionReviewed: data.certificates.some(
                  (c) => c.verification_status === "institution_reviewed",
                ),
              }}
              onOpenSkills={() => openPanel("skills")}
              onOpenFullProfile={() => openPanel("overview")}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === "settings"} onOpenChange={(o) => !o && openPanel(null)}>
        <DialogContent className="w-[min(96vw,760px)]">
          <DialogHeader>
            <DialogEyebrow>Account</DialogEyebrow>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Details recruiters and software teams expect — keep evidence honest.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[min(72vh,680px)] overflow-y-auto">
            <EditProfileForm
              fullName={data.fullName}
              email={data.email}
              avatarUrl={showPhoto ? data.avatarUrl : null}
              initial={{
                headline: data.headline ?? "",
                phone: data.phone ?? "",
                location: data.location ?? "",
                bio: data.bio ?? "",
                degree: data.degree ?? "",
                branch: data.branch ?? "",
                graduationYear: data.graduationYear ? String(data.graduationYear) : "",
                rollNumber: data.rollNumber ?? "",
                cgpa: data.cgpa ?? "",
                experienceLevel: data.experienceLevel || "beginner",
                lookingFor: data.lookingFor || "both",
                preferredRoles: data.preferredRoles ?? "",
                linkedinUrl: data.linkedinUrl ?? "",
                githubUrl: data.githubUrl ?? "",
                portfolioUrl: data.portfolioUrl ?? "",
                leetcodeUrl: data.leetcodeUrl ?? "",
                technologies: data.technologies.join(", "),
              }}
              onSaved={() => {
                openPanel(null);
                router.refresh();
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  );
}
