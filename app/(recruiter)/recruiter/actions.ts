"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function addToShortlist(formData: FormData) {
  const session = await requireSession(["recruiter"]);
  const studentProfileId = String(formData.get("student_profile_id") ?? "");
  if (!studentProfileId) throw new Error("Missing student");

  const supabase = await createClient();
  await supabase.from("recruiter_shortlists").upsert(
    {
      recruiter_user_id: session.userId,
      organization_id: session.organizationId,
      student_profile_id: studentProfileId,
    },
    { onConflict: "recruiter_user_id,student_profile_id" },
  );

  revalidatePath("/recruiter/shortlist");
}