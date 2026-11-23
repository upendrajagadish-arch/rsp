"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260703_053131_1ec3dd1c-d627-44fb-ab20-6e1fce41b0d5.mp4";

const navItems = [
  {
    label: "Product",
    links: [
      { label: "Skill passport", href: "#product" },
      { label: "Journey map", href: "#product" },
      { label: "Evidence trail", href: "#product" },
    ],
  },
  {
    label: "Solutions",
    links: [
      { label: "For students", href: "#solutions" },
      { label: "For colleges", href: "#solutions" },
      { label: "For recruiters", href: "#solutions" },
    ],
  },
  {
    label: "About",
    links: [
      { label: "Our story", href: "#about" },
      { label: "Open roles", href: "#about" },
      { label: "Reach us", href: "#about" },
    ],
  },
  { label: "Plans", links: [] as { label: string; href: string }[] },
];

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M14 2.5L25.5 14L14 25.5L2.5 14L14 2.5Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M14 6.5L21.5 14L14 21.5L6.5 14L14 6.5Z"
        fill="white"
        fillOpacity="0.5"
      />
    </svg>
  );
}

function NavDropdown({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const hasLinks = links.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => hasLinks && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white"
        aria-expanded={open}
      >
        {label}
        {hasLinks ? (
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        ) : null}
      </button>
      {hasLinks && open ? (
        <div className="liquid-glass animate-dropdown !absolute top-full left-0 z-50 mt-2 min-w-[160px] rounded-xl px-2 py-3 shadow-xl">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function WellbeingOsLanding() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  return (
    <section className="wellbeing-os relative flex h-screen w-full flex-col overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/10" aria-hidden />

      <nav className="relative z-20 w-full px-5 py-4 sm:px-6 sm:py-5 md:px-12 lg:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <LogoMark />
            <span className="text-lg font-medium tracking-tight sm:text-xl">
              SSP
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavDropdown
                key={item.label}
                label={item.label}
                links={item.links}
              />
            ))}
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white"
            >
              Try it free
            </Link>
          </div>

          <button
            type="button"
            className="relative size-10 text-white lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu
              className={`absolute inset-0 m-auto size-6 transition-all duration-300 ${
                mobileOpen ? "scale-75 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
              }`}
            />
            <X
              className={`absolute inset-0 m-auto size-6 transition-all duration-300 ${
                mobileOpen ? "scale-100 rotate-0 opacity-100" : "scale-75 -rotate-90 opacity-0"
              }`}
            />
          </button>
        </div>

        <div
          className={`absolute top-full right-5 left-5 z-30 mt-2 overflow-hidden rounded-2xl bg-[#2C221C]/95 p-6 backdrop-blur-xl transition-all duration-400 sm:right-6 sm:left-6 md:right-12 md:left-12 lg:hidden ${
            mobileOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <div key={item.label}>
                <p className="text-sm font-medium text-white">{item.label}</p>
                {item.links.length > 0 ? (
                  <div className="mt-2 space-y-1 pl-3">
                    {item.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block py-1 text-sm text-white/70 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
            <Link
              href="/login"
              className="text-sm font-medium text-white/90"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Try it free
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 items-start justify-center px-5 pt-16 sm:px-6 sm:pt-20 md:pt-24">
        <div className="max-w-3xl text-center">
          <h1 className="text-3xl leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Bridge the
            <br />
            gaps. <span className="text-white/60">Ditch the</span>
            <br />
            <span className="text-white/60">grindwork.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:mt-8 sm:text-base md:text-lg">
            Smart Skill Passport unifies your skills, certificates, and journey
            so you spend less energy plugging gaps and more on real progress.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white/90 sm:px-6 sm:py-3"
            >
              Begin your journey
            </Link>
            <Link
              href="/login"
              className="liquid-glass rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 sm:px-6 sm:py-3"
            >
              See it live
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
