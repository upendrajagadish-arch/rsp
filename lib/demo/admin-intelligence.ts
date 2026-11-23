import type {
  AdminOverviewMetrics,
  AdminStudentRow,
  Student360,
} from "@/lib/admin/types";

export const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"] as const;

/** Always emit 1st–4th year rows so charts/filters show the full college span. */
export function fillAcademicYears(
  counts: Map<string, number> | { label: string; count: number }[],
): { label: string; count: number }[] {
  const map =
    counts instanceof Map
      ? counts
      : new Map(counts.map((r) => [r.label, r.count]));
  return ACADEMIC_YEARS.map((label) => ({
    label,
    count: map.get(label) ?? 0,
  }));
}

/** Org-scoped demo roster for T&P admin intelligence (demo mode only). */
export const demoAdminStudents: AdminStudentRow[] = [
  {
    id: "demo-student-profile",
    name: "Aisha Rahman",
    email: "student@demo.edu",
    passportId: "SSP-DEMO-0001",
    rollNumber: "CSE21001",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 8.4,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "eligible",
    profileCompletion: 72,
    skills: ["Python", "SQL", "React", "AWS Services"],
    technologyCategories: ["Programming Languages", "Databases", "Web Development", "Cloud Technologies"],
    certificateStats: {
      total: 3,
      pending: 1,
      institutionReviewed: 1,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 65,
    assessmentAverage: 78,
    lastActivityAt: "2026-03-18T09:00:00.000Z",
  },
  {
    id: "s2",
    name: "Rohan Mehta",
    email: "rohan.mehta@demo.edu",
    passportId: "SSP-DEMO-0002",
    rollNumber: "IT21014",
    degree: "B.Tech",
    branch: "Information Technology",
    academicYear: "4th Year",
    graduationYear: 2025,
    cgpa: 9.1,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "interviewing",
    profileCompletion: 88,
    skills: ["Java", "Spring Boot", "SQL", "Docker"],
    technologyCategories: ["Programming Languages", "Backend", "Databases", "DevOps"],
    certificateStats: {
      total: 4,
      pending: 0,
      institutionReviewed: 2,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 100,
    assessmentAverage: 91,
    lastActivityAt: "2026-03-19T14:20:00.000Z",
  },
  {
    id: "s3",
    name: "Sara Ali",
    email: "sara.ali@demo.edu",
    passportId: "SSP-DEMO-0003",
    rollNumber: "ECE22008",
    degree: "B.Tech",
    branch: "Electronics",
    academicYear: "3rd Year",
    graduationYear: 2026,
    cgpa: 7.2,
    academicEligible: true,
    needsSupport: true,
    supportReason: "Assessment scores below department threshold in core coding modules",
    activeLearner: false,
    placementStatus: "not_started",
    profileCompletion: 64,
    skills: ["C", "Embedded C", "Python"],
    technologyCategories: ["Programming Languages", "Embedded Systems"],
    certificateStats: {
      total: 1,
      pending: 1,
      institutionReviewed: 0,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 20,
    assessmentAverage: 54,
    lastActivityAt: "2026-02-28T11:00:00.000Z",
  },
  {
    id: "s4",
    name: "Vikram Patel",
    email: "vikram.patel@demo.edu",
    passportId: "SSP-DEMO-0004",
    rollNumber: "CSE21022",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 6.8,
    academicEligible: false,
    needsSupport: true,
    supportReason: "CGPA below academic eligibility cutoff (7.0)",
    activeLearner: true,
    placementStatus: "not_started",
    profileCompletion: 55,
    skills: ["JavaScript", "HTML", "CSS"],
    technologyCategories: ["Web Development"],
    certificateStats: {
      total: 2,
      pending: 0,
      institutionReviewed: 1,
      issuerVerified: 0,
      rejected: 1,
    },
    trainingCompletionPercent: 40,
    assessmentAverage: 62,
    lastActivityAt: "2026-03-15T16:40:00.000Z",
  },
  {
    id: "s5",
    name: "Neha Sharma",
    email: "neha.sharma@demo.edu",
    passportId: "SSP-DEMO-0005",
    rollNumber: "CSE22031",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "2nd Year",
    graduationYear: 2028,
    cgpa: 8.9,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "applied",
    profileCompletion: 81,
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
    technologyCategories: ["Programming Languages", "Data Science", "Databases"],
    certificateStats: {
      total: 2,
      pending: 0,
      institutionReviewed: 1,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 85,
    assessmentAverage: 88,
    lastActivityAt: "2026-03-20T08:10:00.000Z",
  },
  {
    id: "s6",
    name: "Arjun Nair",
    email: "arjun.nair@demo.edu",
    passportId: "SSP-DEMO-0006",
    rollNumber: "IT22005",
    degree: "B.Tech",
    branch: "Information Technology",
    academicYear: "1st Year",
    graduationYear: 2029,
    cgpa: 7.8,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "eligible",
    profileCompletion: 70,
    skills: ["JavaScript", "Node.js", "MongoDB", "React"],
    technologyCategories: ["Web Development", "Backend", "Databases"],
    certificateStats: {
      total: 1,
      pending: 0,
      institutionReviewed: 1,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 55,
    assessmentAverage: 74,
    lastActivityAt: "2026-03-17T12:00:00.000Z",
  },
  {
    id: "s7",
    name: "Fatima Khan",
    email: "fatima.khan@demo.edu",
    passportId: "SSP-DEMO-0007",
    rollNumber: "CSE21045",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 9.3,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "placed",
    profileCompletion: 95,
    skills: ["Java", "System Design", "SQL", "AWS Services"],
    technologyCategories: ["Programming Languages", "Backend", "Cloud Technologies", "Databases"],
    certificateStats: {
      total: 5,
      pending: 0,
      institutionReviewed: 3,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 100,
    assessmentAverage: 94,
    lastActivityAt: "2026-03-12T10:00:00.000Z",
  },
  {
    id: "s8",
    name: "Daniel Joseph",
    email: "daniel.joseph@demo.edu",
    passportId: "SSP-DEMO-0008",
    rollNumber: "MECH21012",
    degree: "B.Tech",
    branch: "Mechanical",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 7.5,
    academicEligible: true,
    needsSupport: true,
    supportReason: "Limited technical skill evidence for software roles of interest",
    activeLearner: false,
    placementStatus: "opted_out",
    profileCompletion: 48,
    skills: ["CAD", "MATLAB"],
    technologyCategories: ["Engineering Tools"],
    certificateStats: {
      total: 0,
      pending: 0,
      institutionReviewed: 0,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 0,
    assessmentAverage: null,
    lastActivityAt: "2026-01-20T09:00:00.000Z",
  },
  {
    id: "s9",
    name: "Priya Iyer",
    email: "priya.iyer@demo.edu",
    passportId: "SSP-DEMO-0009",
    rollNumber: "CSE22018",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "1st Year",
    graduationYear: 2029,
    cgpa: 8.1,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "eligible",
    profileCompletion: 76,
    skills: ["TypeScript", "React", "Next.js", "PostgreSQL"],
    technologyCategories: ["Web Development", "Programming Languages", "Databases"],
    certificateStats: {
      total: 2,
      pending: 1,
      institutionReviewed: 1,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 70,
    assessmentAverage: 81,
    lastActivityAt: "2026-03-19T18:00:00.000Z",
  },
  {
    id: "s10",
    name: "Mohammed Faris",
    email: "mohammed.faris@demo.edu",
    passportId: "SSP-DEMO-0010",
    rollNumber: "IT21033",
    degree: "B.Tech",
    branch: "Information Technology",
    academicYear: "2nd Year",
    graduationYear: 2028,
    cgpa: 7.0,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: false,
    placementStatus: "applied",
    profileCompletion: 60,
    skills: ["Python", "Django", "SQL"],
    technologyCategories: ["Programming Languages", "Backend", "Databases"],
    certificateStats: {
      total: 2,
      pending: 2,
      institutionReviewed: 0,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 35,
    assessmentAverage: 68,
    lastActivityAt: "2026-03-01T10:30:00.000Z",
  },
  {
    id: "s11",
    name: "Ananya Gupta",
    email: "ananya.gupta@demo.edu",
    passportId: "SSP-DEMO-0011",
    rollNumber: "ECE21007",
    degree: "B.Tech",
    branch: "Electronics",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 8.6,
    academicEligible: true,
    needsSupport: false,
    supportReason: null,
    activeLearner: true,
    placementStatus: "interviewing",
    profileCompletion: 84,
    skills: ["Python", "IoT", "Embedded C", "SQL"],
    technologyCategories: ["Programming Languages", "Embedded Systems", "Databases"],
    certificateStats: {
      total: 3,
      pending: 0,
      institutionReviewed: 2,
      issuerVerified: 0,
      rejected: 0,
    },
    trainingCompletionPercent: 90,
    assessmentAverage: 86,
    lastActivityAt: "2026-03-18T20:00:00.000Z",
  },
  {
    id: "s12",
    name: "Kabir Singh",
    email: "kabir.singh@demo.edu",
    passportId: "SSP-DEMO-0012",
    rollNumber: "CSE21050",
    degree: "B.Tech",
    branch: "Computer Science",
    academicYear: "4th Year",
    graduationYear: 2026,
    cgpa: 5.9,
    academicEligible: false,
    needsSupport: true,
    supportReason: "Academic eligibility and incomplete assessments",
    activeLearner: false,
    placementStatus: "not_started",
    profileCompletion: 32,
    skills: ["C++"],
    technologyCategories: ["Programming Languages"],
    certificateStats: {
      total: 1,
      pending: 0,
      institutionReviewed: 0,
      issuerVerified: 0,
      rejected: 1,
    },
    trainingCompletionPercent: 10,
    assessmentAverage: 41,
    lastActivityAt: "2026-02-10T08:00:00.000Z",
  },
];

const student360Extras: Record<string, Omit<Student360, "profile">> = {
  "demo-student-profile": {
    overview: {
      summary:
        "Active learner targeting software roles. Credential evidence is institution-reviewed or pending — none are issuer-verified.",
      evidenceHighlights: [
        "Institution-reviewed: Python Programming",
        "Assessment evidence: SQL (78%)",
        "Self-declared + project: React",
      ],
    },
    academics: {
      degree: "B.Tech",
      branch: "Computer Science",
      academicYear: "4th Year",
      graduationYear: 2026,
      cgpa: 8.4,
      academicEligible: true,
      eligibilityNote: "Meets college CGPA cutoff of 7.0 for placement drives.",
    },
    skills: [
      { name: "Python", category: "Programming Languages", strongestEvidence: "credential", evidenceCount: 1 },
      { name: "AWS Services", category: "Cloud Technologies", strongestEvidence: "credential", evidenceCount: 1 },
      { name: "React", category: "Web Development", strongestEvidence: "self_declared", evidenceCount: 1 },
      { name: "SQL", category: "Databases", strongestEvidence: "assessment", evidenceCount: 1 },
    ],
    certificates: [
      {
        id: "demo-cert-1",
        title: "AWS Cloud Practitioner",
        issuer: "Amazon Web Services",
        status: "unavailable",
        pipelineStatus: "complete",
        issuedOn: "2025-11-02",
        expiresOn: null,
        credentialNumber: "AWS-CP-88421",
        evidenceNote: "Issuer adapter unavailable — not issuer-verified.",
      },
      {
        id: "demo-cert-2",
        title: "Python Programming",
        issuer: "Demo Institute of Technology",
        status: "institution_reviewed",
        pipelineStatus: "complete",
        issuedOn: "2025-09-18",
        expiresOn: null,
        credentialNumber: "DIT-PY-102",
        evidenceNote: "Institutionally reviewed by college admin.",
      },
      {
        id: "demo-cert-3",
        title: "React Fundamentals",
        issuer: "Meta Open Learning",
        status: "pending",
        pipelineStatus: "needs_review",
        issuedOn: null,
        expiresOn: null,
        credentialNumber: null,
        evidenceNote: "Awaiting extraction confirmation / institutional review.",
      },
    ],
    training: [
      {
        id: "tr1",
        programTitle: "Full-Stack Foundations",
        status: "in_progress",
        progressPercent: 65,
        skillsGained: ["JavaScript", "React"],
        assignedAt: "2026-01-10T00:00:00.000Z",
        completedAt: null,
      },
      {
        id: "tr2",
        programTitle: "SQL for Campus Drives",
        status: "completed",
        progressPercent: 100,
        skillsGained: ["SQL"],
        assignedAt: "2025-11-01T00:00:00.000Z",
        completedAt: "2026-01-20T00:00:00.000Z",
      },
    ],
    assessments: [
      {
        id: "as1",
        title: "SQL Fundamentals Quiz",
        score: 78,
        maxScore: 100,
        completedAt: "2026-02-01T00:00:00.000Z",
        skill: "SQL",
      },
      {
        id: "as2",
        title: "Python Coding Challenge",
        score: 82,
        maxScore: 100,
        completedAt: "2026-02-15T00:00:00.000Z",
        skill: "Python",
      },
    ],
    projects: [
      {
        id: "p1",
        title: "Campus Placement Portal",
        description: "Next.js app for internship listings with role-based dashboards.",
        url: "https://example.com/placement",
        reviewStatus: "self_submitted",
        skills: ["React", "SQL"],
      },
      {
        id: "p2",
        title: "Skill Graph Explorer",
        description: "Visualization of credential-backed skills by technology domain.",
        url: null,
        reviewStatus: "reviewed",
        skills: ["Python", "SQL"],
      },
    ],
    placement: {
      status: "eligible",
      applications: [],
      note: "Eligible for drives based on CGPA and academic flag. No fabricated readiness score.",
    },
    activity: [
      {
        id: "act1",
        title: "Certificate uploaded",
        detail: "React Fundamentals submitted for review",
        createdAt: "2026-03-10T10:00:00.000Z",
        eventType: "certificate_uploaded",
      },
      {
        id: "act2",
        title: "Training progress",
        detail: "Full-Stack Foundations reached 65%",
        createdAt: "2026-03-18T09:00:00.000Z",
        eventType: "training_progress",
      },
    ],
  },
};

function default360(profile: AdminStudentRow): Omit<Student360, "profile"> {
  return {
    overview: {
      summary: `${profile.name} · ${profile.branch} · batch ${profile.graduationYear}. Placement status: ${profile.placementStatus.replaceAll("_", " ")}.`,
      evidenceHighlights: profile.skills.slice(0, 3).map((s) => `Skill on record: ${s}`),
    },
    academics: {
      degree: profile.degree,
      branch: profile.branch,
      academicYear: profile.academicYear,
      graduationYear: profile.graduationYear,
      cgpa: profile.cgpa,
      academicEligible: profile.academicEligible,
      eligibilityNote: profile.academicEligible
        ? "Meets stated academic eligibility criteria for participation."
        : profile.supportReason ?? "Does not meet academic eligibility criteria.",
    },
    skills: profile.skills.map((name, i) => ({
      name,
      category: profile.technologyCategories[i] ?? "General",
      strongestEvidence: "self_declared",
      evidenceCount: 1,
    })),
    certificates: [],
    training:
      profile.trainingCompletionPercent > 0
        ? [
            {
              id: `tr-${profile.id}`,
              programTitle: "Campus skill readiness track",
              status: profile.trainingCompletionPercent >= 100 ? "completed" : "in_progress",
              progressPercent: profile.trainingCompletionPercent,
              skillsGained: profile.skills.slice(0, 2),
              assignedAt: "2026-01-01T00:00:00.000Z",
              completedAt: profile.trainingCompletionPercent >= 100 ? "2026-03-01T00:00:00.000Z" : null,
            },
          ]
        : [],
    assessments:
      profile.assessmentAverage != null
        ? [
            {
              id: `as-${profile.id}`,
              title: "Department skill check",
              score: profile.assessmentAverage,
              maxScore: 100,
              completedAt: "2026-02-01T00:00:00.000Z",
              skill: profile.skills[0] ?? null,
            },
          ]
        : [],
    projects: [],
    placement: {
      status: profile.placementStatus,
      applications:
        profile.placementStatus === "applied" ||
        profile.placementStatus === "interviewing" ||
        profile.placementStatus === "placed"
          ? [
              {
                id: `pl-${profile.id}`,
                companyName: profile.placementStatus === "placed" ? "Northwind Systems" : "Acme Analytics",
                jobRoleTitle: "Software Engineer Intern",
                stage:
                  profile.placementStatus === "placed"
                    ? "offer_accepted"
                    : profile.placementStatus === "interviewing"
                      ? "technical_interview"
                      : "applied",
                status: profile.placementStatus === "placed" ? "closed" : "open",
                missingSkills: [],
                appliedAt: "2026-02-20T00:00:00.000Z",
              },
            ]
          : [],
      note: "Statuses reflect recorded placement workflow events only — not predicted hiring outcomes.",
    },
    activity: profile.lastActivityAt
      ? [
          {
            id: `act-${profile.id}`,
            title: "Last recorded activity",
            detail: profile.activeLearner ? "Learning activity recorded" : "No recent learning activity",
            createdAt: profile.lastActivityAt,
            eventType: "activity",
          },
        ]
      : [],
  };
}

export function getDemoStudent360(id: string): Student360 | null {
  const profile = demoAdminStudents.find((s) => s.id === id);
  if (!profile) return null;
  const extras = student360Extras[id] ?? default360(profile);
  return { profile, ...extras };
}

export function buildDemoAdminOverview(): AdminOverviewMetrics {
  const students = demoAdminStudents;
  const byBranchMap = new Map<string, number>();
  const byBatchMap = new Map<string, number>();
  for (const s of students) {
    byBranchMap.set(s.branch, (byBranchMap.get(s.branch) ?? 0) + 1);
    const batch = String(s.graduationYear);
    byBatchMap.set(batch, (byBatchMap.get(batch) ?? 0) + 1);
  }

  const certificatesPending = students.reduce((n, s) => n + s.certificateStats.pending, 0);
  const certificatesInstitutionReviewed = students.reduce(
    (n, s) => n + s.certificateStats.institutionReviewed,
    0,
  );
  const certificatesIssuerVerified = students.reduce(
    (n, s) => n + s.certificateStats.issuerVerified,
    0,
  );
  const certificatesTotal = students.reduce((n, s) => n + s.certificateStats.total, 0);

  const byYearMap = new Map<string, number>();
  const bySkillMap = new Map<string, number>();
  const byPlacementMap = new Map<string, number>();
  for (const s of students) {
    byYearMap.set(s.academicYear, (byYearMap.get(s.academicYear) ?? 0) + 1);
    byPlacementMap.set(s.placementStatus, (byPlacementMap.get(s.placementStatus) ?? 0) + 1);
    for (const skill of s.skills) {
      bySkillMap.set(skill, (bySkillMap.get(skill) ?? 0) + 1);
    }
  }

  return {
    registeredStudents: students.length,
    byBranch: [...byBranchMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    byBatch: [...byBatchMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    byAcademicYear: fillAcademicYears(byYearMap),
    bySkill: [...bySkillMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
    byPlacement: [...byPlacementMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    activeLearners: students.filter((s) => s.activeLearner).length,
    certificatesTotal,
    certificatesVerified: certificatesInstitutionReviewed + certificatesIssuerVerified,
    certificatesPending,
    certificatesInstitutionReviewed,
    certificatesIssuerVerified,
    trainingCompleting: students.filter((s) => s.trainingCompletionPercent >= 100).length,
    assessmentCompleted: students.filter((s) => s.assessmentAverage != null).length,
    placementEligible: students.filter(
      (s) => s.academicEligible && (s.placementStatus === "eligible" || s.placementStatus === "applied" || s.placementStatus === "interviewing" || s.placementStatus === "placed"),
    ).length,
    needingSupport: students.filter((s) => s.needsSupport).length,
    recentActivity: [
      {
        id: "ra1",
        title: "Certificate pending review",
        detail: "React Fundamentals · Aisha Rahman",
        createdAt: "2026-03-10T10:00:00.000Z",
        studentName: "Aisha Rahman",
      },
      {
        id: "ra2",
        title: "Training completed",
        detail: "Campus skill readiness track · Rohan Mehta",
        createdAt: "2026-03-19T14:20:00.000Z",
        studentName: "Rohan Mehta",
      },
      {
        id: "ra3",
        title: "Placement stage updated",
        detail: "Technical interview · Ananya Gupta",
        createdAt: "2026-03-18T20:00:00.000Z",
        studentName: "Ananya Gupta",
      },
    ],
  };
}
