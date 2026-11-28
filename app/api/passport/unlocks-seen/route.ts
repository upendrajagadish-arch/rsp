import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { markUnlocksSeen } from "@/services/skill-passport";

export async function POST(request: Request) {
  const session = await requireSession(["student", "college_admin"]);
  const body = (await request.json()) as {
    studentProfileId?: string;
    achievementIds?: string[];
  };
  const studentProfileId =
    session.role === "student"
      ? session.studentProfileId ?? body.studentProfileId
      : body.studentProfileId;
  if (!studentProfileId || !Array.isArray(body.achievementIds)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await markUnlocksSeen(studentProfileId, body.achievementIds);
  return NextResponse.json({ ok: true });
}
