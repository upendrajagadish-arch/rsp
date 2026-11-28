"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { SkillPassportViewer } from "@/components/passport/skill-passport-viewer";
import { AchievementStamp } from "@/components/passport/stamps/achievement-stamp";
import type { SkillPassportBundle } from "@/lib/passport/types";
import { cn } from "@/lib/utils";

const SUBNAV = [
  { id: "passport", label: "Passport" },
  { id: "collection", label: "Achievement Collection" },
  { id: "pathways", label: "Learning Pathways" },
  { id: "history", label: "Achievement History" },
  { id: "physical", label: "Physical Stamp Status" },
] as const;

type Tab = (typeof SUBNAV)[number]["id"];

export function MyPassportShell({ bundle }: { bundle: SkillPassportBundle }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const tabParam = (searchParams.get("view") as Tab | null) ?? "passport";
  const tab: Tab = SUBNAV.some((t) => t.id === tabParam) ? tabParam : "passport";

  function setTab(next: Tab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const persistPage = useCallback(async (page: number) => {
    await fetch("/api/passport/last-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentProfileId: bundle.identity.studentProfileId,
        lastPage: page,
      }),
    });
  }, [bundle.identity.studentProfileId]);

  const markSeen = useCallback(
    async (ids: string[]) => {
      await fetch("/api/passport/unlocks-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: bundle.identity.studentProfileId,
          achievementIds: ids,
        }),
      });
    },
    [bundle.identity.studentProfileId],
  );

  return (
    <div className={cn("skill-passport min-h-screen bg-[#FAF7EF]", pending && "opacity-80")}>
      <header className="border-b border-[#D8C398] bg-[#08182D] text-[#D8C398]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B69A59]">My Passport</p>
            <h1 className="sp-serif text-2xl text-[#D8C398]">{bundle.identity.fullName}</h1>
          </div>
          <Link
            href="/student/profile"
            className="border border-[#B69A59]/50 px-3 py-1.5 text-xs uppercase tracking-wider text-[#D8C398]"
          >
            Back to profile
          </Link>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          {SUBNAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-xs uppercase tracking-wider transition",
                tab === item.id
                  ? "bg-[#B69A59] text-[#08182D]"
                  : "text-[#D8C398]/80 hover:text-[#D8C398]",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main
        className={
          tab === "passport"
            ? "relative min-h-[calc(100vh-7.5rem)]"
            : "mx-auto max-w-5xl px-4 py-6"
        }
      >
        {tab === "passport" ? (
          <SkillPassportViewer
            bundle={bundle}
            viewerMode="student"
            onPersistPage={(p) => void persistPage(p)}
            onMarkUnlocksSeen={(ids) => void markSeen(ids)}
          />
        ) : null}

        {tab === "collection" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {bundle.achievements
              .filter((a) => a.status === "verified" || a.status === "submitted")
              .map((a) => (
                <div key={a.id} className="border border-[#D8C398] bg-[#FFFEFA] p-3 text-center">
                  <AchievementStamp
                    title={a.stampTitle}
                    colour={a.colour}
                    status={a.status}
                    size={96}
                  />
                  <p className="mt-2 text-sm text-[#17283D]">{a.title}</p>
                  <p className="text-xs text-[#78828E]">{a.stampTitle}</p>
                </div>
              ))}
          </div>
        ) : null}

        {tab === "pathways" ? (
          <div className="border border-[#D8C398] bg-[#FFFEFA] p-6">
            <h2 className="sp-serif text-2xl text-[#08182D]">Learning pathways</h2>
            <p className="mt-2 text-sm text-[#78828E]">
              Pathway recommendations by branch and goals will appear here in a later release.
              Current level: <strong className="text-[#17283D]">{bundle.overview.levelLabel}</strong>
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-[#17283D] sm:grid-cols-2">
              {[
                "Java Developer",
                "Python Developer",
                "AI and Machine Learning",
                "Cloud Computing",
                "Cybersecurity",
                "Data Engineering",
              ].map((p) => (
                <li key={p} className="border border-[#D8C398]/60 px-3 py-2">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "history" ? (
          <ol className="space-y-3">
            {bundle.achievements
              .slice()
              .sort((a, b) => String(b.verifiedAt ?? b.completedOn).localeCompare(String(a.verifiedAt ?? a.completedOn)))
              .map((a) => (
                <li key={a.id} className="border border-[#D8C398] bg-[#FFFEFA] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-[#17283D]">{a.title}</p>
                    <span className="text-xs uppercase tracking-wide text-[#B69A59]">{a.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#78828E]">
                    {a.stampTitle} · {a.achievementCode}
                    {a.verifiedAt ? ` · verified ${a.verifiedAt.slice(0, 10)}` : ""}
                  </p>
                </li>
              ))}
          </ol>
        ) : null}

        {tab === "physical" ? (
          <div className="space-y-3">
            {bundle.achievements
              .filter((a) => a.physicalStatus)
              .map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 border border-[#D8C398] bg-[#FFFEFA] px-4 py-3 text-sm"
                >
                  <div>
                    <p className="text-[#17283D]">{a.title}</p>
                    <p className="text-xs text-[#78828E]">{a.stampTitle}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-[#B69A59]">
                    {a.physicalStatus?.replaceAll("_", " ")}
                  </span>
                </div>
              ))}
            {!bundle.achievements.some((a) => a.physicalStatus) ? (
              <p className="text-sm text-[#78828E]">No physical stamp records yet.</p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
