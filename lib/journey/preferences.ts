import { cookies } from "next/headers";
import type { LearningPreferences } from "@/lib/journey/types";
import { getCareerPath } from "@/lib/journey/catalog";

export const PREFS_COOKIE = "ssp_learning_prefs";

const LOOKING_FOR = new Set(["internship", "full_time", "both", "not_looking"]);

export function emptyPreferences(): LearningPreferences {
  return {
    degree: "",
    branch: "",
    rollNumber: "",
    experienceLevel: "beginner",
    careerPathId: "",
    careerPathSlug: "",
    technologies: [],
    declaredSkills: [],
    weeklyHours: 5,
    goalsPaused: false,
    onboardingCompletedAt: null,
    headline: "",
    phone: "",
    location: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    leetcodeUrl: "",
    cgpa: "",
    graduationYear: null,
    lookingFor: "both",
    preferredRoles: "",
  };
}

function hydratePreferences(raw: Partial<LearningPreferences>): LearningPreferences {
  const normalized = normalizePreferencesInput({
    ...emptyPreferences(),
    ...raw,
    onboardingCompletedAt: raw.onboardingCompletedAt || new Date(0).toISOString(),
  });
  return {
    ...normalized,
    onboardingCompletedAt: raw.onboardingCompletedAt ?? null,
  };
}

export async function getLearningPreferences(
  _studentProfileId: string | null,
): Promise<LearningPreferences | null> {
  const jar = await cookies();
  const raw = jar.get(PREFS_COOKIE)?.value;
  if (!raw) return null;
  try {
    return hydratePreferences(JSON.parse(decodeURIComponent(raw)) as Partial<LearningPreferences>);
  } catch {
    return null;
  }
}

export function serializePreferences(prefs: LearningPreferences) {
  return encodeURIComponent(JSON.stringify(prefs));
}

function cleanUrl(value: string | undefined | null) {
  return (value ?? "").trim();
}

function parseGraduationYear(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const year = Math.round(n);
  if (year < 1990 || year > 2100) return null;
  return year;
}

export function normalizePreferencesInput(input: Partial<LearningPreferences>): LearningPreferences {
  const path = input.careerPathSlug || input.careerPathId
    ? getCareerPath(input.careerPathSlug || input.careerPathId || "")
    : null;
  const lookingRaw = (input.lookingFor ?? "both") as string;
  const lookingFor = LOOKING_FOR.has(lookingRaw)
    ? (lookingRaw as LearningPreferences["lookingFor"])
    : "both";

  return {
    degree: (input.degree ?? "").trim(),
    branch: (input.branch ?? "").trim(),
    rollNumber: (input.rollNumber ?? "").trim().toUpperCase(),
    experienceLevel: input.experienceLevel ?? "beginner",
    careerPathId: path?.id ?? input.careerPathId ?? "",
    careerPathSlug: path?.slug ?? input.careerPathSlug ?? "",
    technologies: Array.isArray(input.technologies) ? input.technologies : [],
    declaredSkills: Array.isArray(input.declaredSkills) ? input.declaredSkills : [],
    weeklyHours: Math.min(40, Math.max(1, Number(input.weeklyHours ?? 5))),
    goalsPaused: Boolean(input.goalsPaused),
    onboardingCompletedAt: input.onboardingCompletedAt ?? new Date().toISOString(),
    headline: (input.headline ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    location: (input.location ?? "").trim(),
    bio: (input.bio ?? "").trim(),
    linkedinUrl: cleanUrl(input.linkedinUrl),
    githubUrl: cleanUrl(input.githubUrl),
    portfolioUrl: cleanUrl(input.portfolioUrl),
    leetcodeUrl: cleanUrl(input.leetcodeUrl),
    cgpa: (input.cgpa ?? "").trim(),
    graduationYear: parseGraduationYear(input.graduationYear),
    lookingFor,
    preferredRoles: (input.preferredRoles ?? "").trim(),
  };
}
