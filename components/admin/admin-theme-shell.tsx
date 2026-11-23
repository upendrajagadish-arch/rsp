"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Students", href: "/admin/students" },
  { label: "Certificates", href: "/admin/verification-queue" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Audit", href: "/admin/audit" },
] as const;

export function AdminThemeShell({
  userName,
  orgName,
  demo,
  children,
}: {
  userName: string;
  orgName: string;
  demo?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOverview = pathname === "/admin";

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="admin-hr relative min-h-screen overflow-x-hidden text-[#303030]">
      <svg
        className="pointer-events-none fixed inset-0 h-full w-full"
        viewBox="0 0 1280 832"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter
            id="adminThemeGlow"
            x="-727"
            y="-383"
            width="2603"
            height="1976.5"
            filterUnits="userSpaceOnUse"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="250" result="effect1_foregroundBlur" />
          </filter>
        </defs>
        <rect width="1280" height="832" fill="#E3E5E6" />
        <g filter="url(#adminThemeGlow)">
          <path
            d="M904 404C942.8 189.6 1234.83 123.333 1376 117V1093.5H-227V792.5C-161.5 706.167 0.5 556.6 124.5 649C248.5 741.4 473.833 727.5 571 709C665.833 696.667 865.2 618.4 904 404Z"
            fill="#FFD85F"
          />
        </g>
      </svg>

      <div
        className={`relative z-10 mx-auto flex max-w-[1400px] flex-col px-4 py-5 sm:px-6 ${
          isOverview
            ? "lg:h-screen lg:overflow-hidden lg:py-5"
            : "min-h-screen overflow-y-auto pb-10"
        }`}
      >
        <nav className="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="select-none rounded-full border border-[#898989]/30 bg-white/50 px-5 py-2 text-base backdrop-blur-xl"
            >
              SSP
            </Link>
            <div className="hidden text-xs text-[#898989] sm:block">
              <p className="font-medium text-[#303030]">{orgName}</p>
              <p>
                {userName}
                {demo ? " · Demo" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-full border border-[#898989]/20 bg-white/60 px-1 py-1 shadow-sm backdrop-blur-xl lg:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-[#303030] text-white"
                      : "text-[#898989] hover:text-[#303030]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              href="/admin/verification-queue"
              className="relative rounded-full border border-[#898989]/20 bg-white/60 px-3.5 py-2.5 shadow-sm backdrop-blur-xl transition hover:bg-white/80"
              aria-label="Certificates"
            >
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FFD85F]" />
            </Link>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#898989]/20 bg-white/60 shadow-sm backdrop-blur-xl transition hover:bg-white/80"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </form>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#898989]/20 bg-white/60 shadow-sm backdrop-blur-xl lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>

        {mobileOpen ? (
          <div className="mb-4 flex flex-wrap gap-1 rounded-2xl border border-[#898989]/20 bg-white/80 p-2 shadow-md backdrop-blur-xl lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-[#303030] text-white"
                    : "text-[#898989] hover:text-[#303030]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className={isOverview ? "min-h-0 flex-1" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function AdminGlass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-white/60 shadow-[0_2px_20px_rgba(0,0,0,0.06)] backdrop-blur-3xl ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminPageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl tracking-tight text-[#303030] sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-[#898989]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
