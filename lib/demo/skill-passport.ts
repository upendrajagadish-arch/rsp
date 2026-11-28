import { STAMP_CATEGORIES } from "@/lib/passport/stamp-categories";
import { levelForVerifiedCount } from "@/lib/passport/tokens";
import type {
  PassportAchievement,
  PassportIdentity,
  SkillPassportBundle,
} from "@/lib/passport/types";
import { demoAdminStudents } from "@/lib/demo/admin-intelligence";
import { studentPhoto } from "@/lib/admin/student-photos";

const ORG = "Demo Institute of Technology";

function achievementCode(n: number) {
  return `SSP-ACH-${String(n).padStart(6, "0")}`;
}

function baseAchievements(studentId: string): PassportAchievement[] {
  const stamp = (code: string) => STAMP_CATEGORIES.find((c) => c.code === code)!;
  const rows: Omit<PassportAchievement, "id">[] = [
    {
      stampCode: "01",
      stampTitle: stamp("01").title,
      colour: stamp("01").colour,
      iconKey: stamp("01").iconKey,
      pageGroup: "certifications",
      title: "Python Programming",
      issuer: "Demo Institute / External",
      completedOn: "2025-11-02",
      status: "verified",
      achievementCode: achievementCode(101),
      evidenceNote: "Institution-reviewed credential evidence",
      verifiedAt: "2025-11-10T10:00:00.000Z",
      seenUnlockAt: "2025-11-10T12:00:00.000Z",
      sourceType: "certificate",
      sourceId: `${studentId}-cert-python`,
      physicalStatus: "issued",
    },
    {
      stampCode: "01",
      stampTitle: stamp("01").title,
      colour: stamp("01").colour,
      iconKey: stamp("01").iconKey,
      pageGroup: "certifications",
      title: "React Fundamentals",
      issuer: "Demo Training Hub",
      completedOn: "2026-02-14",
      status: "submitted",
      achievementCode: achievementCode(102),
      evidenceNote: "Awaiting institutional review",
      verifiedAt: null,
      seenUnlockAt: null,
      sourceType: "certificate",
      sourceId: `${studentId}-cert-react`,
      physicalStatus: null,
    },
    {
      stampCode: "02",
      stampTitle: stamp("02").title,
      colour: stamp("02").colour,
      iconKey: stamp("02").iconKey,
      pageGroup: "projects",
      title: "Campus Placement Portal",
      issuer: "Self / Faculty reviewed",
      completedOn: "2026-01-20",
      status: "verified",
      achievementCode: achievementCode(103),
      evidenceNote: "Project with evidence links",
      verifiedAt: "2026-01-22T09:00:00.000Z",
      seenUnlockAt: null,
      sourceType: "project",
      sourceId: `${studentId}-proj-1`,
      physicalStatus: "eligible",
    },
    {
      stampCode: "03",
      stampTitle: stamp("03").title,
      colour: stamp("03").colour,
      iconKey: stamp("03").iconKey,
      pageGroup: "internships",
      title: "Software Engineering Intern",
      issuer: "Demo Soft Pvt Ltd",
      completedOn: "2025-08-30",
      status: "verified",
      achievementCode: achievementCode(104),
      evidenceNote: "Internship completion letter",
      verifiedAt: "2025-09-05T11:00:00.000Z",
      seenUnlockAt: "2025-09-06T08:00:00.000Z",
      sourceType: "manual",
      sourceId: `${studentId}-intern-1`,
      physicalStatus: "ready_for_collection",
    },
    {
      stampCode: "06",
      stampTitle: stamp("06").title,
      colour: stamp("06").colour,
      iconKey: stamp("06").iconKey,
      pageGroup: "leadership",
      title: "Technical Club Secretary",
      issuer: "Student Affairs",
      completedOn: "2025-12-01",
      status: "verified",
      achievementCode: achievementCode(105),
      evidenceNote: "Leadership appointment letter",
      verifiedAt: "2025-12-03T10:00:00.000Z",
      seenUnlockAt: "2025-12-03T15:00:00.000Z",
      sourceType: "manual",
      sourceId: `${studentId}-lead-1`,
      physicalStatus: "issued",
    },
  ];

  return rows.map((r, i) => ({ ...r, id: `${studentId}-ach-${i + 1}` }));
}

