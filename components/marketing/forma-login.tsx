"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260602_150901_c45b90ec-18d7-42ff-90e2-b95d7109e330.mp4";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

const demoHints = [
  {
    role: "Student",
    email: "student@demo.edu",
    password: "DemoStudent123!",
    icon: GraduationCap,
    hint: "Open student passport",
  },
  {
    role: "Admin",
    email: "admin@demo.edu",
    password: "DemoAdmin123!",
    icon: Shield,
    hint: "College verification console",
  },
] as const;

const inputClass =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition";

function isDemoConfigured() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    !anon ||
    anon.includes("your-anon-key") ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

function LogoMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 256 256"
      fill="black"
      aria-hidden
    >
      <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const demo = isDemoConfigured();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "student@demo.edu", password: "DemoStudent123!" },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    const next = params.get("next") || undefined;

    if (demo) {
      const res = await fetch("/api/demo/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Demo sign-in failed");
        return;
      }
      router.push(data.next || "/student");
      router.refresh();
      return;
    }

    try {
      const supabase = createClient();
      const { error: signInError } =
        await supabase.auth.signInWithPassword(values);
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

  async function demoSignIn(email: string, password: string) {
    form.setValue("email", email);
    form.setValue("password", password);
    await form.handleSubmit(onSubmit)();
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
              <span className="text-sm font-semibold tracking-tight text-gray-900">
                SSP
              </span>
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
              <div className="overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
                      Welcome back
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {demo
                        ? "Demo access for Student and Admin only."
                        : "Sign in to your Smart Skill Passport workspace."}
                    </p>
                  </div>

                  {demo ? (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {demoHints.map((hint) => {
                          const Icon = hint.icon;
                          return (
                            <button
                              key={hint.email}
                              type="button"
                              disabled={form.formState.isSubmitting}
                              onClick={() =>
                                void demoSignIn(hint.email, hint.password)
                              }
                              className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-left transition-all hover:border-black hover:bg-white disabled:opacity-60"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white">
                                <Icon size={14} />
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {hint.role} demo
                              </span>
                              <span className="text-xs text-gray-500">
                                {hint.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-sm font-medium text-gray-400">
                          OR
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                    </>
                  ) : null}

                  <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-black"
                      >
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
                      <label
                        htmlFor="password"
                        className="text-sm font-medium text-black"
                      >
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

                    {error ? (
                      <p className="text-sm text-red-600">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                    >
                      {form.formState.isSubmitting
                        ? "Signing in…"
                        : "Sign in"}
                    </button>
                  </form>

                  {!demo ? (
                    <p className="text-center text-sm text-gray-500">
                      Need an account?{" "}
                      <Link
                        href="/signup"
                        className="font-semibold text-gray-900 hover:underline"
                      >
                        Request access
                      </Link>
                    </p>
                  ) : (
                    <p className="text-center text-xs text-gray-400">
                      Recruiter demo is disabled on this login.
                    </p>
                  )}
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
