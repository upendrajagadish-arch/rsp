"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;
type DemoRole = "student" | "admin";

const DEMO_LOGINS = {
  student: {
    role: "Student" as const,
    email: "student@demo.edu",
    password: "DemoStudent123!",
    icon: GraduationCap,
    hint: "Open student passport",
    next: "/student/profile",
  },
  admin: {
    role: "Admin" as const,
    email: "admin@demo.edu",
    password: "DemoAdmin123!",
    icon: Shield,
    hint: "College admin console",
    next: "/admin",
  },
} as const;

const DEMO_EMAILS = new Set(["student@demo.edu", "admin@demo.edu"]);

const inputClass =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition";

function isDemoConfigured() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  if (!anon || anon.includes("your-anon-key")) return true;
  if (url.includes("127.0.0.1") || url.includes("localhost")) return true;
  return false;
}

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 256 256" fill="black" aria-hidden>
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<DemoRole>("student");
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null);
  const demo = isDemoConfigured();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: DEMO_LOGINS.student.email,
      password: DEMO_LOGINS.student.password,
    },
  });

  function selectRole(role: DemoRole) {
    const account = DEMO_LOGINS[role];
    setActiveRole(role);
    setError(null);
    form.setValue("email", account.email);
    form.setValue("password", account.password);
  }

  async function tryDemoLogin(values: FormValues, next?: string) {
    const res = await fetch("/api/demo/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, next }),
    });
    const data = (await res.json()) as { error?: string; next?: string };
    if (!res.ok) {
      return { ok: false as const, error: data.error ?? "Demo sign-in failed" };
    }
    return { ok: true as const, next: data.next || "/student" };
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    const next = params.get("next") || undefined;
    const email = values.email.toLowerCase();
    const preferDemo = demo || DEMO_EMAILS.has(email);

    if (preferDemo) {
      const demoResult = await tryDemoLogin(values, next);
      if (demoResult.ok) {
        router.push(demoResult.next);
        router.refresh();
        return;
      }
      if (DEMO_EMAILS.has(email) || demo) {
        setError(demoResult.error);
        return;
      }
    }

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword(values);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next || "/student");
      router.refresh();
    } catch {
      setError("Could not reach Supabase. Enable demo mode or configure keys.");
    }
  }

  async function quickDemoSignIn(role: DemoRole) {
    const account = DEMO_LOGINS[role];
    selectRole(role);
    setPendingRole(role);
    setError(null);
    try {
      const next = params.get("next") || account.next;
      const demoResult = await tryDemoLogin(
        { email: account.email, password: account.password },
        next,
      );
      if (!demoResult.ok) {
        setError(demoResult.error);
        return;
      }
      router.push(demoResult.next);
      router.refresh();
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <div className="forma-landing min-h-screen bg-white p-3 sm:p-4 md:p-6">
      <div className="relative min-h-[calc(100vh-24px)] overflow-hidden rounded-2xl sm:min-h-[calc(100vh-32px)] sm:rounded-3xl md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-48px)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="relative z-10 flex min-h-[calc(100vh-24px)] flex-col gap-6 p-4 sm:min-h-[calc(100vh-32px)] sm:p-6 md:min-h-[calc(100vh-48px)] md:p-8 lg:h-full">
          <nav className="flex w-full items-center gap-3 rounded-2xl bg-white/60 py-2 pr-2 pl-3 shadow-sm backdrop-blur-md sm:w-auto sm:gap-6 sm:pl-4">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="text-sm font-semibold tracking-tight text-gray-900">SSP</span>
            </Link>
            <Link
              href="/"
              className="ml-auto rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:px-5"
            >
              Back home
            </Link>
          </nav>

          <div className="min-h-[2rem] flex-1" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <p className="shrink-0 text-3xl font-medium leading-tight text-white drop-shadow-lg sm:text-4xl lg:max-w-lg xl:max-w-2xl xl:text-5xl">
              Sign in for
              <br />
              students &{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                admins
              </span>
            </p>

            <div className="w-full shrink-0 lg:w-[min(480px,45%)]">
              <div className="rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                      Welcome back
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose Student or Admin demo — both work with one click.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(DEMO_LOGINS) as DemoRole[]).map((key) => {
                      const hint = DEMO_LOGINS[key];
                      const Icon = hint.icon;
                      const active = activeRole === key;
                      const loading = pendingRole === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={pendingRole !== null || form.formState.isSubmitting}
                          onClick={() => void quickDemoSignIn(key)}
                          className={cn(
                            "flex flex-col gap-2 rounded-2xl border px-3 py-3 text-left transition-all disabled:opacity-60",
                            active
                              ? "border-black bg-black text-white"
                              : "border-gray-200 bg-gray-50 text-gray-900 hover:border-black hover:bg-white",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-xl",
                              active ? "bg-white text-black" : "bg-black text-white",
                            )}
                          >
                            <Icon size={14} />
                          </span>
                          <span className="text-sm font-semibold">
                            {loading ? "Signing in…" : `${hint.role} demo`}
                          </span>
                          <span className={cn("text-xs", active ? "text-white/70" : "text-gray-500")}>
                            {hint.hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-sm font-medium text-gray-400">OR</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="flex rounded-full border border-gray-200 bg-gray-50 p-1">
                    {(Object.keys(DEMO_LOGINS) as DemoRole[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => selectRole(key)}
                        className={cn(
                          "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                          activeRole === key
                            ? "bg-black text-white"
                            : "text-gray-500 hover:text-gray-900",
                        )}
                      >
                        {DEMO_LOGINS[key].role}
                      </button>
                    ))}
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-sm font-medium text-black">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={inputClass}
                        {...form.register("email")}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="password" className="text-sm font-medium text-black">
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className={inputClass}
                        {...form.register("password")}
                      />
                    </div>

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting || pendingRole !== null}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                    >
                      {form.formState.isSubmitting
                        ? "Signing in…"
                        : `Sign in as ${DEMO_LOGINS[activeRole].role}`}
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-400">
                    Student → passport · Admin → college console
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormaLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
          Loading sign in…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
