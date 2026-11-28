/** Skill Passport design tokens (SSP navy–gold institutional system). */
export const PASSPORT_COLORS = {
  midnightNavy: "#08182D",
  deepNavy: "#102743",
  antiqueGold: "#B69A59",
  champagneGold: "#D8C398",
  warmIvory: "#FAF7EF",
  paperWhite: "#FFFEFA",
  primaryText: "#17283D",
  mutedText: "#78828E",
} as const;

export const PASSPORT_LEVELS = [
  { key: "skill_beginner", label: "Skill Beginner", minVerified: 0 },
  { key: "skill_explorer", label: "Skill Explorer", minVerified: 3 },
  { key: "skill_achiever", label: "Skill Achiever", minVerified: 8 },
  { key: "skill_professional", label: "Skill Professional", minVerified: 15 },
  { key: "skill_champion", label: "Skill Champion", minVerified: 25 },
  { key: "hall_of_fame", label: "SSP Hall of Fame", minVerified: 40 },
] as const;

export function levelForVerifiedCount(count: number): (typeof PASSPORT_LEVELS)[number] {
  let current: (typeof PASSPORT_LEVELS)[number] = PASSPORT_LEVELS[0];
  for (const level of PASSPORT_LEVELS) {
    if (count >= level.minVerified) current = level;
  }
  return current;
}
