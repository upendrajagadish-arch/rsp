import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import {
  listAdminStudentsForExport,
  studentsToCsv,
  studentsToExcelTsv,
} from "@/services/admin-intelligence";
import type { StudentDirectoryFilters } from "@/lib/admin/types";

export async function GET(request: Request) {
  const session = await requireSession(["college_admin"]);
  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const filters: StudentDirectoryFilters = {
    q: url.searchParams.get("q") ?? undefined,
    branch: url.searchParams.get("branch") ?? undefined,
    academicYear: url.searchParams.get("academicYear") ?? undefined,
    graduationYear: url.searchParams.get("graduationYear") ?? undefined,
    minCgpa: url.searchParams.get("minCgpa") ?? undefined,
    academicEligible: url.searchParams.get("academicEligible") ?? undefined,
    skill: url.searchParams.get("skill") ?? undefined,
    technologyCategory: url.searchParams.get("technologyCategory") ?? undefined,
    verificationStatus: url.searchParams.get("verificationStatus") ?? undefined,
    training: url.searchParams.get("training") ?? undefined,
    assessment: url.searchParams.get("assessment") ?? undefined,
    placementStatus: url.searchParams.get("placementStatus") ?? undefined,
    needsSupport: url.searchParams.get("needsSupport") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    order: url.searchParams.get("order") === "desc" ? "desc" : "asc",
  };

  const rows = await listAdminStudentsForExport(session.organizationId, filters);
  const body = format === "xlsx" ? studentsToExcelTsv(rows) : studentsToCsv(rows);
  const filename =
    format === "xlsx"
      ? `students-${session.organizationId.slice(0, 8)}.xls`
      : `students-${session.organizationId.slice(0, 8)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        format === "xlsx"
          ? "application/vnd.ms-excel; charset=utf-8"
          : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Export-Count": String(rows.length),
      "X-Organization-Id": session.organizationId,
    },
  });
}
