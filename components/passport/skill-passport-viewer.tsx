"use client";

import { useEffect, useState } from "react";
import { PassportCover } from "@/components/passport/passport-cover";
import { PassportGallery } from "@/components/passport/passport-gallery";
import { AchievementDetailsModal } from "@/components/passport/achievement-details-modal";
import { AchievementStamp } from "@/components/passport/stamps/achievement-stamp";
import type {
  PassportAchievement,
  PassportViewerMode,
  SkillPassportBundle,
} from "@/lib/passport/types";
import { cn } from "@/lib/utils";

type Props = {
  bundle: SkillPassportBundle;
  viewerMode: PassportViewerMode;
  onPersistPage?: (page: number) => void;
  onMarkUnlocksSeen?: (ids: string[]) => void;
};

export function SkillPassportViewer({
  bundle,
  viewerMode,
  onPersistPage,
  onMarkUnlocksSeen,
}: Props) {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [detail, setDetail] = useState<PassportAchievement | null>(null);
  const [lockedCode, setLockedCode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockQueue, setUnlockQueue] = useState(bundle.pendingUnlockIds);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    if (opened && unlockQueue.length) setShowUnlock(true);
  }, [opened, unlockQueue.length]);

  useEffect(() => {
    if (!opened) return;
    onPersistPage?.(1);
  }, [opened, onPersistPage]);

  function openAchievement(a: PassportAchievement | null, code?: string) {
    setDetail(a);
    setLockedCode(code ?? null);
    setModalOpen(true);
  }

  function dismissUnlock() {
    const ids = unlockQueue;
    setShowUnlock(false);
    setUnlockQueue([]);
    onMarkUnlocksSeen?.(ids);
  }

  function finishOpen() {
    setOpening(false);
    setOpened(true);
  }

  function openBook() {
    if (opening) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finishOpen();
      return;
    }
    setOpening(true);
  }

  function closeToCover() {
    setOpened(false);
    setOpening(false);
  }

  const unlockAch = bundle.achievements.find((a) => a.id === unlockQueue[0]);

  return (
    <div className={cn("skill-passport relative", opened && "pg-host")}>
      {!opened ? (
        <PassportCover
          organizationName={bundle.identity.organizationName}
          passportNumber={bundle.identity.passportNumber}
          batchLabel={
            bundle.identity.graduationYear
              ? String(bundle.identity.graduationYear)
              : bundle.identity.academicYear ?? "--"
          }
          opening={opening}
          onRequestOpen={openBook}
          onOpened={finishOpen}
        />
      ) : (
        <div className="pg-viewer-shell">
          {viewerMode === "administrator" ? (
            <p className="pg-admin-flag">Admin passport gallery</p>
          ) : null}
          <PassportGallery
            bundle={bundle}
            onOpenAchievement={openAchievement}
            onBackToCover={closeToCover}
          />
        </div>
      )}

      {showUnlock && unlockAch ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#08182D]/70 p-4">
          <div className="skill-passport-paper max-w-sm border border-[#B69A59] p-8 text-center shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B69A59]">
              New stamp verified
            </p>
            <div data-sp-motion className="sp-stamp-press mx-auto mt-4 origin-bottom">
              <AchievementStamp
                title={unlockAch.stampTitle}
                colour={unlockAch.colour}
                status="verified"
                size={140}
              />
            </div>
            <p className="sp-serif mt-4 text-xl text-[#08182D]">{unlockAch.title}</p>
            <p className="mt-1 text-xs text-[#78828E]">
              Verified {unlockAch.verifiedAt?.slice(0, 10) ?? ""}
            </p>
            <button
              type="button"
              onClick={dismissUnlock}
              className="mt-6 border border-[#08182D] bg-[#08182D] px-5 py-2 text-xs uppercase tracking-wider text-[#D8C398]"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      <AchievementDetailsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        achievement={detail}
        lockedCode={lockedCode}
      />
    </div>
  );
}
