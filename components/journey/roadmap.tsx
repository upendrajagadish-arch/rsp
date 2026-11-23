"use client";

import Link from "next/link";
import { CheckCircle2, CircleDashed, Compass, LockKeyholeOpen } from "lucide-react";
import type { MilestoneProgress } from "@/lib/journey/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function JourneyRoadmap({ milestones }: { milestones: MilestoneProgress[] }) {
  return (
    <ol className="relative space-y-4 before:absolute before:left-[19px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-[var(--border)]">
      {milestones.map((m) => {
        const Icon =
          m.status === "completed"
            ? CheckCircle2
            : m.recommendedNext
              ? Compass
              : m.dependsOn.length && m.progressPercent === 0
                ? LockKeyholeOpen
                : CircleDashed;

        return (
          <li
            key={m.milestoneId}
            id={m.slug}
            className={cn(
              "relative rounded-3xl border bg-white p-5 pl-14 shadow-sm transition",
              m.recommendedNext
                ? "border-[var(--emerald)] ring-2 ring-[var(--emerald)]/15"
                : "border-[var(--border)]",
            )}
          >
            <div
              className={cn(
                "absolute left-2 top-5 flex h-8 w-8 items-center justify-center rounded-full border bg-white",
                m.status === "completed"
                  ? "border-emerald-200 text-emerald-700"
                  : m.recommendedNext
                    ? "border-[var(--emerald)] text-[var(--emerald)]"
                    : "border-[var(--border)] text-[var(--muted)]",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-[var(--navy)]">{m.title}</h3>
                  {m.recommendedNext ? <Badge>Recommended next</Badge> : null}
                  {m.status === "completed" ? <Badge variant="success">Completed</Badge> : null}
                  {m.status === "in_progress" ? <Badge variant="info">In progress</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{m.summary}</p>
              </div>
              <p className="text-xs font-medium text-[var(--muted)]">~{m.estimatedHours}h</p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
              <div
                className="h-full rounded-full bg-[var(--emerald)] transition-all"
                style={{ width: `${m.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Evidence coverage {m.progressPercent}% · supported {m.supportedSkills.join(", ") || "—"}
              {m.missingSkills.length ? ` · still need ${m.missingSkills.join(", ")}` : ""}
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                  Practice
                </p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--navy)]">
                  {m.practiceActivities.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  <span className="font-medium text-[var(--navy)]">Project: </span>
                  {m.projectChallenge}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                  Learning resources
                </p>
                <ul className="mt-2 space-y-2">
                  {m.resources.map((r) => (
                    <li key={r.id}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-[var(--emerald)] hover:underline"
                      >
                        {r.title}
                      </a>
                      <p className="text-xs text-[var(--muted)]">
                        {r.provider} · {r.isFree ? "Free" : "Paid"} · {r.resourceType}
                        {r.notes ? ` · ${r.notes}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-[var(--bg)] px-3 py-2 text-xs text-[var(--muted)]">
              Completion requires: {m.completionRequirements}
              {m.optionalCertifications.length
                ? ` Optional certs (not auto-verified): ${m.optionalCertifications.join("; ")}.`
                : ""}
            </p>

            {m.dependsOn.length ? (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Recommended after: {m.dependsOn.join(", ")}. You can still explore this milestone now.
              </p>
            ) : null}

            <div className="mt-4">
              <Link
                href="/student/projects"
                className="text-sm font-semibold text-[var(--navy)] hover:text-[var(--emerald)]"
              >
                Attach project evidence →
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
