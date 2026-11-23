"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Globe2, Search } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_202655_a7f5aca0-2f80-4bc9-bcb5-96ac95662003.mp4";
const HERO_POSTER =
  "https://images.unsplash.com/photo-1490750965869-c594aa215dcf?auto=format&fit=crop&w=2200&q=80";

const talent = [
  {
    name: "Aisha R.",
    place: "CSE · Class of ’26",
    meta: "12 evidenced skills",
    rate: "Coverage 72%",
    mode: "Internship",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Kabir M.",
    place: "IT · Class of ’27",
    meta: "8 reviewed certs",
    rate: "Coverage 64%",
    mode: "Full-time",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    name: "Meera S.",
    place: "AI&DS · Class of ’26",
    meta: "5 projects on record",
    rate: "Coverage 81%",
    mode: "Remote-ready",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  },
];

const faces = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&h=80&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&h=80&q=80",
];

const features = [
  {
    title: "Evidence, not scores",
    body: "Skills link to certificates, projects, and assessments — never invented readiness rankings.",
  },
  {
    title: "Institutional review",
    body: "Colleges verify credentials in queue. Green stamps only when a trusted source confirms them.",
  },
  {
    title: "Recruiter-ready passports",
    body: "Share consented sections with revocable links. Students stay in control of what is visible.",
  },
];

function Butterfly({
  className,
  delay,
  duration,
  scale = 1,
}: {
  className?: string;
  delay: string;
  duration: string;
  scale?: number;
}) {
  return (
    <div
      className={`pointer-events-none absolute gt-butterfly ${className ?? ""}`}
      style={{ animationDelay: delay, animationDuration: duration }}
      aria-hidden
    >
      <div style={{ transform: `scale(${scale})` }}>
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
          <g className="gt-wing-l">
            <ellipse cx="10" cy="12" rx="9" ry="11" fill="rgba(255,255,255,0.78)" />
            <ellipse cx="10" cy="12" rx="6" ry="7" fill="rgba(255,210,80,0.55)" />
          </g>
          <g className="gt-wing-r">
            <ellipse cx="26" cy="12" rx="9" ry="11" fill="rgba(255,255,255,0.78)" />
            <ellipse cx="26" cy="12" rx="6" ry="7" fill="rgba(255,180,60,0.5)" />
          </g>
          <rect x="16.5" y="6" width="3" height="14" rx="1.5" fill="rgba(40,30,10,0.55)" />
        </svg>
      </div>
    </div>
  );
}

function Petal({
  className,
  delay,
  duration,
  color,
}: {
  className?: string;
  delay: string;
  duration: string;
  color: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute gt-petal block h-3 w-2 rounded-full ${className ?? ""}`}
      style={{
        animationDelay: delay,
        animationDuration: duration,
        background: color,
        boxShadow: `0 0 10px ${color}`,
      }}
      aria-hidden
    />
  );
}

function HeroNatureLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
      <Butterfly className="left-[-40px] top-[22%]" delay="0s" duration="16s" scale={1.1} />
      <Butterfly className="left-[-40px] top-[48%]" delay="2.5s" duration="19s" scale={0.85} />
      <Butterfly className="left-[-40px] top-[68%]" delay="5s" duration="14s" scale={1} />
      <Butterfly className="left-[-40px] top-[34%]" delay="8s" duration="21s" scale={0.7} />
      <Butterfly className="left-[-40px] top-[58%]" delay="11s" duration="17s" scale={0.95} />

      <Petal className="left-[12%] top-[-10%]" delay="0s" duration="11s" color="rgba(255,200,60,0.85)" />
      <Petal className="left-[28%] top-[-10%]" delay="1.4s" duration="13s" color="rgba(255,240,180,0.9)" />
      <Petal className="left-[46%] top-[-10%]" delay="2.8s" duration="10s" color="rgba(255,170,40,0.8)" />
      <Petal className="left-[62%] top-[-10%]" delay="0.8s" duration="14s" color="rgba(255,220,120,0.85)" />
      <Petal className="left-[78%] top-[-10%]" delay="3.5s" duration="12s" color="rgba(255,190,70,0.75)" />
      <Petal className="left-[88%] top-[-10%]" delay="5s" duration="15s" color="rgba(255,250,200,0.8)" />
      <Petal className="left-[38%] top-[-10%]" delay="6.2s" duration="11s" color="rgba(255,160,50,0.7)" />
      <Petal className="left-[55%] top-[-10%]" delay="4.1s" duration="13s" color="rgba(255,230,140,0.8)" />
    </div>
  );
}

function GlassTalentCard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/45 bg-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
      <div className="flex items-center justify-between border-b border-white/25 px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] font-medium tracking-tight text-[#111]/85">
          <Search className="h-3.5 w-3.5" />
          Frontend
        </div>
        <div className="flex items-center gap-1.5 text-[12px] tracking-tight text-[#111]/65">
          <Globe2 className="h-3.5 w-3.5" />
          Campus
        </div>
      </div>

      <ul className="divide-y divide-white/20">
        {talent.map((t) => (
          <li key={t.name} className="flex items-center gap-3 px-4 py-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white/80"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[14px] font-semibold tracking-tight text-[#111]">
                  {t.name}
                </p>
                <p className="shrink-0 text-[12px] font-semibold tracking-tight text-[#111]/75">
                  {t.rate}
                </p>
              </div>
              <p className="truncate text-[12px] tracking-tight text-[#111]/55">
                {t.place} · {t.meta}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-white/55 px-2.5 py-1 text-[11px] tracking-tight text-[#111]/65 sm:inline">
              {t.mode}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-white/25 px-4 py-2.5 text-center text-[11px] tracking-tight text-[#111]/55">
        and 120+ passports shared this semester
      </p>
    </div>
  );
}

/** Floating passport tiles — the 3D depth layer around the glass panel */
function FloatingPassport({
  className,
  name,
  mark,
  rotate,
}: {
  className?: string;
  name: string;
  mark: string;
  rotate: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute hidden w-[148px] select-none rounded-2xl border border-white/40 bg-white/30 p-3 shadow-2xl backdrop-blur-md lg:block ${className ?? ""}`}
      style={{ transform: rotate, transformStyle: "preserve-3d" }}
      aria-hidden
    >
      <div className="mb-2 h-16 rounded-xl bg-gradient-to-br from-white/50 to-white/10" />
      <p className="text-[11px] font-semibold tracking-tight text-[#111]">{name}</p>
      <p className="text-[10px] tracking-tight text-[#111]/50">SSP · {mark}</p>
    </div>
  );
}

