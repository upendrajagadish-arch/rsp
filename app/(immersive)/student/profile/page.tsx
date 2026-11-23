import { Suspense } from "react";
import { redirect } from "next/navigation";
import { StudentHome } from "@/components/student/student-home";
import { requireSession } from "@/lib/auth/session";
import { demoCertificates, demoProjects, demoSkills } from "@/lib/demo/data";
import { getLearningPreferences } from "@/lib/journey/preferences";
import { buildCircuitCheckpoints } from "@/lib/student/journey-evidence";
import { buildJourneyView, evidencedSkillNames } from "@/services/journey";

export default async function StudentProfilePage() {
  const session = await requireSession(["student"]);
  const prefs = await getLearningPreferences(session.studentProfileId);
  if (!prefs?.onboardingCompletedAt) redirect("/student/onboarding");

  const journey = prefs
    ? buildJourneyView(prefs, evidencedSkillNames({ declaredSkills: prefs.declaredSkills }))
    : null;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0e1c]" />}>
      <StudentHome
        data={{
          fullName: session.fullName,
          passportId: session.passportId ?? "SSP-—",
          organizationName: session.organizationName,
          degree: prefs?.degree || session.degree,
          branch: prefs?.branch || session.branch,
          graduationYear: prefs?.graduationYear ?? session.graduationYear,
          rollNumber: prefs?.rollNumber ?? null,
          email: session.email,
          phone: prefs?.phone || null,
          avatarUrl: session.avatarUrl ?? null,
          linkedinUrl: prefs?.linkedinUrl || session.linkedinUrl || null,
          githubUrl: prefs?.githubUrl || null,
          portfolioUrl: prefs?.portfolioUrl || null,
          leetcodeUrl: prefs?.leetcodeUrl || null,
          headline: prefs?.headline || null,
          bio: prefs?.bio || null,
          location: prefs?.location || null,
          cgpa: prefs?.cgpa || null,
          experienceLevel: prefs?.experienceLevel ?? "beginner",
          lookingFor: prefs?.lookingFor ?? "both",
          preferredRoles: prefs?.preferredRoles || null,
          technologies: prefs?.technologies ?? [],
          skills: demoSkills.map((s) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            strongest_evidence: s.strongest_evidence,
          })),
          certificates: demoCertificates.map((c) => ({
            id: c.id,
            title: c.title ?? "Certificate",
            issuing_organization: c.issuing_organization,
            verification_status: c.verification_status,
          })),
          projects: demoProjects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            url: p.url,
          })),
          journeyTitle: journey?.pathTitle ?? null,
          journeySummary: journey?.pathSummary ?? null,
          coveragePercent: journey?.coveragePercent ?? 0,
          nextActionTitle: journey?.primaryAction.title ?? null,
          nextActionReason: journey?.primaryAction.reason ?? null,
          milestones: journey
            ? buildCircuitCheckpoints({
                milestones: journey.milestones,
                certificates: demoCertificates.map((c) => ({
                  id: c.id,
                  title: c.title ?? "Certificate",
                  issuing_organization: c.issuing_organization,
                  verification_status: c.verification_status,
                  created_at: c.created_at,
                })),
                skills: demoSkills.map((s) => ({
                  id: s.id,
                  name: s.name,
                  category: s.category,
                  strongest_evidence: s.strongest_evidence,
                })),
                projects: demoProjects.map((p) => ({
                  id: p.id,
                  title: p.title,
                  description: p.description,
                })),
              })
            : [],
        }}
      />
    </Suspense>
  );
}
