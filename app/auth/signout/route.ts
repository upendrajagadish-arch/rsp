import { NextResponse } from "next/server";
import { DEMO_COOKIE, isDemoMode } from "@/lib/demo/mode";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  if (isDemoMode()) {
    response.cookies.set(DEMO_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  return response;
}