function Hero3DStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Math.max(-1, Math.min(1, py)) * -10,
      y: Math.max(-1, Math.min(1, px)) * 14,
    });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      ref={stageRef}
      className="relative flex min-h-[520px] flex-col items-center justify-center px-4 pb-14 pt-6 sm:min-h-[560px] sm:pb-16"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "1200px" }}
    >
      {/* Soft ground glow under the 3D stack */}
      <div
        className="pointer-events-none absolute bottom-[18%] left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-full bg-black/25 blur-3xl"
        aria-hidden
      />

      {/* 3D scene */}
      <div
        className="relative w-full max-w-[440px] transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Depth plates behind the glass card */}
        <div
          className="absolute inset-x-3 top-3 -z-10 h-[calc(100%-8px)] rounded-[22px] border border-white/20 bg-white/15 backdrop-blur-sm"
          style={{ transform: "translateZ(-40px) scale(0.96)" }}
          aria-hidden
        />
        <div
          className="absolute inset-x-6 top-6 -z-20 h-[calc(100%-12px)] rounded-[22px] border border-white/10 bg-white/10"
          style={{ transform: "translateZ(-80px) scale(0.92)" }}
          aria-hidden
        />

        <FloatingPassport
          className="-left-[132px] top-8"
          name="Priya N."
          mark="8821"
          rotate="rotateY(18deg) rotateZ(-6deg) translateZ(30px)"
        />
        <FloatingPassport
          className="-right-[128px] bottom-10"
          name="Arjun V."
          mark="4402"
          rotate="rotateY(-16deg) rotateZ(5deg) translateZ(24px)"
        />

        <div
          className="relative gt-float"
          style={{ transform: "translateZ(48px)", transformStyle: "preserve-3d" }}
        >
          <GlassTalentCard />
        </div>
      </div>

      <div
        className="gt-rise-3 relative z-10 mt-9 flex items-center gap-2.5"
        style={{ transform: `translateZ(20px) translateY(${tilt.x * -0.4}px)` }}
      >
        <Link
          href="/login"
          className="inline-flex items-center rounded-full bg-white px-6 py-3 text-[14px] font-semibold tracking-tight text-[#111] shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition hover:bg-white/92"
        >
          Get early access
        </Link>
        <Link
          href="/login"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111] shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition hover:bg-white/92"
          aria-label="Continue to login"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

