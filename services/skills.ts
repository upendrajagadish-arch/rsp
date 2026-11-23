import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { EvidenceSource, VerificationStatus } from "@/types/supabase";

export type SkillsDashboardGroup = {
  categoryId: string | null;
  categoryName: string;
  skills: Array<{
    skillId: string;
    name: string;
    slug: string;
    evidenceCount: number;
    strongestEvidence: EvidenceSource;
    lastEvidencedAt: string | null;
    verifiedCredentialBacked: boolean;
  }>;
};

const TITLE_SKILL_MAP: Record<string, string[]> = {
  python: ["python", "programming-fundamentals"],
  aws: ["aws-services", "cloud-fundamentals"],
  "cloud practitioner": ["aws-services", "cloud-fundamentals", "cloud-security-fundamentals"],
  react: ["react", "javascript"],
  javascript: ["javascript"],
  sql: ["sql"],
  "machine learning": ["machine-learning", "python"],
  cybersecurity: ["network-security"],
};

export async function mapSkillsFromCredential(title: string | null, issuer: string | null) {
  const haystack = `${title ?? ""} ${issuer ?? ""}`.toLowerCase();
  const slugs = new Set<string>();
  for (const [needle, mapped] of Object.entries(TITLE_SKILL_MAP)) {
    if (haystack.includes(needle)) mapped.forEach((s) => slugs.add(s));
  }
  return [...slugs];
}

export async function recalculateStudentSkills(studentProfileId: string) {
  const supabase = createServiceClient();
  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, title, issuing_organization, verification_status")
    .eq("student_profile_id", studentProfileId)
    .in("verification_status", ["issuer_verified", "institution_reviewed"]);

  const { data: allSkills } = await supabase.from("skills").select("id, slug");
  const bySlug = new Map((allSkills ?? []).map((s) => [s.slug, s.id]));

  // Remove credential evidence and rebuild from current verified certs
  const { data: existing } = await supabase
    .from("student_skills")
    .select("id")
    .eq("student_profile_id", studentProfileId);
  const skillIds = (existing ?? []).map((s) => s.id);
  if (skillIds.length) {
    await supabase
      .from("skill_evidence")
      .delete()
      .in("student_skill_id", skillIds)
      .eq("source_type", "credential");
  }

  for (const cert of certificates ?? []) {
    const slugs = await mapSkillsFromCredential(cert.title, cert.issuing_organization);
    for (const slug of slugs) {
      const skillId = bySlug.get(slug);
      if (!skillId) continue;
      const { data: studentSkill } = await supabase
        .from("student_skills")
        .upsert(
          {
            student_profile_id: studentProfileId,
            skill_id: skillId,
            strongest_evidence: "credential" as EvidenceSource,
            last_evidenced_at: new Date().toISOString(),
          },
          { onConflict: "student_profile_id,skill_id" },
        )
        .select("id")
        .single();
      if (!studentSkill) continue;
      await supabase.from("skill_evidence").insert({
        student_skill_id: studentSkill.id,
        source_type: "credential",
        certificate_id: cert.id,
        status: cert.verification_status as VerificationStatus,
      });
    }
  }

  const { data: refreshed } = await supabase
    .from("student_skills")
    .select("id")
    .eq("student_profile_id", studentProfileId);
  for (const row of refreshed ?? []) {
    const { count } = await supabase
      .from("skill_evidence")
      .select("*", { count: "exact", head: true })
      .eq("student_skill_id", row.id);
    await supabase
      .from("student_skills")
      .update({ evidence_count: count ?? 0 })
      .eq("id", row.id);
  }
}

const VERIFIED_STATUSES: VerificationStatus[] = ["issuer_verified", "institution_reviewed"];

export async function getSkillsDashboard(studentProfileId: string): Promise<SkillsDashboardGroup[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("student_skills")
    .select(
      "id, evidence_count, strongest_evidence, last_evidenced_at, skills(id, slug, name, category_id, technology_categories(id, name))",
    )
    .eq("student_profile_id", studentProfileId)
    .order("evidence_count", { ascending: false });

  if (error) throw new Error(error.message);

  const groups = new Map<string, SkillsDashboardGroup>();

  for (const row of rows ?? []) {
    const skill = row.skills as unknown as {
      id: string;
      slug: string;
      name: string;
      category_id: string | null;
      technology_categories: { id: string; name: string } | null;
    };

    const categoryKey = skill.technology_categories?.id ?? "uncategorized";
    const group =
      groups.get(categoryKey) ??
      ({
        categoryId: skill.technology_categories?.id ?? null,
        categoryName: skill.technology_categories?.name ?? "Other skills",
        skills: [],
      } satisfies SkillsDashboardGroup);

    const { data: evidence } = await supabase
      .from("skill_evidence")
      .select("status, source_type")
      .eq("student_skill_id", row.id);

    const verifiedCredentialBacked = (evidence ?? []).some(
      (e) =>
        e.source_type === "credential" &&
        e.status &&
        VERIFIED_STATUSES.includes(e.status as VerificationStatus),
    );

    group.skills.push({
      skillId: skill.id,
      name: skill.name,
      slug: skill.slug,
      evidenceCount: row.evidence_count,
      strongestEvidence: row.strongest_evidence,
      lastEvidencedAt: row.last_evidenced_at,
      verifiedCredentialBacked,
    });

    groups.set(categoryKey, group);
  }

  return [...groups.values()];
}
