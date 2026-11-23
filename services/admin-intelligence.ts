import { isDemoMode } from "@/lib/demo/mode";
import {
  ACADEMIC_YEARS,
  buildDemoAdminOverview,
  demoAdminStudents,
  fillAcademicYears,
  getDemoStudent360,
} from "@/lib/demo/admin-intelligence";
import type {
  AdminOverviewMetrics,
  AdminStudentRow,
  Student360,
  StudentDirectoryFilters,
} from "@/lib/admin/types";

export type StudentDirectoryResult = {
  rows: AdminStudentRow[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    branches: string[];
    academicYears: string[];
    graduationYears: number[];
    skills: string[];
    technologyCategories: string[];
    placementStatuses: string[];
  };
};

function parsePage(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function matchesFilters(row: AdminStudentRow, filters: StudentDirectoryFilters) {
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    const hay = `${row.name} ${row.rollNumber} ${row.passportId} ${row.email}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filters.branch && row.branch !== filters.branch) return false;
  if (filters.academicYear && row.academicYear !== filters.academicYear) return false;
  if (filters.graduationYear && String(row.graduationYear) !== filters.graduationYear) return false;
  if (filters.minCgpa) {
    const min = Number(filters.minCgpa);
    if (Number.isFinite(min) && row.cgpa < min) return false;
  }
  if (filters.academicEligible === "true" && !row.academicEligible) return false;
  if (filters.academicEligible === "false" && row.academicEligible) return false;
  if (filters.skill) {
    const skill = filters.skill.toLowerCase();
    if (!row.skills.some((s) => s.toLowerCase() === skill)) return false;
  }
  if (filters.technologyCategory) {
    if (!row.technologyCategories.includes(filters.technologyCategory)) return false;
  }
  if (filters.verificationStatus) {
    const v = filters.verificationStatus;
    if (v === "pending" && row.certificateStats.pending === 0) return false;
    if (v === "institution_reviewed" && row.certificateStats.institutionReviewed === 0) return false;
    if (v === "issuer_verified" && row.certificateStats.issuerVerified === 0) return false;
    if (v === "rejected" && row.certificateStats.rejected === 0) return false;
    if (v === "none" && row.certificateStats.total > 0) return false;
  }
  if (filters.training === "completed" && row.trainingCompletionPercent < 100) return false;
  if (filters.training === "in_progress" && !(row.trainingCompletionPercent > 0 && row.trainingCompletionPercent < 100))
    return false;
  if (filters.training === "none" && row.trainingCompletionPercent > 0) return false;
  if (filters.assessment === "completed" && row.assessmentAverage == null) return false;
  if (filters.assessment === "missing" && row.assessmentAverage != null) return false;
  if (filters.placementStatus && row.placementStatus !== filters.placementStatus) return false;
  if (filters.needsSupport === "true" && !row.needsSupport) return false;
  if (filters.needsSupport === "false" && row.needsSupport) return false;
  return true;
}

function sortRows(rows: AdminStudentRow[], sort?: string, order: "asc" | "desc" = "asc") {
  const dir = order === "desc" ? -1 : 1;
  const key = sort || "name";
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av ?? "").localeCompare(String(bv ?? ""), undefined, { sensitivity: "base" }) * dir;
  });
}

function facetsFrom(rows: AdminStudentRow[]) {
  return {
    branches: [...new Set(rows.map((r) => r.branch))].sort(),
    academicYears: [...ACADEMIC_YEARS],
    graduationYears: [...new Set(rows.map((r) => r.graduationYear))].sort((a, b) => a - b),
    skills: [...new Set(rows.flatMap((r) => r.skills))].sort(),
    technologyCategories: [...new Set(rows.flatMap((r) => r.technologyCategories))].sort(),
    placementStatuses: [...new Set(rows.map((r) => r.placementStatus))].sort(),
  };
}

export async function getAdminOverview(
  _organizationId: string,
): Promise<AdminOverviewMetrics> {
  if (isDemoMode()) return buildDemoAdminOverview();

  // Live path: until Supabase admin aggregates are wired, use demo-shaped empty shell
  // rather than inventing numbers. Prefer real queries once tables are populated.
  return {
    registeredStudents: 0,
    byBranch: [],
    byBatch: [],
    byAcademicYear: fillAcademicYears([]),
    bySkill: [],
    byPlacement: [],
    activeLearners: 0,
    certificatesTotal: 0,
    certificatesVerified: 0,
    certificatesPending: 0,
    certificatesInstitutionReviewed: 0,
    certificatesIssuerVerified: 0,
    trainingCompleting: 0,
    assessmentCompleted: 0,
    placementEligible: 0,
    needingSupport: 0,
    recentActivity: [],
  };
}

export async function listAdminStudents(
  _organizationId: string,
  filters: StudentDirectoryFilters = {},
): Promise<StudentDirectoryResult> {
  const source = isDemoMode() ? demoAdminStudents : [];
  const filtered = source.filter((row) => matchesFilters(row, filters));
  const sorted = sortRows(filtered, filters.sort, filters.order === "desc" ? "desc" : "asc");
  const pageSize = Math.min(50, parsePage(filters.pageSize, 10));
  const page = parsePage(filters.page, 1);
  const start = (page - 1) * pageSize;

  return {
    rows: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
    facets: facetsFrom(source),
  };
}

export async function getAdminStudent360(
  _organizationId: string,
  studentId: string,
): Promise<Student360 | null> {
  if (isDemoMode()) return getDemoStudent360(studentId);
  return null;
}

export function studentsToCsv(rows: AdminStudentRow[]) {
  const headers = [
    "name",
    "email",
    "roll_number",
    "passport_id",
    "degree",
    "branch",
    "academic_year",
    "graduation_year",
    "cgpa",
    "academic_eligible",
    "placement_status",
    "active_learner",
    "needs_support",
    "training_completion_percent",
    "assessment_average",
    "skills",
    "pending_certificates",
    "institution_reviewed_certificates",
    "issuer_verified_certificates",
  ];
  const escape = (v: string | number | boolean | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.name,
        r.email,
        r.rollNumber,
        r.passportId,
        r.degree,
        r.branch,
        r.academicYear,
        r.graduationYear,
        r.cgpa,
        r.academicEligible,
        r.placementStatus,
        r.activeLearner,
        r.needsSupport,
        r.trainingCompletionPercent,
        r.assessmentAverage ?? "",
        r.skills.join("; "),
        r.certificateStats.pending,
        r.certificateStats.institutionReviewed,
        r.certificateStats.issuerVerified,
      ]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

/** Excel-friendly TSV (opens cleanly in Excel without extra libraries). */
export function studentsToExcelTsv(rows: AdminStudentRow[]) {
  return studentsToCsv(rows).replaceAll(",", "\t");
}

export async function listAdminStudentsForExport(
  organizationId: string,
  filters: StudentDirectoryFilters,
) {
  const all = await listAdminStudents(organizationId, {
    ...filters,
    page: "1",
    pageSize: "10000",
  });
  return all.rows;
}
