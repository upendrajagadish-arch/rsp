import type { StampCategoryDef } from "@/lib/passport/stamp-categories";

export type PassportViewerMode =
  | "student"
  | "administrator"
  | "faculty_reviewer"
  | "public";

export type AchievementStatus =
  | "locked"
  | "submitted"
  | "verified"
  | "rejected"
  | "revoked";

export type PhysicalStampStatus =
  | "eligible"
  | "awaiting_allocation"
  | "ready_for_collection"
  | "issued"
  | "replacement_requested"
  | "cancelled";

export type PassportIdentity = {
  studentProfileId: string;
  fullName: string;
  photoUrl: string | null;
  rollNumber: string | null;
  registrationNumber: string | null;
  degree: string | null;
  branch: string | null;
  academicYear: string | null;
  graduationYear: number | null;
  passportId: string;
  passportNumber: string;
  issuedAt: string;
  academicStatus: string;
  verificationStatus: string;
  organizationName: string;
  email?: string | null;
};

export type PassportAchievement = {
  id: string;
  stampCode: string;
  stampTitle: string;
  colour: string;
  iconKey: string;
  pageGroup: string;
  title: string;
  issuer: string | null;
  completedOn: string | null;
  status: AchievementStatus;
  achievementCode: string;
  evidenceNote: string | null;
  verifiedAt: string | null;
  seenUnlockAt: string | null;
  sourceType: string;
  sourceId: string | null;
  physicalStatus: PhysicalStampStatus | null;
};

export type PassportOverview = {
  verifiedCount: number;
  submittedCount: number;
  certificationCount: number;
  projectCount: number;
  internshipCount: number;
  pendingVerification: number;
  levelKey: string;
  levelLabel: string;
  physicalIssued: number;
  physicalPending: number;
  lastAchievementAt: string | null;
};

export type SkillPassportBundle = {
  identity: PassportIdentity;
  achievements: PassportAchievement[];
  overview: PassportOverview;
  categories: StampCategoryDef[];
  lastPage: number;
  pendingUnlockIds: string[];
  verifyUrl: string;
};
