import { describe, expect, it } from "vitest";
import {
  listAdminStudents,
  studentsToCsv,
  getAdminOverview,
  getAdminStudent360,
} from "@/services/admin-intelligence";

describe("admin intelligence (demo)", () => {
  it("builds overview KPIs without inventing issuer verification", async () => {
    const overview = await getAdminOverview("demo-org");
    expect(overview.registeredStudents).toBeGreaterThan(0);
    expect(overview.certificatesIssuerVerified).toBe(0);
    expect(overview.byBranch.length).toBeGreaterThan(0);
    expect(overview.byAcademicYear.map((y) => y.label)).toEqual([
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
    ]);
    expect(overview.certificatesTotal).toBeGreaterThan(0);
  });

  it("filters and paginates the student directory", async () => {
    const cse = await listAdminStudents("demo-org", {
      branch: "Computer Science",
      page: "1",
      pageSize: "5",
    });
    expect(cse.rows.every((r) => r.branch === "Computer Science")).toBe(true);
    expect(cse.rows.length).toBeLessThanOrEqual(5);
    expect(cse.total).toBeGreaterThan(cse.rows.length - 1);

    const support = await listAdminStudents("demo-org", { needsSupport: "true" });
    expect(support.rows.every((r) => r.needsSupport)).toBe(true);
  });

  it("returns a 360 profile with honest certificate statuses", async () => {
    const profile = await getAdminStudent360("demo-org", "demo-student-profile");
    expect(profile).not.toBeNull();
    expect(profile!.certificates.some((c) => c.status === "issuer_verified")).toBe(false);
    expect(profile!.placement.note.toLowerCase()).toContain("no fabricated");
  });

  it("exports CSV with required columns", async () => {
    const { rows } = await listAdminStudents("demo-org", { pageSize: "100" });
    const csv = studentsToCsv(rows);
    expect(csv.split("\n")[0]).toContain("roll_number");
    expect(csv.split("\n").length).toBe(rows.length + 1);
  });
});
