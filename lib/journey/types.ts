import type { ExperienceLevel } from "@/lib/journey/catalog";

export type LookingFor = "internship" | "full_time" | "both" | "not_looking";

export type LearningPreferences = {
  degree: string;
  branch: string;
  rollNumber: string;
  experienceLevel: ExperienceLevel;
  careerPathId: string;
  careerPathSlug: string;
  technologies: string[];
  declaredSkills: string[];
  weeklyHours: number;
  goalsPaused: boolean;
  onboardingCompletedAt: string | null;
  /** Software / hiring profile fields */
  headline: string;
  phone: string;
  location: string;
  bio: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  leetcodeUrl: string;
  cgpa: string;
  graduationYear: number | null;
  lookingFor: LookingFor;
  preferredRoles: string;
};

export type MilestoneStatus = "recommended" | "available" | "in_progress" | "completed";

export type MilestoneProgress = {
  milestoneId: string;
  slug: string;
  title: string;
  summary: string;
  sortOrder: number;
  estimatedHours: number;
  status: MilestoneStatus;
  progressPercent: number;
  requiredSkills: string[];
  supportedSkills: string[];
  missingSkills: string[];
  practiceActivities: string[];
  projectChallenge: string;
  completionRequirements: string;
  optionalCertifications: string[];
  resources: {
    id: string;
    title: string;
    provider: string;
    url: string;
    resourceType: string;
    isFree: boolean;
    estimatedHours?: number;
    notes?: string;
  }[];
  dependsOn: string[];
  recommendedNext: boolean;
};

export type JourneyView = {
  pathTitle: string;
  pathSlug: string;
  pathSummary: string;
  weeklyHours: number;
  goalsPaused: boolean;
  completedCount: number;
  totalCount: number;
  coveragePercent: number;
  milestones: MilestoneProgress[];
  nextMilestone: MilestoneProgress | null;
  primaryAction: {
    title: string;
    reason: string;
    href: string;
  };
};
