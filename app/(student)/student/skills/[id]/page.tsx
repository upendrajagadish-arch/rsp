import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/product/page-header";
import { EmptyState } from "@/components/product/empty-state";
import { VerificationStamp } from "@/components/product/verification-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { VerificationStatus } from "@/types/supabase";

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: skillId } = await params;
  const session = await requireSession(["student"]);
  if (!session.studentProfileId) notFound();

  const supabase = await createClient();

  const { data: skill } = await supabase
    .from("skills")
    .select("id, name, slug, description, technology_categories(name)")
    .eq("id", skillId)
    .maybeSingle();
  if (!skill) notFound();

  const { data: studentSkill } = await supabase
    .from("student_skills")
    .select("id, evidence_count, strongest_evidence, last_evidenced_at")
    .eq("student_profile_id", session.studentProfileId)
    .eq("skill_id", skillId)
    .maybeSingle();

  if (!studentSkill) {
    return (
      <EmptyState
        title="No evidence for this skill"
        description="This skill will appear after a verified credential or project links to it."
        actionLabel="View all skills"
        actionHref="/student/skills"
      />
    );
  }

  const { data: evidence } = await supabase
    .from("skill_evidence")
    .select(
      "id, source_type, status, notes, created_at, certificate_id, project_id, assessment_result_id",
    )
    .eq("student_skill_id", studentSkill.id)
    .order("created_at", { ascending: false });

  const category = skill.technology_categories as unknown as { name: string } | null;

  return (
    <div>
      <PageHeader
        title={skill.name}
        description={skill.description ?? "Skill evidence drawn from your passport data."}
        actions={
          <Button variant="outline" asChild>
            <Link href="/student/skills">All skills</Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="success">{studentSkill.evidence_count} evidence items</Badge>
        <Badge variant="secondary">Strongest: {studentSkill.strongest_evidence}</Badge>
        <Badge variant="outline">{category?.name ?? "Uncategorized"}</Badge>
        <span className="text-sm text-[var(--muted)]">
          Last evidenced {formatDate(studentSkill.last_evidenced_at)}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidence trail</CardTitle>
        </CardHeader>
        <CardContent>
          {!evidence?.length ? (
            <p className="text-sm text-[var(--muted)]">No evidence rows found.</p>
          ) : (
            <ul className="space-y-3">
              {evidence.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium capitalize text-[var(--navy)]">
                      {item.source_type.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{formatDate(item.created_at)}</p>
                    {item.notes ? <p className="mt-1 text-sm text-[var(--muted)]">{item.notes}</p> : null}
                    {item.certificate_id ? (
                      <Link
                        href={`/student/certificates/${item.certificate_id}`}
                        className="mt-1 inline-block text-sm text-[var(--emerald)] hover:underline"
                      >
                        View certificate
                      </Link>
                    ) : null}
                  </div>
                  {item.status ? (
                    <VerificationStamp status={item.status as VerificationStatus} />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}