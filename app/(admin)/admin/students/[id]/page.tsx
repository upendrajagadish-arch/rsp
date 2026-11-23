import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Student360View } from "@/components/admin/student-360";
import { requireSession } from "@/lib/auth/session";
import { getAdminStudent360 } from "@/services/admin-intelligence";

export default async function AdminStudent360Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(["college_admin"]);
  const { id } = await params;
  const data = await getAdminStudent360(session.organizationId, id);
  if (!data) notFound();

  return (
    <Suspense
      fallback={
        <div className="rounded-[32px] border border-[#898989]/20 bg-white/60 px-4 py-10 text-center text-sm text-[#898989] backdrop-blur-xl">
          Loading student record…
        </div>
      }
    >
      <Student360View data={data} />
    </Suspense>
  );
}
