/** True when Supabase is not configured — cookie-based demo auth + mock data. */
export function isDemoMode() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (process.env.DEMO_MODE === "true") return true;
  if (!anon || anon.includes("your-anon-key")) return true;
  if (!url || url.includes("127.0.0.1") || url.includes("localhost")) {
    // Local URL without a real key still counts as demo
    if (!anon || anon.includes("your-anon-key")) return true;
  }
  return false;
}

export const DEMO_COOKIE = "ssp_demo_session";
