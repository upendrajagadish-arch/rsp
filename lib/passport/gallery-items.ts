import { STAMP_CATEGORIES } from "@/lib/passport/stamp-categories";
import type { PassportAchievement, SkillPassportBundle } from "@/lib/passport/types";

export type PassportGalleryItem = {
  index: number;
  title: string;
  artist: string;
  year: string;
  priceLabel: string;
  description: string;
  colour: string;
  status: PassportAchievement["status"] | "locked";
  achievement: PassportAchievement | null;
  stampCode: string;
};

/** Nine wall pieces: verified/submitted first, then locked category placeholders. */
export function buildPassportGalleryItems(bundle: SkillPassportBundle): PassportGalleryItem[] {
  const earned = bundle.achievements.filter(
    (a) => a.status === "verified" || a.status === "submitted" || a.status === "rejected",
  );
  const items: PassportGalleryItem[] = [];

  for (let i = 0; i < 9; i++) {
    const ach = earned[i];
    if (ach) {
      const year = (ach.verifiedAt ?? ach.completedOn ?? "2024").slice(0, 4);
      items.push({
        index: i,
        title: ach.title,
        artist: ach.stampTitle,
        year,
        priceLabel: ach.status === "verified" ? "Verified" : ach.status === "submitted" ? "Pending" : "Review",
        description:
          ach.evidenceNote ??
          `${ach.stampTitle} recorded in the Skill Passport. ${
            ach.issuer ? `Issuer: ${ach.issuer}.` : ""
          } Printed on archival institutional stock with a soft matte finish.`,
        colour: ach.colour,
        status: ach.status,
        achievement: ach,
        stampCode: ach.stampCode,
      });
    } else {
      const cat = STAMP_CATEGORIES[i % STAMP_CATEGORIES.length];
      items.push({
        index: i,
        title: cat.title,
        artist: "Awaiting stamp",
        year: "—",
        priceLabel: "Locked",
        description: `Earn the “${cat.title}” stamp through verified evidence. Reserved space in your Skill Passport booklet.`,
        colour: cat.colour,
        status: "locked",
        achievement: null,
        stampCode: cat.code,
      });
    }
  }

  return items;
}
