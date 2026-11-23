import { NextResponse } from "next/server";
import { DEMO_COOKIE, isDemoMode } from "@/lib/demo/mode";
import { defaultPathForRole, findDemoAccount } from "@/lib/demo/users";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string; next?: string };
  const account = findDemoAccount(body.email ?? "", body.password ?? "");

  if (!account) {
    if (!isDemoMode()) {
      return NextResponse.json({ error: "Demo mode is disabled" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid demo email or password" }, { status: 401 });
  }

  // Built-in Student + Admin demo accounts always work for product demos.
  // Recruiter stays blocked on this login surface.
  if (account.session.role === "recruiter") {
    return NextResponse.json(
      { error: "Demo login is limited to Student and Admin accounts" },
      { status: 403 },
    );
  }

  if (
    account.session.role !== "student" &&
    account.session.role !== "college_admin" &&
    !isDemoMode()
  ) {
    return NextResponse.json({ error: "Demo mode is disabled" }, { status: 400 });
  }

  const next =
    body.next && body.next.startsWith("/")
      ? body.next
      : defaultPathForRole(account.session.role);

  const response = NextResponse.json({
    ok: true,
    next,
    role: account.session.role,
  });
  response.cookies.set(DEMO_COOKIE, account.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
