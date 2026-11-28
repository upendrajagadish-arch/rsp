import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getSkillPassport } from "@/services/skill-passport";

export async function GET(request: Request) {
  await requireSession(["college_admin", "student"]);
  const { searchParams } = new URL(request.url);
  const studentProfileId = searchParams.get("studentProfileId");
  if (!studentProfileId) {
    return NextResponse.json({ error: "studentProfileId required" }, { status: 400 });
  }
  const bundle = await getSkillPassport(studentProfileId, "administrator");
  if (!bundle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ bundle });
}
