import { NextResponse } from "next/server";
import { DEMO_COOKIE, isDemoMode } from "@/lib/demo/mode";
import { defaultPathForRole, findDemoAccount } from "@/lib/demo/users";

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo mode is disabled" }, { status: 400 });
  }

  const body = (await request.json()) as { email?: string; password?: string; next?: string };
  const account = findDemoAccount(body.email ?? "", body.password ?? "");
  if (!account) {
    return NextResponse.json({ error: "Invalid demo email or password" }, { status: 401 });
  }

  if (account.session.role === "recruiter") {
    return NextResponse.json(
      { error: "Demo login is limited to Student and Admin accounts" },
      { status: 403 },
    );
  }

  const next =
    body.next && body.next.startsWith("/")
      ? body.next
      : defaultPathForRole(account.session.role);

  const response = NextResponse.json({ ok: true, next, role: account.session.role });
  response.cookies.set(DEMO_COOKIE, account.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
