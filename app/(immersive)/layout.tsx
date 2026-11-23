import { requireSession } from "@/lib/auth/session";

export default async function ImmersiveStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession(["student"]);
  return <>{children}</>;
}
