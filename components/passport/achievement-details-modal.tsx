"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AchievementStamp } from "@/components/passport/stamps/achievement-stamp";
import { stampByCode } from "@/lib/passport/stamp-categories";
import type { PassportAchievement } from "@/lib/passport/types";

export function AchievementDetailsModal({
  open,
  onOpenChange,
  achievement,
  lockedCode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  achievement: PassportAchievement | null;
  lockedCode?: string | null;
}) {
  const locked = lockedCode ? stampByCode(lockedCode) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(94vw,440px)] border border-[#D8C398] text-[#17283D] [&_button[aria-label=Close]]:bg-[#08182D]/10 [&_button[aria-label=Close]]:text-[#17283D]"
        style={{ background: "#FAF7EF" }}
      >
        <DialogHeader>
          <DialogTitle className="sp-serif text-[#08182D]">
            {achievement?.stampTitle ?? locked?.title ?? "Achievement"}
          </DialogTitle>
          <DialogDescription className="text-[#78828E]">
            {achievement
              ? "Verified institutional achievement record"
              : "How to earn this stamp"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4 pb-6">
          <div className="flex justify-center">
            <AchievementStamp
              title={achievement?.stampTitle ?? locked?.title ?? "Stamp"}
              colour={achievement?.colour ?? locked?.colour ?? "#78828E"}
              status={achievement?.status ?? "locked"}
              size={128}
            />
          </div>
          {achievement ? (
            <dl className="space-y-2 text-sm">
              <Row label="Title" value={achievement.title} />
              <Row label="Issued by" value={achievement.issuer ?? "—"} />
              <Row label="Completed" value={achievement.completedOn ?? "—"} />
              <Row label="Achievement ID" value={achievement.achievementCode} />
              <Row label="Status" value={achievement.status} />
              <Row
                label="Physical stamp"
                value={achievement.physicalStatus?.replaceAll("_", " ") ?? "—"}
              />
              {achievement.evidenceNote ? (
                <Row label="Note" value={achievement.evidenceNote} />
              ) : null}
            </dl>
          ) : (
            <div className="space-y-2 text-sm text-[#78828E]">
              <p>Submit supporting evidence through Certificates or Projects.</p>
              <p>An authorized reviewer must verify the record before the stamp is awarded.</p>
              <p>Duplicate evidence for the same source will not create repeated stamps.</p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-[#D8C398]/40 py-1.5">
      <dt className="text-xs uppercase tracking-wide text-[#78828E]">{label}</dt>
      <dd className="capitalize text-[#17283D]">{value}</dd>
    </div>
  );
}
