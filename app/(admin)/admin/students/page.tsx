import { Suspense } from "react";
import { StudentDirectory } from "@/components/admin/student-directory";
import { AdminGlass } from "@/components/admin/admin-theme-shell";
import { requireSession } from "@/lib/auth/session";
import { listAdminStudents } from "@/services/admin-intelligence";
import type { StudentDirectoryFilters } from "@/lib/admin/types";

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<StudentDirectoryFilters>;
}) {
  const session = await requireSession(["college_admin"]);
  const filters = await searchParams;
  const result = await listAdminStudents(session.organizationId, filters);

  return (
    <Suspense
      fallback={
        <AdminGlass className="p-8 text-center text-sm text-[#898989]">
          Loading directory…
        </AdminGlass>
      }
    >
      <StudentDirectory
        rows={result.rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        facets={result.facets}
      />
    </Suspense>
  );
}
