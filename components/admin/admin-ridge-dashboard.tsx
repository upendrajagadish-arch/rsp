"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  LogOut,
  Mountain,
  Search,
  Snowflake,
  Star,
  Sun,
  Wind,
} from "lucide-react";
import type { AdminOverviewMetrics } from "@/lib/admin/types";
import { formatDate } from "@/lib/utils";

const PLATE =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4e84f7cd-8250-48e6-8dfa-746b13b73bfb.jpg";
const DRONE =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/48d4c209-86b6-4b1c-b972-4f57e3dafe89.mp4";
const FEATURE =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/8097efdf-745f-4a23-8b33-0bed6ee16bc7.jpg";

type TabId = "slopes" | "altitude" | "seasons" | "types";

const TABS: { id: TabId; label: string; icon?: "mountain" | "snow" }[] = [
  { id: "slopes", label: "Slopes" },
  { id: "altitude", label: "Altitude", icon: "mountain" },
  { id: "seasons", label: "Seasons", icon: "snow" },
  { id: "types", label: "Types" },
];

function u(n: number) {
  return `calc(${n} * var(--u))`;
}

function Asterisk() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9"
        stroke="#2E2D2A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MountainGlyph({ size = 10, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 13 L6.5 5 L9 9 L11 6.5 L14 13 Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminRidgeDashboard({
  metrics,
  userName,
  orgName,
  demo,
}: {
  metrics: AdminOverviewMetrics;
  userName: string;
  orgName: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabId>("altitude");
  const [drawn, setDrawn] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = userName.split(" ")[0] || userName;
  const activeRate = useMemo(() => {
    if (!metrics.registeredStudents) return 0;
    return Math.round((metrics.activeLearners / metrics.registeredStudents) * 100);
  }, [metrics]);

  const maxBranch = Math.max(1, ...metrics.byBranch.map((b) => b.count));
  const midBatch = metrics.byBatch[Math.floor(metrics.byBatch.length / 2)]?.label ?? "—";

  /* Ping-pong drone video (forward then reverse, seamless) */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    video.muted = true;
    video.loop = false;
    let reversing = false;
    let raf = 0;

    const onReady = () => setVideoReady(true);
    video.addEventListener("loadeddata", onReady);

    const onTimeUpdate = () => {
      if (!reversing && video.duration && video.currentTime >= video.duration - 0.06) {
        reversing = true;
        video.pause();
      }
    };

    const step = () => {
      if (reversing) {
        const next = video.currentTime - 1 / 30;
        if (next <= 0.02) {
          reversing = false;
          video.currentTime = 0;
          void video.play().catch(() => undefined);
        } else {
          video.currentTime = next;
        }
      }
      raf = requestAnimationFrame(step);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    void video.play().catch(() => undefined);
    raf = requestAnimationFrame(step);

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("timeupdate", onTimeUpdate);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ~2.8s entrance timeline */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDrawn(true);
      setGaugeValue(activeRate);
      root.querySelectorAll<HTMLElement>("[data-enter]").forEach((el) => {
        el.style.opacity = "1";
      });
      return;
    }

    const nodes = [...root.querySelectorAll<HTMLElement>("[data-enter]")];
    nodes.forEach((el) => {
      const delay = Number(el.dataset.delay ?? 0);
      const kind = el.dataset.enter ?? "fade";
      const from =
        kind === "right"
          ? { opacity: 0, transform: "translateX(36px)" }
          : kind === "up"
            ? { opacity: 0, transform: "translateY(28px)" }
            : kind === "down"
              ? { opacity: 0, transform: "translateY(-18px)" }
              : kind === "title"
                ? { opacity: 0, transform: "translateY(18px)", filter: "blur(10px)" }
                : { opacity: 0 };

      el.animate([from, { opacity: 1, transform: "none", filter: "none" }], {
        duration: kind === "title" ? 900 : 650,
        delay,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      });
    });

    const drawTimer = window.setTimeout(() => setDrawn(true), 1500);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start - 1800) / 900);
      if (t > 0) setGaugeValue(Math.round(activeRate * t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setGaugeValue(activeRate);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(drawTimer);
      cancelAnimationFrame(raf);
    };
  }, [activeRate]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/admin/students?q=${encodeURIComponent(q)}` : "/admin/students");
  }

  const navLinks = [
    { href: "/admin/students", label: "Directory" },
    { href: "/admin/verification-queue", label: "Queue" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/audit", label: "Audit" },
  ];

  return (
    <div className="admin-ridge" ref={rootRef}>
      <div className="admin-ridge-frame">
        <div className="admin-ridge-scene">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="admin-ridge-plate"
            src={PLATE}
            alt=""
            width={1728}
            height={1080}
          />
          <video
            ref={videoRef}
            className={`admin-ridge-video${videoReady ? " is-ready" : ""}`}
            src={DRONE}
            muted
            playsInline
            preload="auto"
          />
        </div>

        <div className="admin-ridge-ui">
          {/* Logo @15,14 — 41×38 */}
          <Link
            href="/admin"
            data-enter="down"
            data-delay="60"
            data-slot="logo"
            className="admin-ridge-glass admin-ridge-pos flex items-center justify-center opacity-0"
            style={{
              left: u(15),
              top: u(14),
              width: u(41),
              height: u(38),
              borderRadius: u(12),
            }}
            aria-label="SSP admin home"
          >
            <Asterisk />
          </Link>

          {/* User pill @62,14 — 38 tall; nav + sign-out live here */}
          <div
            data-enter="down"
            data-delay="120"
            data-slot="user"
            className="admin-ridge-glass admin-ridge-pos relative flex items-center gap-2 opacity-0"
            style={{
              left: u(62),
              top: u(14),
              height: u(38),
              borderRadius: u(12),
              padding: `0 ${u(10)} 0 ${u(12)}`,
            }}
          >
            <span className="admin-ridge-mono text-[10px] opacity-50">::</span>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <span style={{ fontSize: u(18), fontWeight: 400, whiteSpace: "nowrap" }}>
                {userName}
              </span>
              <span
                className="inline-block shrink-0 rounded-full"
                style={{
                  width: u(8),
                  height: u(8),
                  background: "var(--ar-orange)",
                  boxShadow: "0 0 0 2px rgba(245,158,11,.25)",
                }}
              />
            </button>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg opacity-55 transition hover:opacity-100"
                aria-label="Sign out"
                style={{ width: u(28), height: u(28) }}
              >
                <LogOut size={14} />
              </button>
            </form>
            {menuOpen ? (
              <div
                role="menu"
                className="admin-ridge-glass absolute top-full left-0 z-30 mt-2 min-w-[160px] overflow-hidden py-2"
                style={{ borderRadius: u(12) }}
              >
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="admin-ridge-mono block px-3 py-2 text-[10px] transition hover:bg-black/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          {/* Breadcrumb @15,73 */}
          <p
            data-enter="fade"
            data-delay="220"
            data-slot="crumb"
            className="admin-ridge-mono admin-ridge-title-shadow admin-ridge-pos opacity-0"
            style={{
              left: u(15),
              top: u(73),
              fontSize: u(12.6),
              color: "#fff",
              textTransform: "none",
              letterSpacing: "0.02em",
              margin: 0,
            }}
          >
            <Link href="/admin/students" className="hover:underline">
              Back to Directory
            </Link>
            {"  "}
            {orgName} / Overview /{demo ? " Demo /" : ""}
          </p>

          {/* Title @20,86 — 96px */}
          <h1
            data-enter="title"
            data-delay="320"
            data-slot="title"
            className="admin-ridge-title admin-ridge-title-shadow admin-ridge-pos opacity-0"
            style={{
              left: u(20),
              top: u(86),
              margin: 0,
              color: "#fff",
              fontWeight: 300,
              fontSize: u(96),
              letterSpacing: "-0.045em",
              lineHeight: 1,
              maxWidth: u(780),
            }}
          >
            Student Ops
          </h1>

          {/* Chips @15,198 — 32 tall */}
          <div
            data-enter="up"
            data-delay="480"
            data-slot="chips"
            className="admin-ridge-pos flex flex-wrap gap-2 opacity-0"
            style={{ left: u(15), top: u(198) }}
          >
            <div
              className="admin-ridge-mono flex items-center gap-2"
              style={{
                height: u(32),
                borderRadius: u(9),
                background: "var(--ar-peach)",
                padding: `0 ${u(12)}`,
                fontSize: u(14),
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: u(18),
                  height: u(18),
                  background: "var(--ar-orange)",
                  color: "#fff",
                }}
              >
                <Star size={10} fill="currentColor" />
              </span>
              {metrics.certificatesPending} ({metrics.certificatesInstitutionReviewed} REVIEWS)
            </div>
            <div
              className="admin-ridge-mono flex items-center gap-2"
              style={{
                height: u(32),
                borderRadius: u(9),
                background: "var(--ar-peach)",
                padding: `0 ${u(12)}`,
                fontSize: u(14),
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: u(18),
                  height: u(18),
                  background: "var(--ar-orange)",
                  color: "#fff",
                }}
              >
                <MountainGlyph size={10} />
              </span>
              {metrics.activeLearners} ACTIVE LEARNERS
            </div>
          </div>

          {/* Search 359×137 @15,462 */}
          <form
            onSubmit={onSearch}
            data-enter="up"
            data-delay="900"
            data-slot="search"
            className="admin-ridge-glass admin-ridge-pos flex flex-col justify-between opacity-0"
            style={{
              left: u(15),
              top: u(462),
              width: u(359),
              height: u(137),
              padding: u(18),
              borderRadius: u(16),
            }}
          >
            <div>
              <p style={{ fontSize: u(25), fontWeight: 400, margin: 0 }}>
                Hey, {firstName}!
              </p>
              <p
                className="mt-1 opacity-60"
                style={{
                  fontSize: u(14.5),
                  fontFamily: "Inter Tight, sans-serif",
                }}
              >
                {orgName} ˄
              </p>
            </div>
            <label
              className="admin-ridge-inner flex items-center gap-2"
              style={{ height: u(37), padding: `0 ${u(12)}` }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="admin-ridge-mono min-w-0 flex-1 bg-transparent text-[11px] outline-none placeholder:opacity-45"
                placeholder="Search by anything"
              />
              <button type="submit" aria-label="Search students" className="opacity-70">
                <Search size={16} />
              </button>
            </label>
          </form>

          {/* Points of interest 358×215 @15,612 */}
          <div
            data-enter="up"
            data-delay="1050"
            data-slot="poi"
            className="admin-ridge-glass admin-ridge-pos flex flex-col opacity-0"
            style={{
              left: u(15),
              top: u(612),
              width: u(358),
              height: u(215),
              padding: u(14),
              borderRadius: u(16),
            }}
          >
            <p className="admin-ridge-mono mb-2 text-[11px] opacity-55">
              ::Points of interest
            </p>
            <div className="admin-ridge-inner relative min-h-0 flex-1 overflow-hidden">
              <svg viewBox="0 0 330 160" className="absolute inset-0 h-full w-full" aria-hidden>
                {Array.from({ length: 16 }).map((_, i) => (
                  <path
                    key={i}
                    d={`M0 ${12 + i * 9} Q70 ${6 + i * 9} 165 ${14 + i * 8} T330 ${10 + i * 9}`}
                    fill="none"
                    stroke="#c9c5bc"
                    strokeWidth="1"
                  />
                ))}
                <path
                  className={`admin-ridge-route${drawn ? " is-drawn" : ""}`}
                  d="M28 130 C75 122, 95 98, 128 78 S185 36, 228 32 S285 20, 305 14"
                  fill="none"
                  stroke="#2E2D2A"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Violet start pin + mountain glyph */}
                <g transform="translate(28,118)">
                  <circle r="11" fill="#7C6CF2" />
                  <path
                    d="M22 123 L26.5 115 L29 119 L31 116.5 L34 123 Z"
                    fill="#fff"
                  />
                </g>
                {/* Orange summit pin */}
                <g transform="translate(305,14)">
                  <circle r="11" fill="#F59E0B" />
                  <circle r="3.5" fill="#fff" />
                </g>
              </svg>
              <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap gap-1">
                {metrics.byBranch.slice(0, 3).map((b) => (
                  <span
                    key={b.label}
                    className="admin-ridge-mono rounded-md bg-white/75 px-2 py-1 text-[9px]"
                  >
                    {b.label.split(" ")[0]} · {b.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Photo card 336×215 @383,612 */}
          <Link
            href="/admin/verification-queue"
            data-enter="up"
            data-delay="1200"
            data-slot="photo"
            className="admin-ridge-pos relative overflow-hidden opacity-0"
            style={{
              left: u(383),
              top: u(612),
              width: u(336),
              height: u(215),
              borderRadius: u(16),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FEATURE}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: "72% 50%" }}
            />
            <div
              className="absolute flex items-center gap-2"
              style={{ left: u(14), bottom: u(14) }}
            >
              <span
                className="admin-ridge-play flex items-center justify-center rounded-full bg-white transition-transform duration-200"
                style={{ width: u(38), height: u(38) }}
              >
                <span className="ml-0.5 border-y-[6px] border-l-[10px] border-y-transparent border-l-[var(--ar-ink)]" />
              </span>
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: "var(--ar-amber-light)",
                  fontSize: u(14),
                  fontFamily: "Inter Tight, sans-serif",
                }}
              >
                <Camera size={13} />
                {metrics.certificatesPending} Photos
              </span>
            </div>
          </Link>

          {/* Altitude 387×215 @728,612 */}
          <div
            data-enter="up"
            data-delay="1350"
            data-slot="altitude"
            className="admin-ridge-glass admin-ridge-pos flex flex-col opacity-0"
            style={{
              left: u(728),
              top: u(612),
              width: u(387),
              height: u(215),
              padding: u(14),
              borderRadius: u(16),
            }}
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <p className="admin-ridge-mono text-[11px] opacity-55">::Altitude</p>
              <div className="admin-ridge-mono flex items-center gap-2 text-[9px] opacity-70">
                <span>Total gain</span>
                <span className="inline-flex items-center gap-1">
                  <i
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--ar-amber)" }}
                  />
                  Hike
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="inline-block h-1.5 w-1.5 rounded-full bg-[#9a968e]" />
                  Descent
                </span>
              </div>
            </div>

            <div className="admin-ridge-inner relative min-h-0 flex-1 p-1.5">
              {tab === "altitude" ? (
                <svg viewBox="0 0 360 112" className="h-full w-full" aria-hidden>
                  <line x1="18" y1="88" x2="342" y2="88" stroke="#c9c5bc" strokeWidth="1" />
                  <path
                    className={`admin-ridge-hike${drawn ? " is-drawn" : ""}`}
                    d="M18 86 L65 68 L115 38 L175 26 L235 22"
                    fill="none"
                    stroke="#2E2D2A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M235 22 L295 46 L340 68"
                    fill="none"
                    stroke="#9a968e"
                    strokeWidth="2"
                    strokeDasharray="4 5"
                  />
                  {[65, 115, 175, 235].map((x, i) => (
                    <circle
                      key={x}
                      cx={x}
                      cy={[68, 38, 26, 22][i]}
                      r="3.5"
                      fill="#F6B733"
                    />
                  ))}
                  <text
                    x="18"
                    y="104"
                    fill="#6b6760"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.06em"
                  >
                    0 km
                  </text>
                  <text
                    x="130"
                    y="104"
                    fill="#6b6760"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.06em"
                  >
                    1,25 km
                  </text>
                  <text
                    x="270"
                    y="104"
                    fill="#6b6760"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    letterSpacing="0.06em"
                  >
                    {metrics.placementEligible * 100} m
                  </text>
                </svg>
              ) : tab === "slopes" ? (
                <div className="flex h-full flex-col justify-center gap-2 p-2">
                  {(metrics.byBranch.length ? metrics.byBranch : [{ label: "—", count: 0 }])
                    .slice(0, 4)
                    .map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="admin-ridge-mono w-16 truncate text-[9px] opacity-60">
                          {row.label.split(" ")[0]}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(row.count / maxBranch) * 100}%`,
                              background: "var(--ar-amber)",
                            }}
                          />
                        </div>
                        <span className="admin-ridge-mono text-[10px]">{row.count}</span>
                      </div>
                    ))}
                </div>
              ) : tab === "seasons" ? (
                <div className="h-full space-y-1.5 overflow-auto p-1">
                  {metrics.recentActivity.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="rounded-xl bg-white/65 px-2.5 py-2">
                      <p className="text-xs font-medium leading-snug">{ev.title}</p>
                      <p className="text-[11px] opacity-60">{ev.detail}</p>
                      <p className="admin-ridge-mono mt-1 text-[9px] opacity-45">
                        {formatDate(ev.createdAt)}
                      </p>
                    </div>
                  ))}
                  {!metrics.recentActivity.length ? (
                    <p className="admin-ridge-mono p-2 text-[10px] opacity-50">No events</p>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center gap-3 p-3">
                  <p className="admin-ridge-mono text-[11px] opacity-55">Support load</p>
                  <p style={{ fontSize: 36, fontWeight: 300, lineHeight: 1 }}>
                    {metrics.needingSupport}
                  </p>
                  <p className="admin-ridge-mono text-[10px] opacity-55">
                    Batch {midBatch} · Reviewed {metrics.certificatesInstitutionReviewed}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2 flex gap-1">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className="admin-ridge-mono flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] transition"
                    style={{
                      background: active ? "var(--ar-amber-light)" : "transparent",
                    }}
                  >
                    {t.icon === "mountain" ? <Mountain size={10} /> : null}
                    {t.icon === "snow" ? <Snowflake size={10} /> : null}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather 303×380 @1126,12 */}
          <div
            data-enter="right"
            data-delay="550"
            data-slot="weather"
            className="admin-ridge-glass admin-ridge-pos flex flex-col opacity-0"
            style={{
              left: u(1126),
              top: u(12),
              width: u(303),
              height: u(380),
              padding: u(16),
              borderRadius: u(16),
            }}
          >
            <p className="admin-ridge-mono mb-2 text-[11px] opacity-55">::Weather</p>
            <div
              className="admin-ridge-inner relative flex flex-col items-center"
              style={{ height: u(242), paddingTop: u(14) }}
            >
              <span className="admin-ridge-mono rounded-full bg-white/80 px-3 py-1 text-[10px]">
                Entire trail
              </span>
              <div className="relative mt-1" style={{ width: u(210), height: u(130) }}>
                <svg viewBox="0 0 210 130" className="h-full w-full">
                  <defs>
                    <linearGradient id="arGauge" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E7E1D3" />
                      <stop offset="55%" stopColor="#F8C44C" />
                      <stop offset="100%" stopColor="#F6B12A" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M22 108 A84 84 0 0 1 188 108"
                    fill="none"
                    stroke="url(#arGauge)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    className={`admin-ridge-gauge-arc${drawn ? " is-drawn" : ""}`}
                    d="M30 104 A76 76 0 0 1 180 104"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="22" cy="108" r="5" fill="#fff" />
                  <circle cx="188" cy="108" r="5" fill="#fff" />
                </svg>
                <p
                  className="absolute inset-x-0 text-center"
                  style={{ top: u(42), fontSize: u(74), fontWeight: 300, lineHeight: 1 }}
                >
                  {gaugeValue}°
                </p>
              </div>
              <div className="admin-ridge-mono mt-auto flex w-full justify-between px-3 pb-3 text-[11px] opacity-70">
                <span>0°</span>
                <span className="inline-flex items-center gap-1" style={{ textTransform: "none" }}>
                  <Sun size={11} /> Active
                </span>
                <span>. 100°</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="admin-ridge-inner flex items-center gap-2 p-3">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: u(28),
                    height: u(28),
                    background: "var(--ar-orange)",
                    color: "#fff",
                  }}
                >
                  <Wind size={13} />
                </span>
                <div>
                  <p className="admin-ridge-mono text-[9px] opacity-50">Wind</p>
                  <p className="admin-ridge-mono" style={{ fontSize: u(18.5) }}>
                    {metrics.certificatesPending} pend
                  </p>
                </div>
              </div>
              <div className="admin-ridge-inner flex items-center gap-2 p-3">
                <span
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: u(28),
                    height: u(28),
                    background: "var(--ar-amber-light)",
                  }}
                >
                  <Mountain size={13} />
                </span>
                <div>
                  <p className="admin-ridge-mono text-[9px] opacity-50">Sunset</p>
                  <p className="admin-ridge-mono" style={{ fontSize: u(18.5) }}>
                    {String(metrics.needingSupport).padStart(2, "0")}:
                    {String(metrics.trainingCompleting).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trail info 303×425 @1126,402 — three ~118 panels */}
          <div
            data-enter="right"
            data-delay="720"
            data-slot="trail"
            className="admin-ridge-glass admin-ridge-pos flex flex-col opacity-0"
            style={{
              left: u(1126),
              top: u(402),
              width: u(303),
              height: u(425),
              padding: u(16),
              borderRadius: u(16),
            }}
          >
            <p className="admin-ridge-mono mb-2 text-[11px] opacity-55">::Trail info</p>
            <div className="flex min-h-0 flex-1 flex-col gap-2">
              {[
                {
                  value: String(metrics.registeredStudents),
                  label: "Distance",
                  caption: "Students",
                  href: "/admin/students",
                },
                {
                  value: `${metrics.placementEligible}`,
                  label: "Duration",
                  caption: "Placement eligible",
                  href: "/admin/students?placementStatus=eligible",
                },
                {
                  value: `${metrics.trainingCompleting}`,
                  label: "Elevation gain",
                  caption: "Training complete",
                  href: "/admin/analytics",
                },
              ].map((row) => (
                <Link
                  key={row.label}
                  href={row.href}
                  className="admin-ridge-inner flex items-center gap-3 px-3 transition hover:brightness-95"
                  style={{ height: u(118), minHeight: u(100) }}
                >
                  <span
                    className="flex shrink-0 items-center justify-center rounded-xl"
                    style={{
                      width: u(44),
                      height: u(44),
                      background: "rgba(246,183,51,.28)",
                    }}
                  >
                    <Mountain size={18} color="#c48a12" />
                  </span>
                  <div>
                    <p style={{ fontSize: u(32), fontWeight: 300, lineHeight: 1.05 }}>
                      {row.value}
                    </p>
                    <p className="admin-ridge-mono mt-1 text-[10px] opacity-55">{row.label}</p>
                    <p className="text-[11px] opacity-45" style={{ textTransform: "none" }}>
                      {row.caption}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
