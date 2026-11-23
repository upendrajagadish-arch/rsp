import { describe, expect, it } from "vitest";
import { buildJourneyView, evidencedSkillNames } from "@/services/journey";
import type { LearningPreferences } from "@/lib/journey/types";

const basePrefs: LearningPreferences = {
  degree: "B.Tech",
  branch: "CSE",
  rollNumber: "CSE21001",
  experienceLevel: "beginner",
  careerPathId: "path-frontend",
  careerPathSlug: "frontend-developer",
  technologies: ["React"],
  declaredSkills: ["JavaScript"],
  weeklyHours: 6,
  goalsPaused: false,
  onboardingCompletedAt: "2026-03-21T00:00:00.000Z",
  headline: "",
  phone: "",
  location: "",
  bio: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  leetcodeUrl: "",
  cgpa: "",
  graduationYear: 2026,
  lookingFor: "both",
  preferredRoles: "",
};

describe("buildJourneyView", () => {
  it("returns a roadmap for a selected career path", () => {
    const journey = buildJourneyView(
      basePrefs,
      evidencedSkillNames({ declaredSkills: basePrefs.declaredSkills, demoSkillNames: [] }),
    );
    expect(journey).not.toBeNull();
    expect(journey!.pathSlug).toBe("frontend-developer");
    expect(journey!.totalCount).toBeGreaterThan(0);
    expect(journey!.nextMilestone).not.toBeNull();
    expect(journey!.primaryAction.href).toContain("/student/journey");
  });

  it("does not lock exploration when dependencies are incomplete", () => {
    const journey = buildJourneyView(
      basePrefs,
      evidencedSkillNames({ declaredSkills: [], demoSkillNames: [] }),
    );
    const later = journey!.milestones.find((m) => m.dependsOn.length > 0);
    expect(later).toBeTruthy();
    expect(later!.status).not.toBe("locked" as never);
  });
});
