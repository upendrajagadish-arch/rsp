"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createShareLink, revokeShare } from "@/services/passport";

export async function setSharingEnabled(enabled: boolean) {
  const session = await requireSession(["student"]);
  if (!session.studentProfileId) {
    throw new Error("Student profile required");
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_profiles")
    .update({ sharing_enabled: enabled })
    .eq("id", session.studentProfileId);
  if (error) throw new Error(error.message);
  revalidatePath("/student/passport");
  return { ok: true as const };
}

export async function createShareLinkAction(studentProfileId: string, label: string) {
  const session = await requireSession(["student"]);
  if (session.studentProfileId !== studentProfileId) {
    throw new Error("Forbidden");
  }
  const result = await createShareLink(studentProfileId, label || null);
  revalidatePath("/student/passport");
  return result;
}

export async function revokeShareAction(shareId: string) {
  await requireSession(["student"]);
  await revokeShare(shareId);
  revalidatePath("/student/passport");
  return { ok: true as const };
}