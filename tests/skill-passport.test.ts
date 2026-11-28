import { describe, expect, it } from "vitest";
import { STAMP_CATEGORIES } from "@/lib/passport/stamp-categories";
import { PASSPORT_PAGES } from "@/lib/passport/page-map";
import { levelForVerifiedCount } from "@/lib/passport/tokens";
import { getDemoSkillPassport } from "@/lib/demo/skill-passport";
import {
  adminAwardAchievement,
  ensureAchievementFromCertificate,
  publicPassportSummary,
} from "@/services/skill-passport";

describe("skill passport", () => {
  it("seeds 24 stamp categories and a 32-page map", () => {
    expect(STAMP_CATEGORIES).toHaveLength(24);
    expect(PASSPORT_PAGES).toHaveLength(32);
    expect(PASSPORT_PAGES[0].kind).toBe("identity");
    expect(PASSPORT_PAGES[31].kind).toBe("verification");
  });

  it("builds a demo passport booklet for the primary student", () => {
    const bundle = getDemoSkillPassport("demo-student-profile");
    expect(bundle).not.toBeNull();
    expect(bundle!.identity.passportNumber).toContain("SSP-BOOK-");
    expect(bundle!.achievements.length).toBeGreaterThan(0);
    expect(bundle!.overview.verifiedCount).toBeGreaterThan(0);
    const pub = publicPassportSummary(bundle!);
    expect(pub.verifiedAchievements.every((a) => a.title)).toBe(true);
  });

  it("creates idempotent certificate achievements in demo mode", async () => {
    const first = await ensureAchievementFromCertificate({
      studentProfileId: "demo-student-profile",
      organizationId: "demo-org",
      certificateId: "test-cert-unique-1",
      title: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      completedOn: "2026-11-18",
      status: "verified",
    });
    const second = await ensureAchievementFromCertificate({
      studentProfileId: "demo-student-profile",
      organizationId: "demo-org",
      certificateId: "test-cert-unique-1",
      title: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      completedOn: "2026-11-18",
      status: "verified",
    });
    expect(first?.id).toBe(second?.id);
  });

  it("supports manual admin awards", async () => {
    const result = await adminAwardAchievement({
      studentProfileId: "demo-student-profile",
      stampCode: "06",
      title: "Club Lead",
      reason: "Documented appointment",
    });
    expect(result.ok).toBe(true);
  });

  it("maps level thresholds", () => {
    expect(levelForVerifiedCount(0).key).toBe("skill_beginner");
    expect(levelForVerifiedCount(3).key).toBe("skill_explorer");
    expect(levelForVerifiedCount(40).key).toBe("hall_of_fame");
  });
});
