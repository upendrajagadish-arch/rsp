import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { saveLastPage } from "@/services/skill-passport";

export async function POST(request: Request) {
  const session = await requireSession(["student", "college_admin"]);
  const body = (await request.json()) as {
    studentProfileId?: string;
    lastPage?: number;
  };
  const studentProfileId =
    session.role === "student"
      ? session.studentProfileId ?? body.studentProfileId
      : body.studentProfileId;
  if (!studentProfileId || typeof body.lastPage !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await saveLastPage(studentProfileId, body.lastPage);
  return NextResponse.json({ ok: true });
}
