"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AchievementStamp } from "@/components/passport/stamps/achievement-stamp";
import { stampByCode } from "@/lib/passport/stamp-categories";
import type { PassportAchievement, PassportIdentity } from "@/lib/passport/types";

export function AchievementDetailsModal({
  open,
  onOpenChange,
  achievement,
  lockedCode,
  identity,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  achievement: PassportAchievement | null;
  lockedCode?: string | null;
  identity: PassportIdentity;
}) {
  const locked = lockedCode ? stampByCode(lockedCode) : null;
  const courseName = achievement?.title ?? locked?.title ?? "Achievement";
  const completedOn = achievement?.completedOn?.slice(0, 10) ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(94vw,420px)] border border-[#D8C398] text-[#17283D] [&_button[aria-label=Close]]:bg-[#08182D]/10 [&_button[aria-label=Close]]:text-[#17283D]"
        style={{ background: "#FAF7EF" }}
      >
        <DialogHeader>
          <DialogTitle className="sp-serif text-[#08182D]">Stamp details</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-5 pb-6">
          <div className="flex justify-center">
            <AchievementStamp
              title={achievement?.stampTitle ?? locked?.title ?? "Stamp"}
              colour={achievement?.colour ?? locked?.colour ?? "#78828E"}
              status={achievement?.status ?? "locked"}
              size={112}
            />
          </div>

          <dl className="space-y-3 text-sm">
            <Row label="Course / achievement" value={courseName} />
            <Row
              label="Date of completion"
              value={achievement ? completedOn : "Not completed yet"}
            />
          </dl>

          <div className="border-t border-[#D8C398]/60 pt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#B69A59]">Student</p>
            <dl className="mt-2 space-y-2 text-sm">
              <Row label="Name" value={identity.fullName} />
              <Row label="Roll number" value={identity.rollNumber ?? "—"} />
              <Row label="Programme" value={identity.degree ?? "—"} />
              <Row label="Branch" value={identity.branch ?? "—"} />
              <Row label="Academic year" value={identity.academicYear ?? "—"} />
              <Row label="Passport" value={identity.passportNumber} />
            </dl>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9.5rem_1fr] gap-2 border-b border-[#D8C398]/40 py-1.5">
      <dt className="text-xs uppercase tracking-wide text-[#78828E]">{label}</dt>
      <dd className="text-[#17283D]">{value}</dd>
    </div>
  );
}
