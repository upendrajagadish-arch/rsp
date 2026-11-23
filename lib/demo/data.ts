import type { VerificationStatus } from "@/types/supabase";

export const demoCertificates = [
  {
    id: "demo-cert-1",
    title: "AWS Cloud Practitioner",
    issuing_organization: "Amazon Web Services",
    verification_status: "unavailable" as VerificationStatus,
    pipeline_status: "complete",
    created_at: "2026-03-01T10:00:00.000Z",
    credential_number: "AWS-CP-88421",
  },
  {
    id: "demo-cert-2",
    title: "Python Programming",
    issuing_organization: "Demo Institute of Technology",
    verification_status: "institution_reviewed" as VerificationStatus,
    pipeline_status: "complete",
    created_at: "2026-02-12T10:00:00.000Z",
    credential_number: "DIT-PY-102",
  },
  {
    id: "demo-cert-3",
    title: "React Fundamentals",
    issuing_organization: "Meta Open Learning",
    verification_status: "pending" as VerificationStatus,
    pipeline_status: "needs_review",
    created_at: "2026-03-10T10:00:00.000Z",
    credential_number: null,
  },
];

export const demoSkills = [
  {
    id: "ds1",
    name: "Python",
    category: "Programming Languages",
    strongest_evidence: "credential",
    evidence_count: 1,
  },
  {
    id: "ds2",
    name: "AWS Services",
    category: "Cloud Technologies",
    strongest_evidence: "credential",
    evidence_count: 1,
  },
  {
    id: "ds3",
    name: "React",
    category: "Web Development",
    strongest_evidence: "self_declared",
    evidence_count: 1,
  },
  {
    id: "ds4",
    name: "SQL",
    category: "Databases",
    strongest_evidence: "assessment",
    evidence_count: 1,
  },
];

export const demoNotifications = [
  {
    id: "n1",
    title: "Certificate ready for review",
    body: "React Fundamentals extraction is ready. Confirm fields before verification.",
    created_at: "2026-03-10T11:00:00.000Z",
  },
  {
    id: "n2",
    title: "Institution review complete",
    body: "Python Programming is now Institution Reviewed — not issuer verified.",
    created_at: "2026-02-12T16:00:00.000Z",
  },
];

export const demoProjects = [
  {
    id: "p1",
    title: "Campus Placement Portal",
    description: "Next.js app for internship listings with role-based dashboards.",
    url: "https://example.com/placement",
  },
  {
    id: "p2",
    title: "Skill Graph Explorer",
    description: "Visualization of credential-backed skills by technology domain.",
    url: null,
  },
];

export const demoAdminStats = {
  students: 128,
  certificates: 312,
  pendingQueue: 14,
  issuerVerified: 0,
  institutionReviewed: 86,
  unavailable: 41,
};

export const demoStudents = [
  {
    id: "demo-student-profile",
    name: "Aisha Rahman",
    passport_id: "SSP-DEMO-0001",
    branch: "Computer Science",
    graduation_year: 2026,
    sharing_enabled: false,
    profile_completion: 72,
  },
  {
    id: "s2",
    name: "Rohan Mehta",
    passport_id: "SSP-DEMO-0002",
    branch: "Information Technology",
    graduation_year: 2025,
    sharing_enabled: true,
    profile_completion: 88,
  },
  {
    id: "s3",
    name: "Sara Ali",
    passport_id: "SSP-DEMO-0003",
    branch: "Electronics",
    graduation_year: 2026,
    sharing_enabled: true,
    profile_completion: 64,
  },
];
