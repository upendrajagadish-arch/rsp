"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function updateRecruiterProfile(formData: FormData) {
  const session = await requireSession(["recruiter"]);
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) throw new Error("Name required");

  const supabase = await createClient();
  await supabase.from("profiles").update({ full_name: fullName }).eq("id", session.userId);
  revalidatePath("/recruiter/profile");
}