import { redirect } from "next/navigation";

/** Map legacy student routes into profile popups. */
export function redirectToStudentPanel(panel: string): never {
  redirect(`/student/profile?panel=${encodeURIComponent(panel)}`);
}