export function getDemoSkillPassport(studentProfileId: string): SkillPassportBundle | null {
  const student =
    demoAdminStudents.find((s) => s.id === studentProfileId) ??
    demoAdminStudents.find((s) => s.id === "demo-student-profile");
  if (!student) return null;

  const achievements = baseAchievements(student.id);
  // Student needing support gets fewer verified stamps
  const filtered =
    student.needsSupport && student.id !== "demo-student-profile"
      ? achievements.filter((a) => a.status !== "verified").concat(achievements.slice(0, 1))
      : achievements;

  const verified = filtered.filter((a) => a.status === "verified");
  const level = levelForVerifiedCount(verified.length);
  const identity: PassportIdentity = {
    studentProfileId: student.id,
    fullName: student.name,
    photoUrl: studentPhoto(student),
    rollNumber: student.rollNumber,
    registrationNumber: null,
    degree: student.degree,
    branch: student.branch,
    academicYear: student.academicYear,
    graduationYear: student.graduationYear,
    passportId: student.passportId,
    passportNumber: `SSP-BOOK-${student.rollNumber}`,
    issuedAt: "2025-08-01T00:00:00.000Z",
    academicStatus: student.academicEligible ? "Active — Eligible" : "Active — Support",
    verificationStatus: "Institution endorsed",
    organizationName: ORG,
    email: student.email,
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    identity,
    achievements: filtered,
    overview: {
      verifiedCount: verified.length,
      submittedCount: filtered.filter((a) => a.status === "submitted").length,
      certificationCount: filtered.filter(
        (a) => a.pageGroup === "certifications" && a.status === "verified",
      ).length,
      projectCount: filtered.filter(
        (a) => a.pageGroup === "projects" && a.status === "verified",
      ).length,
      internshipCount: filtered.filter(
        (a) => a.pageGroup === "internships" && a.status === "verified",
      ).length,
      pendingVerification: filtered.filter((a) => a.status === "submitted").length,
      levelKey: level.key,
      levelLabel: level.label,
      physicalIssued: filtered.filter((a) => a.physicalStatus === "issued").length,
      physicalPending: filtered.filter(
        (a) =>
          a.physicalStatus === "eligible" ||
          a.physicalStatus === "ready_for_collection" ||
          a.physicalStatus === "awaiting_allocation",
      ).length,
      lastAchievementAt: verified.sort((a, b) =>
        String(b.verifiedAt).localeCompare(String(a.verifiedAt)),
      )[0]?.verifiedAt ?? null,
    },
    categories: STAMP_CATEGORIES,
    lastPage: 0,
    pendingUnlockIds: filtered
      .filter((a) => a.status === "verified" && !a.seenUnlockAt)
      .map((a) => a.id),
    verifyUrl: `${appUrl}/verify/passport/${encodeURIComponent(identity.passportNumber)}`,
  };
}

/** In-memory mutation store for demo admin actions within a process. */
const demoMutations = new Map<string, PassportAchievement[]>();

export function getDemoAchievementsMutable(studentProfileId: string) {
  if (!demoMutations.has(studentProfileId)) {
    const bundle = getDemoSkillPassport(studentProfileId);
    demoMutations.set(studentProfileId, bundle?.achievements.map((a) => ({ ...a })) ?? []);
  }
  return demoMutations.get(studentProfileId)!;
}

export function rebuildDemoBundle(studentProfileId: string): SkillPassportBundle | null {
  const base = getDemoSkillPassport(studentProfileId);
  if (!base) return null;
  const achievements = getDemoAchievementsMutable(studentProfileId);
  const verified = achievements.filter((a) => a.status === "verified");
  const level = levelForVerifiedCount(verified.length);
  return {
    ...base,
    achievements,
    overview: {
      ...base.overview,
      verifiedCount: verified.length,
      submittedCount: achievements.filter((a) => a.status === "submitted").length,
      certificationCount: achievements.filter(
        (a) => a.pageGroup === "certifications" && a.status === "verified",
      ).length,
      projectCount: achievements.filter(
        (a) => a.pageGroup === "projects" && a.status === "verified",
      ).length,
      internshipCount: achievements.filter(
        (a) => a.pageGroup === "internships" && a.status === "verified",
      ).length,
      pendingVerification: achievements.filter((a) => a.status === "submitted").length,
      levelKey: level.key,
      levelLabel: level.label,
      physicalIssued: achievements.filter((a) => a.physicalStatus === "issued").length,
      physicalPending: achievements.filter(
        (a) =>
          a.physicalStatus === "eligible" ||
          a.physicalStatus === "ready_for_collection" ||
          a.physicalStatus === "awaiting_allocation",
      ).length,
      lastAchievementAt:
        verified.sort((a, b) => String(b.verifiedAt).localeCompare(String(a.verifiedAt)))[0]
          ?.verifiedAt ?? null,
    },
    pendingUnlockIds: achievements
      .filter((a) => a.status === "verified" && !a.seenUnlockAt)
      .map((a) => a.id),
  };
}
