"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const DESKTOP_VIDEO =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/65fdef53-5686-4659-8761-52d61bf1a4f7.mp4";
const MOBILE_VIDEO =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/9a30e5e9-9f03-4755-9bc1-7bcf1510aab3.mp4";
const POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/33150b94-09f7-47da-a7c9-3ae76c2dd7eb.jpg";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const steps = [
  {
    title: "Upload evidence",
    body: "Students submit PDF or image certificates into private storage. Extraction prepares fields for review — never treated as proof.",
  },
  {
    title: "Verify with evidence",
    body: "Trusted issuer adapters, safe QR checks, or institutional review. Green stamps only when a trusted source confirms the credential.",
  },
  {
    title: "Map skills honestly",
    body: "Skills link to credential, assessment, or project evidence. No invented proficiency scores.",
  },
  {
    title: "Share a controlled passport",
    body: "Revocable public links and QR codes show only consented sections to recruiters.",
  },
];

export function NorvaHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const curTime = useRef(0);
  const seeking = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const total = Math.max(track.offsetHeight - window.innerHeight, 1);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !loaded) return;
    let raf = 0;
    const tick = () => {
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5.04;
      const target = progress * Math.max(duration - 1 / 48, 0);
      curTime.current += (target - curTime.current) * 0.2;
      if (!seeking.current && Math.abs(video.currentTime - curTime.current) > 1 / 60) {
        seeking.current = true;
        try {
          video.currentTime = curTime.current;
        } catch {
          seeking.current = false;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onSeeked = () => {
      seeking.current = false;
    };
    video.addEventListener("seeked", onSeeked);
    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [progress, loaded]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  const h = easeInOutQuad(Math.min(1, progress / 0.38));
  const headlineOpacity =
    progress < 0.1 ? 1 : progress > 0.24 ? 0 : 1 - (progress - 0.1) / 0.14;
  const processOpacity =
    progress < 0.08 ? 0 : progress > 0.24 ? 1 : (progress - 0.08) / 0.16;
  const activeStep =
    progress < 0.45 ? 0 : progress < 0.65 ? 1 : progress < 0.82 ? 2 : 3;
  const cueOpacity =
    progress < 0.04 ? 1 : progress > 0.12 ? 0 : 1 - (progress - 0.04) / 0.08;

  return (
    <div className="marketing-night landing-u relative">
      {!loaded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--navy-deep)]">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-[var(--cyan)]/50 animate-spin-slow" />
            <div className="absolute inset-3 rounded-full border border-dotted border-[var(--cyan)]/30" />
            <div className="h-3 w-3 rotate-45 bg-[var(--lime)]" />
          </div>
        </div>
      ) : null}

      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 grid h-[58px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
        <nav className="pointer-events-auto hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70 md:flex">
          <a href="#process" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#trust" className="transition-colors hover:text-white">
            Trust model
          </a>
        </nav>
        <Link
          href="/"
          className="pointer-events-auto justify-self-center text-[15px] font-bold uppercase tracking-[0.08em] text-white sm:text-[19px]"
        >
          Skill Passport
        </Link>
        <div className="pointer-events-auto flex justify-end gap-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-full bg-[var(--pill)] px-4 text-sm font-semibold text-white transition hover:-translate-y-px"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-full bg-[var(--lime)] px-4 text-sm font-semibold text-[var(--navy-deep)] transition hover:-translate-y-px"
          >
            Request access
          </Link>
        </div>
      </header>

      <div ref={trackRef} className="relative h-[420vh]" id="process">
        <div className="sticky top-0 h-screen overflow-hidden">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO}
            poster={POSTER}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setLoaded(true)}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                "linear-gradient(180deg, rgba(15,22,38,0.62) 0%, rgba(15,22,38,0.08) 34%, rgba(15,22,38,0.12) 62%, rgba(15,22,38,0.58) 100%)",
                "linear-gradient(90deg, rgba(15,22,38,0.72) 0%, rgba(15,22,38,0.35) 32%, rgba(15,22,38,0) 58%)",
              ].join(", "),
            }}
          />

          <div
            className="absolute inset-x-0 top-[min(92px,12vh)] z-10 mx-auto max-w-5xl px-6 text-center"
            style={{
              opacity: headlineOpacity,
              transform: `perspective(900px) translateY(${-34 * h}vh) rotateX(${62 * h}deg) scale(${1 - 0.12 * h})`,
              transformOrigin: "50% 100%",
              pointerEvents: headlineOpacity < 0.2 ? "none" : "auto",
            }}
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--lime)] sm:text-xs">
              Smart Skill Passport
            </p>
            <h1 className="text-[clamp(2.35rem,6.2vw,5.25rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white">
              The new standard
              <br />
              in skill identity
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-lg">
              Evidence-backed credentials. Honest verification. Placement-ready passports for
              colleges — without fabricated scores or green ticks on upload.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-full bg-[var(--lime)] px-6 text-sm font-semibold text-[var(--navy-deep)] transition hover:-translate-y-px"
              >
                Request college access
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Student sign in
              </Link>
            </div>
          </div>

          <p
            className="absolute inset-x-0 bottom-9 z-10 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-white/70"
            style={{ opacity: cueOpacity }}
          >
            <span className="border-b border-white/40 pb-1">Scroll to discover our process</span>
          </p>

          <ol
            className="absolute bottom-8 left-4 z-10 w-[min(430px,calc(100%-2rem))] space-y-1 sm:left-8"
            style={{
              opacity: processOpacity,
              transform: `translateY(${(1 - processOpacity) * 40}px)`,
              pointerEvents: processOpacity < 0.2 ? "none" : "auto",
            }}
            aria-label="How Smart Skill Passport works"
          >
            {steps.map((step, index) => {
              const active = index === activeStep;
              return (
                <li key={step.title} className="grid grid-cols-[36px_1fr] gap-3">
                  <div
                    className={
                      active
                        ? "flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-semibold text-[var(--navy-deep)]"
                        : "flex h-9 w-9 items-center justify-center text-[12.5px] font-medium text-white/70"
                    }
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 pb-2">
                    <p
                      className={
                        active
                          ? "text-lg font-medium leading-tight text-white"
                          : "text-[12.5px] font-medium leading-tight text-white/70"
                      }
                    >
                      {step.title}
                    </p>
                    <div
                      className="grid transition-[grid-template-rows] duration-450 ease-out"
                      style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="mt-2 border-l border-white/20 pl-3 text-sm leading-relaxed text-white/70">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <section id="trust" className="relative border-t border-white/10 px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--cyan)]">
            Trust model
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Verification is evidence — not a decorative badge.
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "Issuer confirmed",
                body: "Adapters only mark credentials verified when a trusted source confirms them.",
              },
              {
                title: "Institution reviewed",
                body: "College review is labeled separately from issuer verification — never confused.",
              },
              {
                title: "Honest unavailable",
                body: "Missing OCR or issuer configuration surfaces as Unavailable — never silently simulated.",
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-white/15 pt-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 md:grid-cols-3">
            {[
              {
                title: "Students",
                body: "Upload certificates, confirm extractions, track verification, and share a digital passport.",
              },
              {
                title: "College admins",
                body: "Review the verification queue, inspect evidence, and export placement-ready insights.",
              },
              {
                title: "Recruiters",
                body: "Search consented passports with credential evidence — never private storage links.",
              },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--lime)]">
                  {item.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-full bg-[var(--lime)] px-6 text-sm font-semibold text-[var(--navy-deep)]"
            >
              Create college account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white"
            >
              Student sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