export function GlobalTalentLanding() {
  return (
    <div className="gt-landing min-h-screen bg-[#f7f5f2] text-[#111]">
      <style jsx global>{`
        .gt-landing {
          --font-gt: "Albert Sans", "Manrope", ui-sans-serif, system-ui, sans-serif;
          font-family: var(--font-gt);
        }
        @keyframes gt-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gt-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .gt-rise {
          animation: gt-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .gt-rise-2 {
          animation: gt-rise 0.9s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .gt-rise-3 {
          animation: gt-rise 1s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .gt-float {
          animation: gt-float 5.5s ease-in-out infinite;
        }
        @keyframes gt-fly {
          0% {
            transform: translate(-10vw, 0) rotate(-8deg);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            transform: translate(55vw, -28px) rotate(6deg);
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translate(110vw, 18px) rotate(-4deg);
            opacity: 0;
          }
        }
        @keyframes gt-wing-l {
          0%,
          100% {
            transform: scaleX(1) rotate(-6deg);
          }
          50% {
            transform: scaleX(0.35) rotate(8deg);
          }
        }
        @keyframes gt-wing-r {
          0%,
          100% {
            transform: scaleX(1) rotate(6deg);
          }
          50% {
            transform: scaleX(0.35) rotate(-8deg);
          }
        }
        @keyframes gt-petal-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.95;
          }
          100% {
            transform: translateY(110vh) translateX(40px) rotate(260deg);
            opacity: 0;
          }
        }
        .gt-butterfly {
          animation-name: gt-fly;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .gt-wing-l {
          transform-origin: 18px 14px;
          animation: gt-wing-l 0.22s ease-in-out infinite;
        }
        .gt-wing-r {
          transform-origin: 18px 14px;
          animation: gt-wing-r 0.22s ease-in-out infinite;
        }
        .gt-petal {
          animation-name: gt-petal-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .gt-rise,
          .gt-rise-2,
          .gt-rise-3,
          .gt-float,
          .gt-butterfly,
          .gt-wing-l,
          .gt-wing-r,
          .gt-petal {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <section className="gt-rise relative overflow-hidden rounded-[28px] sm:rounded-[36px]">
          <video
            className="absolute inset-0 h-full w-full scale-105 object-cover"
            src={HERO_VIDEO}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/45" />
          <HeroNatureLayer />

          <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <Link href="/" className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-extrabold tracking-tight text-[#111]">
                SP
              </span>
              <span className="text-[15px] font-semibold tracking-tight">Skill Passport</span>
            </Link>

            <nav className="hidden items-center gap-1.5 md:flex">
              {["Platform", "Evidence", "Colleges", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="rounded-full bg-black/35 px-3.5 py-1.5 text-[13px] tracking-tight text-white/95 backdrop-blur-md transition hover:bg-black/50"
                >
                  {item}
                </a>
              ))}
            </nav>

            <Link
              href="/login"
              className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold tracking-tight text-[#111] transition hover:bg-white/90"
            >
              Student login
            </Link>
          </header>

          <div className="relative z-10">
            <Hero3DStage />
          </div>
        </section>

        <section className="gt-rise-3 mt-10 grid gap-8 md:mt-14 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-12">
          <h1 className="max-w-[14ch] text-[clamp(36px,6vw,64px)] font-semibold leading-[0.95] tracking-[-0.045em] text-[#111]">
            Your evidence-based skill passport
          </h1>
          <div className="md:pb-2 md:text-right">
            <div className="mb-3 flex md:justify-end">
              <div className="flex -space-x-2">
                {faces.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-[#f7f5f2]"
                  />
                ))}
              </div>
            </div>
            <p className="text-[15px] leading-snug tracking-tight text-[#111]/60 md:ml-auto md:max-w-[34ch]">
              Discover verified student skills, certificates, and projects — built for colleges,
              trusted by recruiters.
            </p>
          </div>
        </section>

        <section id="platform" className="mt-16 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-[22px] border border-black/5 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.07)]"
            >
              <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111]">{f.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed tracking-tight text-[#111]/55">{f.body}</p>
            </div>
          ))}
        </section>

        <section
          id="evidence"
          className="mt-6 overflow-hidden rounded-[28px] bg-[#111] px-6 py-10 text-white sm:px-10 sm:py-12"
        >
          <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/40">For colleges</p>
              <h2 className="mt-2 max-w-[18ch] text-[clamp(26px,3.5vw,40px)] font-semibold leading-[1.05] tracking-[-0.04em]">
                One workspace for verification, journeys, and placement
              </h2>
            </div>
            <ul className="space-y-3 text-[14px] tracking-tight text-white/65">
              <li className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                Admin queues for certificate review and audit history
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                Student skill journeys mapped to evidenced milestones
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                Recruiter views only when students consent to share
              </li>
            </ul>
          </div>
        </section>

        <section id="colleges" className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { role: "Students", cta: "Open student login", href: "/login", hint: "Build your passport" },
            { role: "Admins", cta: "College console", href: "/login", hint: "Verify & analytics" },
            { role: "Recruiters", cta: "Browse passports", href: "/login", hint: "Consent-first search" },
          ].map((r) => (
            <Link
              key={r.role}
              href={r.href}
              className="group rounded-[22px] border border-black/5 bg-white p-6 transition hover:border-black/15"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[#111]/40">{r.hint}</p>
              <p className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-[#111]">{r.role}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium tracking-tight text-[#111]/70 group-hover:text-[#111]">
                {r.cta}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        <section id="pricing" className="mt-16 text-center">
          <h2 className="text-[clamp(26px,3.5vw,40px)] font-semibold tracking-[-0.04em] text-[#111]">
            Built for campus placement — not vanity scores
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] tracking-tight text-[#111]/55">
            Start with the demo campus, then connect your college organization when you are ready.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#111] px-6 py-3 text-[14px] font-semibold tracking-tight text-white transition hover:bg-black"
            >
              Request demo access
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-[14px] font-semibold tracking-tight text-[#111] transition hover:border-black/30"
            >
              Create account
            </Link>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-black/8 pt-8 text-[12px] tracking-tight text-[#111]/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Smart Skill Passport</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-[#111]">
              Login
            </Link>
            <Link href="/signup" className="hover:text-[#111]">
              Sign up
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
