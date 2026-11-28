import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import {
  adminAwardAchievement,
  adminUpdateAchievement,
  getSkillPassport,
} from "@/services/skill-passport";

export async function POST(request: Request) {
  const session = await requireSession(["college_admin"]);
  const body = (await request.json()) as {
    studentProfileId?: string;
    achievementId?: string;
    action?: string;
    reason?: string;
    stampCode?: string;
    title?: string;
  };

  if (!body.studentProfileId || !body.action || !body.reason?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (body.action === "award") {
    if (!body.title?.trim() || !body.stampCode) {
      return NextResponse.json({ error: "Award requires title and stampCode" }, { status: 400 });
    }
    const result = await adminAwardAchievement({
      studentProfileId: body.studentProfileId,
      stampCode: body.stampCode,
      title: body.title,
      reason: body.reason,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const bundle = await getSkillPassport(body.studentProfileId, "administrator");
    return NextResponse.json({ ok: true, bundle });
  }

  if (!body.achievementId) {
    return NextResponse.json({ error: "achievementId required" }, { status: 400 });
  }

  if (
    body.action !== "approve" &&
    body.action !== "reject" &&
    body.action !== "revoke" &&
    body.action !== "request_correction"
  ) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const result = await adminUpdateAchievement({
    studentProfileId: body.studentProfileId,
    achievementId: body.achievementId,
    action: body.action,
    reason: body.reason,
    actorId: session.userId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const bundle = await getSkillPassport(body.studentProfileId, "administrator");
  return NextResponse.json({ ok: true, bundle });
}
