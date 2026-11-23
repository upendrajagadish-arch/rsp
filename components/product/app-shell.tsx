"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/journey", label: "My Journey", icon: GraduationCap },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/passport", label: "Passport", icon: Shield },
  { href: "/student/profile", label: "Profile", icon: UserRound },
  { href: "/student/projects", label: "Projects", icon: Briefcase },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Student directory", icon: Users },
  { href: "/admin/verification-queue", label: "Certificates", icon: FileCheck2 },
  { href: "/admin/analytics", label: "Analytics", icon: Sparkles },
  { href: "/admin/audit", label: "Audit history", icon: Shield },
];

const recruiterNav: NavItem[] = [
  { href: "/recruiter", label: "Search", icon: Users },
  { href: "/recruiter/shortlist", label: "Shortlist", icon: Briefcase },
  { href: "/recruiter/profile", label: "Profile", icon: Settings },
];

export function AppShell({
  role,
  orgName,
  userName,
  demo,
  children,
}: {
  role: "student" | "college_admin" | "recruiter";
  orgName: string;
  userName: string;
  demo?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav =
    role === "college_admin" ? adminNav : role === "recruiter" ? recruiterNav : studentNav;
  const roleLabel =
    role === "college_admin" ? "College admin" : role === "recruiter" ? "Recruiter" : "Student";

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="space-y-1 p-3" aria-label="Primary">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/student" &&
              item.href !== "/admin" &&
              item.href !== "/recruiter" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--navy)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--muted-bg)] hover:text-[var(--navy)]",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#f7f9fc_40%,#f7f9fc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-[var(--border)] bg-white/90 backdrop-blur lg:block">
          <div className="flex h-16 items-center gap-3 border-b border-[var(--border)] px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--navy)] text-[11px] font-bold tracking-wide text-[var(--lime)]">
              SSP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--navy)]">Skill Passport</p>
              <p className="truncate text-[11px] text-[var(--muted)]">{orgName}</p>
            </div>
          </div>
          <NavLinks />
          <div className="absolute inset-x-0 bottom-0 border-t border-[var(--border)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
              {roleLabel}
              {demo ? " · Demo" : ""}
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[var(--navy)]">{userName}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white/85 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <p className="text-sm font-medium text-[var(--navy)]">{userName}</p>
                <p className="text-xs text-[var(--muted)]">
                  {roleLabel}
                  {demo ? " · browsing without Supabase" : ""}
                </p>
              </div>
            </div>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline" size="sm" className="rounded-full">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--navy)]/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
              <p className="font-semibold text-[var(--navy)]">Menu</p>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
