import { createClient } from "@/lib/supabase/server";

export function computeCareerMatchScore(
  requirements: Array<{ weight: number; hasEvidence: boolean }>,
): number {
  let earned = 0;
  let total = 0;
  for (const req of requirements) {
    total += req.weight;
    if (req.hasEvidence) earned += req.weight;
  }
  if (total === 0) return 0;
  return Math.round((earned / total) * 1000) / 10;
}

export type MatchResult = {
  roleTitle: string;
  matched: { skillId: string; skillName: string; weight: number }[];
  missing: { skillId: string; skillName: string; weight: number; required: boolean }[];
  scorePercent: number;
  formula: string;
  disclaimer: string;
};

export async function matchStudentToRole(
  studentProfileId: string,
  jobRoleId: string,
): Promise<MatchResult> {
  const supabase = await createClient();
  const { data: role } = await supabase
    .from("job_roles")
    .select("title, job_role_requirements(skill_id, weight, is_required, skills(name))")
    .eq("id", jobRoleId)
    .single();
  if (!role) throw new Error("Job role not found");

  const { data: studentSkills } = await supabase
    .from("student_skills")
    .select("skill_id, evidence_count")
    .eq("student_profile_id", studentProfileId)
    .gt("evidence_count", 0);

  const owned = new Set((studentSkills ?? []).map((s) => s.skill_id));
  const requirements = (role.job_role_requirements ?? []) as unknown as {
    skill_id: string;
    weight: number;
    is_required: boolean;
    skills: { name: string } | null;
  }[];

  const matched = [];
  const missing = [];

  for (const req of requirements) {
    const item = {
      skillId: req.skill_id,
      skillName: req.skills?.name ?? "Skill",
      weight: Number(req.weight),
      required: req.is_required,
    };
    if (owned.has(req.skill_id)) {
      matched.push(item);
    } else {
      missing.push(item);
    }
  }

  const scorePercent = computeCareerMatchScore(
    requirements.map((req) => ({
      weight: Number(req.weight),
      hasEvidence: owned.has(req.skill_id),
    })),
  );

  return {
    roleTitle: role.title,
    matched,
    missing,
    scorePercent,
    formula:
      "score = 100 × (sum of weights for evidenced skills) ÷ (sum of all role skill weights). Evidence means credential/assessment/project links with evidence_count > 0. This is not a placement prediction.",
    disclaimer:
      "This match percentage explains coverage of configured role requirements only. It does not predict recruitment success or guarantee placement.",
  };
}
