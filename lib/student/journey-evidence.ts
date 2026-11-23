import type { CircuitCheckpoint, CircuitEvidence } from "@/components/student/journey-circuit";
import type { MilestoneProgress } from "@/lib/journey/types";
import type { VerificationStatus } from "@/types/supabase";

type Cert = {
  id: string;
  title: string;
  issuing_organization: string;
  verification_status: VerificationStatus;
  created_at?: string;
};

type Skill = {
  id: string;
  name: string;
  category: string;
  strongest_evidence: string;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
};

function skillMatches(milestoneSkills: string[], skillName: string) {
  const n = skillName.toLowerCase();
  return milestoneSkills.some(
    (s) => n.includes(s.toLowerCase()) || s.toLowerCase().includes(n) || n === "javascript" && s.toLowerCase().includes("programming"),
  );
}

function certMatches(milestone: MilestoneProgress, title: string, org: string) {
  const hay = `${title} ${org}`.toLowerCase();
  if (milestone.optionalCertifications.some((c) => hay.includes(c.toLowerCase().slice(0, 12)))) {
    return true;
  }
  return milestone.requiredSkills.some((s) => hay.includes(s.toLowerCase()));
}

/** Attach certificate / skill / project submissions onto roadmap sectors for hover tooltips. */
export function buildCircuitCheckpoints(options: {
  milestones: MilestoneProgress[];
  certificates: Cert[];
  skills: Skill[];
  projects: Project[];
}): CircuitCheckpoint[] {
  const { milestones, certificates, skills, projects } = options;

  return milestones.map((m, index) => {
    const evidence: CircuitEvidence[] = [];

    for (const c of certificates) {
      if (certMatches(m, c.title, c.issuing_organization) || (index === 0 && c.title.toLowerCase().includes("python"))) {
        evidence.push({
          kind: "certificate",
          title: c.title,
          detail: c.issuing_organization,
          submittedAt: c.created_at ?? null,
          status: c.verification_status,
        });
      }
    }

    for (const s of skills) {
      if (skillMatches(m.requiredSkills, s.name) || skillMatches(m.supportedSkills, s.name)) {
        evidence.push({
          kind: "skill",
          title: s.name,
          detail: `${s.category} · ${s.strongest_evidence.replaceAll("_", " ")}`,
          submittedAt: null,
          status: s.strongest_evidence,
        });
      }
    }

    // Spread demo projects across later sectors when skill-linked text matches.
    for (const p of projects) {
      const blob = `${p.title} ${p.description ?? ""}`.toLowerCase();
      if (
        m.requiredSkills.some((s) => blob.includes(s.toLowerCase())) ||
        (index >= milestones.length - 2 && projects.indexOf(p) === index % projects.length)
      ) {
        evidence.push({
          kind: "project",
          title: p.title,
          detail: p.description ?? undefined,
          submittedAt: null,
        });
      }
    }

    // De-dupe by kind+title
    const seen = new Set<string>();
    const unique = evidence.filter((e) => {
      const key = `${e.kind}:${e.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      id: m.milestoneId || m.slug,
      title: m.title,
      summary: m.summary,
      status: m.status,
      progressPercent: m.progressPercent,
      evidence: unique,
    };
  });
}
