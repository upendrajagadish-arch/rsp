import { getCareerPath } from "@/lib/journey/catalog";
import type { LearningPreferences, JourneyView, MilestoneProgress } from "@/lib/journey/types";
import { demoSkills } from "@/lib/demo/data";

function normalizeSkillName(value: string) {
  return value.trim().toLowerCase();
}

export function evidencedSkillNames(options?: {
  declaredSkills?: string[];
  demoSkillNames?: string[];
}) {
  const names = new Set<string>();
  for (const s of options?.declaredSkills ?? []) names.add(normalizeSkillName(s));
  for (const s of options?.demoSkillNames ?? demoSkills.map((d) => d.name)) {
    names.add(normalizeSkillName(s));
  }
  return names;
}

export function buildJourneyView(
  prefs: LearningPreferences,
  evidenced: Set<string>,
): JourneyView | null {
  const path = getCareerPath(prefs.careerPathSlug || prefs.careerPathId);
  if (!path) return null;

  const completedSlugs = new Set<string>();
  const milestones: MilestoneProgress[] = path.milestones
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => {
      const supported = m.requiredSkills.filter((s) => evidenced.has(normalizeSkillName(s)));
      const missing = m.requiredSkills.filter((s) => !evidenced.has(normalizeSkillName(s)));
      const depsMet = m.dependsOn.every((dep) => completedSlugs.has(dep));
      const progressPercent =
        m.requiredSkills.length === 0
          ? 0
          : Math.round((supported.length / m.requiredSkills.length) * 100);

      let status: MilestoneProgress["status"] = "available";
      if (progressPercent >= 100) {
        status = "completed";
        completedSlugs.add(m.slug);
      } else if (progressPercent > 0) {
        status = "in_progress";
      } else if (!depsMet) {
        status = "available"; // explorative: not locked out, only sequencing hint
      }

      return {
        milestoneId: m.id,
        slug: m.slug,
        title: m.title,
        summary: m.summary,
        sortOrder: m.sortOrder,
        estimatedHours: m.estimatedHours,
        status,
        progressPercent,
        requiredSkills: m.requiredSkills,
        supportedSkills: supported,
        missingSkills: missing,
        practiceActivities: m.practiceActivities,
        projectChallenge: m.projectChallenge,
        completionRequirements: m.completionRequirements,
        optionalCertifications: m.optionalCertifications,
        resources: m.resources,
        dependsOn: m.dependsOn,
        recommendedNext: false,
      };
    });

  // Mark first non-completed milestone as recommended sequencing
  const next = milestones.find((m) => m.status !== "completed") ?? null;
  if (next) next.recommendedNext = true;

  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const totalCount = milestones.length;
  const coveragePercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 1000) / 10;

  const primaryAction = prefs.goalsPaused
    ? {
        title: "Learning goals are paused",
        reason: "Resume when ready — your milestones and evidence remain intact.",
        href: "/student/journey",
      }
    : next
      ? {
          title: `Continue: ${next.title}`,
          reason: next.missingSkills.length
            ? `Build evidence for ${next.missingSkills.slice(0, 2).join(", ")}.`
            : "Review completion requirements and submit practice evidence.",
          href: `/student/journey#${next.slug}`,
        }
      : {
          title: "Explore more practice",
          reason: "You have completed the current roadmap milestones. Deepen evidence with projects.",
          href: "/student/projects",
        };

  return {
    pathTitle: path.title,
    pathSlug: path.slug,
    pathSummary: path.summary,
    weeklyHours: prefs.weeklyHours,
    goalsPaused: prefs.goalsPaused,
    completedCount,
    totalCount,
    coveragePercent,
    milestones,
    nextMilestone: next,
    primaryAction,
  };
}
