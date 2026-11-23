"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

export async function updateProfileAndPrivacy(formData: FormData) {
  const session = await requireSession(["student"]);
  if (!session.studentProfileId) {
    throw new Error("Student profile required");
  }

  const supabase = await createClient();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const degree = String(formData.get("degree") ?? "").trim() || null;
  const branch = String(formData.get("branch") ?? "").trim() || null;
  const graduationYear = formData.get("graduation_year")
    ? Number(formData.get("graduation_year"))
    : null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const sharingEnabled = formData.get("sharing_enabled") === "on";

  if (fullName) {
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", session.userId);
  }

  const publicSections = {
    credentials: formData.get("section_credentials") === "on",
    skills: formData.get("section_skills") === "on",
    projects: formData.get("section_projects") === "on",
    assessments: formData.get("section_assessments") === "on",
  };

  let completion = 40;
  if (degree) completion += 15;
  if (branch) completion += 15;
  if (graduationYear) completion += 10;
  if (bio) completion += 10;
  if (fullName) completion += 10;
  completion = Math.min(100, completion);

  await supabase
    .from("student_profiles")
    .update({
      degree,
      branch,
      graduation_year: graduationYear,
      bio,
      sharing_enabled: sharingEnabled,
      public_sections: publicSections,
      profile_completion: completion,
    })
    .eq("id", session.studentProfileId);

  revalidatePath("/student");
  revalidatePath("/student/settings");
}