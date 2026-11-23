import { describe, expect, it, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

import { matchStudentToRole } from "@/services/career";

describe("matchStudentToRole", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("computes weighted coverage from evidenced skills", async () => {
    const roleId = "role-1";
    const studentId = "student-1";

    mockFrom.mockImplementation((table: string) => {
      if (table === "job_roles") {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  title: "Cloud Engineer",
                  job_role_requirements: [
                    {
                      skill_id: "s1",
                      weight: 2,
                      is_required: true,
                      skills: { name: "Python" },
                    },
                    {
                      skill_id: "s2",
                      weight: 1,
                      is_required: false,
                      skills: { name: "AWS" },
                    },
                  ],
                },
              }),
            }),
          }),
        };
      }
      if (table === "student_skills") {
        return {
          select: () => ({
            eq: () => ({
              gt: async () => ({
                data: [{ skill_id: "s1", evidence_count: 3 }],
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    });

    const match = await matchStudentToRole(studentId, roleId);
    expect(match.roleTitle).toBe("Cloud Engineer");
    expect(match.scorePercent).toBeCloseTo(66.7, 1);
    expect(match.matched).toHaveLength(1);
    expect(match.missing).toHaveLength(1);
    expect(match.disclaimer).toContain("does not predict");
  });
});