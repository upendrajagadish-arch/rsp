import type { AppRole } from "@/types/supabase";
import type { SessionContext } from "@/lib/auth/session";

export type DemoAccount = {
  email: string;
  password: string;
  session: SessionContext;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "student@demo.edu",
    password: "DemoStudent123!",
    session: {
      userId: "demo-student-user",
      email: "student@demo.edu",
      fullName: "Aisha Rahman",
      role: "student",
      organizationId: "11111111-1111-1111-1111-111111111111",
      organizationName: "Demo Institute of Technology",
      studentProfileId: "demo-student-profile",
      passportId: "SSP-DEMO-0001",
      degree: "B.Tech",
      branch: "Computer Science",
      graduationYear: 2026,
      profileCompletion: 72,
      sharingEnabled: false,
      // Demo: treated as LinkedIn-synced profile photo
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=640&h=640&q=80",
      linkedinUrl: "https://www.linkedin.com/in/aisha-rahman-demo",
    },
  },
  {
    email: "admin@demo.edu",
    password: "DemoAdmin123!",
    session: {
      userId: "demo-admin-user",
      email: "admin@demo.edu",
      fullName: "Dr. Meera Kapoor",
      role: "college_admin",
      organizationId: "11111111-1111-1111-1111-111111111111",
      organizationName: "Demo Institute of Technology",
      studentProfileId: null,
      passportId: null,
      degree: null,
      branch: null,
      graduationYear: null,
      profileCompletion: 100,
      sharingEnabled: false,
    },
  },
  {
    email: "recruiter@demo.edu",
    password: "DemoRecruiter123!",
    session: {
      userId: "demo-recruiter-user",
      email: "recruiter@demo.edu",
      fullName: "Jordan Ellis",
      role: "recruiter",
      organizationId: "11111111-1111-1111-1111-111111111111",
      organizationName: "Demo Institute of Technology",
      studentProfileId: null,
      passportId: null,
      degree: null,
      branch: null,
      graduationYear: null,
      profileCompletion: 100,
      sharingEnabled: false,
    },
  },
];

export function findDemoAccount(email: string, password: string) {
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
}

export function demoSessionByEmail(email: string) {
  return DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase())?.session ?? null;
}

export function defaultPathForRole(role: AppRole) {
  if (role === "college_admin") return "/admin";
  if (role === "recruiter") return "/recruiter";
  return "/student/profile";
}
