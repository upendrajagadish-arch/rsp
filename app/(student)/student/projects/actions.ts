"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export async function createProject(formData: FormData) {
  const session = await requireSession(["student"]);
  if (!session.studentProfileId || !session.organizationId) {
    throw new Error("Student profile required");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;

  if (title.length < 2) throw new Error("Title is required");

  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      student_profile_id: session.studentProfileId,
      organization_id: session.organizationId,
      title,
      description,
      url,
    })
    .select("id")
    .single();

  if (error || !project) throw new Error(error?.message ?? "Failed to create project");

  const skillIds = formData.getAll("skill_ids").map(String).filter(Boolean);
  if (skillIds.length) {
    await supabase.from("project_skills").insert(
      skillIds.map((skill_id) => ({ project_id: project.id, skill_id })),
    );
  }

  const service = createServiceClient();
  await service.from("processing_jobs").insert({
    organization_id: session.organizationId,
    job_type: "recalculate_skills",
    idempotency_key: `skills:${session.studentProfileId}:${Date.now()}`,
    payload: { student_profile_id: session.studentProfileId },
  });

  revalidatePath("/student/projects");
}