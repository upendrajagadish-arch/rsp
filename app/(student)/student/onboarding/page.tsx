"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CAREER_PATHS } from "@/lib/journey/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "beginner", label: "Beginner", hint: "Building foundations" },
  { id: "intermediate", label: "Intermediate", hint: "Some projects or coursework" },
  { id: "advanced", label: "Advanced", hint: "Substantial practice evidence" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [degree, setDegree] = useState("B.Tech");
  const [branch, setBranch] = useState("Computer Science");
  const [rollNumber, setRollNumber] = useState("CSE21001");
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [careerPathSlug, setCareerPathSlug] = useState(CAREER_PATHS[0]?.slug ?? "");
  const [declaredSkills, setDeclaredSkills] = useState("Python, JavaScript");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState(6);

  const selectedPath = useMemo(
    () => CAREER_PATHS.find((p) => p.slug === careerPathSlug) ?? null,
    [careerPathSlug],
  );

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/journey/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degree,
          branch,
          rollNumber,
          experienceLevel,
          careerPathSlug,
          technologies,
          declaredSkills: declaredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          weeklyHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save preferences");
      router.push("/student/profile");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--emerald)]">
          Sprint 1 · Skill journey setup
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--navy)]">
          Design your learning path
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tell us where you are and where you want to go. We will recommend a roadmap — you can
          explore any milestone freely.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {["Profile", "Career", "Commitment"].map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold",
              i <= step
                ? "bg-[var(--navy)] text-white"
                : "bg-white text-[var(--muted)] border border-[var(--border)]",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_16px_50px_rgba(16,24,40,0.06)] sm:p-8">
        {step === 0 ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" value={degree} onChange={(e) => setDegree(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rollNumber">College roll number</Label>
                <Input
                  id="rollNumber"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. CSE21001"
                  required
                />
                <p className="text-xs text-[var(--muted)]">
                  The last 4 digits appear as the watermark behind your profile photo.
                </p>
              </div>
            </div>
            <div>
              <Label>Current experience level</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {LEVELS.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setExperienceLevel(level.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      experienceLevel === level.id
                        ? "border-[var(--emerald)] bg-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--emerald)]/50",
                    )}
                  >
                    <p className="font-semibold text-[var(--navy)]">{level.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{level.hint}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills you already have (comma-separated)</Label>
              <Textarea
                id="skills"
                value={declaredSkills}
                onChange={(e) => setDeclaredSkills(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-[var(--muted)]">
                Declared skills help sequencing. Credential-backed evidence still carries more weight
                later.
              </p>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <Label>Desired career path</Label>
              <div className="mt-3 grid gap-3">
                {CAREER_PATHS.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => {
                      setCareerPathSlug(path.slug);
                      setTechnologies(path.technologies.slice(0, 4));
                    }}
                    className={cn(
                      "rounded-2xl border px-4 py-4 text-left transition",
                      careerPathSlug === path.slug
                        ? "border-[var(--emerald)] bg-[var(--accent)]"
                        : "border-[var(--border)] hover:border-[var(--emerald)]/40",
                    )}
                  >
                    <p className="font-semibold text-[var(--navy)]">{path.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{path.summary}</p>
                  </button>
                ))}
              </div>
            </div>
            {selectedPath ? (
              <div>
                <Label>Technologies you want to learn</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPath.technologies.map((tech) => {
                    const active = technologies.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() =>
                          setTechnologies((prev) =>
                            active ? prev.filter((t) => t !== tech) : [...prev, tech],
                          )
                        }
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm font-medium",
                          active
                            ? "bg-[var(--navy)] text-white"
                            : "bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]",
                        )}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="hours">Preferred weekly learning commitment (hours)</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={40}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
              />
              <p className="text-xs text-[var(--muted)]">
                Used to pace recommendations. You can pause goals anytime without losing progress.
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
              <p className="font-medium text-[var(--navy)]">What happens next</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>A personalized roadmap for {selectedPath?.title ?? "your path"}</li>
                <li>Recommended next milestone — other milestones stay explorable</li>
                <li>Dashboard focuses on one meaningful next action</li>
              </ul>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-[var(--error)]">{error}</p> : null}

        <div className="mt-8 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                if (step === 0) {
                  if (!degree.trim() || !branch.trim()) {
                    setError("Degree and branch are required");
                    return;
                  }
                  if (!rollNumber.trim() || rollNumber.replace(/\D/g, "").length < 4) {
                    setError("Enter a roll number with at least 4 digits");
                    return;
                  }
                }
                setError(null);
                setStep((s) => Math.min(2, s + 1));
              }}
            >
              Continue
            </Button>
          ) : (
            <Button type="button" className="rounded-full" disabled={busy} onClick={finish}>
              {busy ? "Saving…" : "Create my journey"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
