"use client";

import { AchievementStamp } from "@/components/passport/stamps/achievement-stamp";
import { stampByCode } from "@/lib/passport/stamp-categories";
import type { PassportAchievement } from "@/lib/passport/types";

type Props = {
  achievement?: PassportAchievement | null;
  lockedCategoryCode?: string;
  onOpen?: () => void;
};

export function AchievementStampSlot({
  achievement,
  lockedCategoryCode,
  onOpen,
}: Props) {
  if (achievement) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full flex-col items-center gap-2 rounded-sm p-2 text-left transition hover:bg-[#08182D]/[0.03]"
      >
        <AchievementStamp
          title={achievement.stampTitle}
          colour={achievement.colour}
          status={achievement.status}
        />
        <div className="w-full min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-[#B69A59]">
            {achievement.stampTitle}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[#17283D]">{achievement.title}</p>
          <p className="mt-0.5 text-xs text-[#78828E]">
            {achievement.issuer ?? "—"}
            {achievement.completedOn ? ` · ${achievement.completedOn}` : ""}
          </p>
        </div>
      </button>
    );
  }

  const cat = lockedCategoryCode ? stampByCode(lockedCategoryCode) : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col items-center gap-2 rounded-sm border border-dashed border-[#D8C398]/80 bg-transparent p-2 text-center"
    >
      <AchievementStamp
        title={cat?.title ?? "Achievement"}
        colour={cat?.colour ?? "#78828E"}
        status="locked"
      />
      <p className="text-xs text-[#78828E]">
        {cat ? `Earn: ${cat.title}` : "Reserved stamp space"}
      </p>
    </button>
  );
}
