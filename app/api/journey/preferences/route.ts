import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { PREFS_COOKIE, normalizePreferencesInput } from "@/lib/journey/preferences";
import { getCareerPath } from "@/lib/journey/catalog";

export async function POST(request: Request) {
  const session = await requireSession(["student"]);
  const body = await request.json();

  const path = getCareerPath(body.careerPathSlug || body.careerPathId || "");
  if (!path) {
    return NextResponse.json({ error: "Select a valid career path" }, { status: 400 });
  }
  if (!body.degree?.trim() || !body.branch?.trim()) {
    return NextResponse.json({ error: "Degree and branch are required" }, { status: 400 });
  }
  if (!body.rollNumber?.trim()) {
    return NextResponse.json({ error: "Roll number is required" }, { status: 400 });
  }
  const rollDigits = String(body.rollNumber).replace(/\D/g, "");
  if (rollDigits.length < 4) {
    return NextResponse.json(
      { error: "Roll number must include at least 4 digits" },
      { status: 400 },
    );
  }

  const prefs = normalizePreferencesInput({
    ...body,
    careerPathId: path.id,
    careerPathSlug: path.slug,
    onboardingCompletedAt: new Date().toISOString(),
  });

  const response = NextResponse.json({ ok: true, prefs });
  response.cookies.set(PREFS_COOKIE, encodeURIComponent(JSON.stringify(prefs)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  // Keep student profile fields aligned when possible (demo session remains cookie-based).
  void session;
  return response;
}

export async function PATCH(request: Request) {
  await requireSession(["student"]);
  const body = await request.json();
  const { getLearningPreferences } = await import("@/lib/journey/preferences");
  const existing = await getLearningPreferences(null);
  if (!existing) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const prefs = normalizePreferencesInput({
    ...existing,
    ...body,
    onboardingCompletedAt: existing.onboardingCompletedAt,
  });

  const response = NextResponse.json({ ok: true, prefs });
  response.cookies.set(PREFS_COOKIE, encodeURIComponent(JSON.stringify(prefs)), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
