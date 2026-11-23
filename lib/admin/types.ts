import type { VerificationStatus } from "@/types/supabase";

export type PlacementStatus =
  | "not_started"
  | "eligible"
  | "applied"
  | "interviewing"
  | "placed"
  | "opted_out";

export type TrainingEnrollmentStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "dropped";

export type AdminStudentRow = {
  id: string;
  name: string;
  email: string;
  passportId: string;
  rollNumber: string;
  degree: string;
  branch: string;
  academicYear: string;
  graduationYear: number;
  cgpa: number;
  academicEligible: boolean;
  needsSupport: boolean;
  supportReason: string | null;
  activeLearner: boolean;
  placementStatus: PlacementStatus;
  profileCompletion: number;
  skills: string[];
  technologyCategories: string[];
  certificateStats: {
    total: number;
    pending: number;
    institutionReviewed: number;
    issuerVerified: number;
    rejected: number;
  };
  trainingCompletionPercent: number;
  assessmentAverage: number | null;
  lastActivityAt: string | null;
};

export type AdminOverviewMetrics = {
  registeredStudents: number;
  byBranch: { label: string; count: number }[];
  byBatch: { label: string; count: number }[];
  byAcademicYear: { label: string; count: number }[];
  bySkill: { label: string; count: number }[];
  byPlacement: { label: string; count: number }[];
  activeLearners: number;
  certificatesTotal: number;
  certificatesVerified: number;
  certificatesPending: number;
  certificatesInstitutionReviewed: number;
  certificatesIssuerVerified: number;
  trainingCompleting: number;
  assessmentCompleted: number;
  placementEligible: number;
  needingSupport: number;
  recentActivity: {
    id: string;
    title: string;
    detail: string | null;
    createdAt: string;
    studentName?: string;
  }[];
};

export type AdminStudentCertificate = {
  id: string;
  title: string;
  issuer: string;
  status: VerificationStatus;
  pipelineStatus: string;
  issuedOn: string | null;
  expiresOn: string | null;
  credentialNumber: string | null;
  evidenceNote: string;
};

export type AdminStudentTraining = {
  id: string;
  programTitle: string;
  status: TrainingEnrollmentStatus;
  progressPercent: number;
  skillsGained: string[];
  assignedAt: string;
  completedAt: string | null;
};

export type AdminStudentAssessment = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: string;
  skill: string | null;
};

export type AdminStudentProject = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  reviewStatus: "self_submitted" | "reviewed";
  skills: string[];
};

export type AdminStudentPlacement = {
  id: string;
  companyName: string;
  jobRoleTitle: string;
  stage: string;
  status: string;
  missingSkills: string[];
  appliedAt: string;
};

export type AdminStudentActivity = {
  id: string;
  title: string;
  detail: string | null;
  createdAt: string;
  eventType: string;
};

export type Student360 = {
  profile: AdminStudentRow;
  overview: {
    summary: string;
    evidenceHighlights: string[];
  };
  academics: {
    degree: string;
    branch: string;
    academicYear: string;
    graduationYear: number;
    cgpa: number;
    academicEligible: boolean;
    eligibilityNote: string;
  };
  skills: {
    name: string;
    category: string;
    strongestEvidence: string;
    evidenceCount: number;
  }[];
  certificates: AdminStudentCertificate[];
  training: AdminStudentTraining[];
  assessments: AdminStudentAssessment[];
  projects: AdminStudentProject[];
  placement: {
    status: PlacementStatus;
    applications: AdminStudentPlacement[];
    note: string;
  };
  activity: AdminStudentActivity[];
};

export type StudentDirectoryFilters = {
  q?: string;
  branch?: string;
  academicYear?: string;
  graduationYear?: string;
  minCgpa?: string;
  academicEligible?: string;
  skill?: string;
  technologyCategory?: string;
  verificationStatus?: string;
  training?: string;
  assessment?: string;
  placementStatus?: string;
  needsSupport?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: string;
  pageSize?: string;
};
