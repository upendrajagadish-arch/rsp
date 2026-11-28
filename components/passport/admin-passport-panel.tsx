"use client";

import { useMemo, useState, useTransition } from "react";
import { SkillPassportViewer } from "@/components/passport/skill-passport-viewer";
import { STAMP_CATEGORIES } from "@/lib/passport/stamp-categories";
import type { SkillPassportBundle } from "@/lib/passport/types";
import { cn } from "@/lib/utils";

type AdminView = "passport" | "records" | "queue" | "physical";

export function AdminPassportPanel({
  initialBundle,
  studentProfileId,
}: {
  initialBundle: SkillPassportBundle;
  studentProfileId: string;
}) {
  const [bundle, setBundle] = useState(initialBundle);
  const [view, setView] = useState<AdminView>("passport");
  const [reason, setReason] = useState("");
  const [awardTitle, setAwardTitle] = useState("");
  const [awardCode, setAwardCode] = useState("01");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => bundle.achievements.find((a) => a.id === selectedId) ?? null,
    [bundle.achievements, selectedId],
  );

  async function refresh() {
    const res = await fetch(`/api/passport/bundle?studentProfileId=${studentProfileId}`);
    if (res.ok) {
      const data = (await res.json()) as { bundle: SkillPassportBundle };
      setBundle(data.bundle);
    }
  }

  function runAction(action: "approve" | "reject" | "revoke" | "request_correction") {
    if (!selectedId) {
      setMessage("Select an achievement record first.");
      return;
    }
    if (!reason.trim()) {
      setMessage("A reason is required for administrative actions.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/passport/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId,
          achievementId: selectedId,
          action,
          reason,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Action failed");
        return;
      }
      setMessage(`Action “${action}” recorded.`);
      setReason("");
      await refresh();
    });
  }

  function awardManual() {
    if (!awardTitle.trim() || !reason.trim()) {
      setMessage("Title and reason are required to award manually.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/passport/admin-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId,
          action: "award",
          stampCode: awardCode,
          title: awardTitle,
          reason,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Award failed");
        return;
      }
      setMessage("Achievement awarded.");
      setAwardTitle("");
      setReason("");
      await refresh();
    });
  }

  const o = bundle.overview;

  return (
    <div className={cn("space-y-4", pending && "opacity-70")}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["Verified", o.verifiedCount],
          ["Certifications", o.certificationCount],
          ["Projects", o.projectCount],
          ["Pending", o.pendingVerification],
          ["Level", o.levelLabel],
          ["Phys. issued", o.physicalIssued],
          ["Phys. pending", o.physicalPending],
          ["Internships", o.internshipCount],
          ["Last stamp", o.lastAchievementAt?.slice(0, 10) ?? "—"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-[#898989]/20 bg-white/70 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-[#898989]">{label}</p>
            <p className="mt-1 text-lg text-[#303030]">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 rounded-full border border-[#898989]/20 bg-white/60 p-1">
        {(
          [
            ["passport", "Passport View"],
            ["records", "Achievement Records"],
            ["queue", "Verification Queue"],
            ["physical", "Physical Stamp History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              view === id ? "bg-[#303030] text-white" : "text-[#898989]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {view === "passport" ? (
            <div className="rounded-3xl border border-[#898989]/15 bg-[#FAF7EF] p-3">
              <SkillPassportViewer bundle={bundle} viewerMode="administrator" />
            </div>
          ) : null}

          {view === "records" || view === "queue" ? (
            <ul className="space-y-2">
              {bundle.achievements
                .filter((a) =>
                  view === "queue" ? a.status === "submitted" || a.status === "rejected" : true,
                )
                .map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                        selectedId === a.id
                          ? "border-[#303030] bg-white"
                          : "border-[#898989]/20 bg-white/60 hover:bg-white",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-[#303030]">{a.title}</p>
                        <span className="text-xs uppercase text-[#898989]">{a.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#898989]">
                        {a.stampTitle} · {a.achievementCode}
                      </p>
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}

          {view === "physical" ? (
            <ul className="space-y-2">
              {bundle.achievements
                .filter((a) => a.physicalStatus)
                .map((a) => (
                  <li
                    key={a.id}
                    className="rounded-2xl border border-[#898989]/20 bg-white/60 px-4 py-3 text-sm"
                  >
                    <div className="flex justify-between gap-2">
                      <p className="text-[#303030]">{a.title}</p>
                      <span className="text-xs uppercase text-[#898989]">
                        {a.physicalStatus?.replaceAll("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        <aside className="space-y-3 rounded-3xl border border-[#898989]/20 bg-white/70 p-4">
          <p className="text-sm font-medium text-[#303030]">Admin actions</p>
          <p className="text-xs text-[#898989]">
            {selected
              ? `Selected: ${selected.title}`
              : "Select a record, or award a stamp manually."}
          </p>
          <label className="block text-xs text-[#898989]">
            Reason (required)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#898989]/25 bg-white px-3 py-2 text-sm text-[#303030]"
              rows={3}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => runAction("approve")}
              className="rounded-full bg-[#303030] px-3 py-2 text-xs text-white"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => runAction("reject")}
              className="rounded-full border border-[#898989]/30 px-3 py-2 text-xs"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => runAction("request_correction")}
              className="rounded-full border border-[#898989]/30 px-3 py-2 text-xs"
            >
              Request fix
            </button>
            <button
              type="button"
              onClick={() => runAction("revoke")}
              className="rounded-full border border-[#898989]/30 px-3 py-2 text-xs text-red-700"
            >
              Revoke
            </button>
          </div>
          <div className="border-t border-[#898989]/15 pt-3">
            <p className="mb-2 text-xs font-medium text-[#303030]">Manual award</p>
            <select
              value={awardCode}
              onChange={(e) => setAwardCode(e.target.value)}
              className="mb-2 w-full rounded-xl border border-[#898989]/25 bg-white px-3 py-2 text-sm"
            >
              {STAMP_CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.title}
                </option>
              ))}
            </select>
            <input
              value={awardTitle}
              onChange={(e) => setAwardTitle(e.target.value)}
              placeholder="Achievement title"
              className="mb-2 w-full rounded-xl border border-[#898989]/25 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={awardManual}
              className="w-full rounded-full bg-[#FFD85F] px-3 py-2 text-xs font-medium text-[#303030]"
            >
              Award with reason
            </button>
          </div>
          {message ? <p className="text-xs text-[#898989]">{message}</p> : null}
        </aside>
      </div>
    </div>
  );
}
