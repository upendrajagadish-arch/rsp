import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MyPassportShell } from "@/components/passport/my-passport-shell";
import { requireSession } from "@/lib/auth/session";
import { getSkillPassport } from "@/services/skill-passport";

export default async function MyPassportPage() {
  const session = await requireSession(["student"]);
  const studentId = session.studentProfileId ?? "demo-student-profile";
  const bundle = await getSkillPassport(studentId, "student");
  if (!bundle) redirect("/student/profile");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF7EF] text-sm text-[#78828E]">
          Loading passport…
        </div>
      }
    >
      <MyPassportShell bundle={bundle} />
    </Suspense>
  );
}
