import { requireSession } from "@/lib/auth/session";

/** Student area without the old left drawer — home is the profile stage with popups. */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireSession(["student"]);
  return <>{children}</>;
}
