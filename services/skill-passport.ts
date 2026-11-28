import { isDemoMode } from "@/lib/demo/mode";
import {
  getDemoSkillPassport,
  getDemoAchievementsMutable,
  rebuildDemoBundle,
} from "@/lib/demo/skill-passport";
import { STAMP_CATEGORIES, stampByCode } from "@/lib/passport/stamp-categories";
import { levelForVerifiedCount } from "@/lib/passport/tokens";
import type {
  AchievementStatus,
  PassportAchievement,
  PassportViewerMode,
  SkillPassportBundle,
} from "@/lib/passport/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function getSkillPassport(
  studentProfileId: string,
  viewerMode: PassportViewerMode = "student",
): Promise<SkillPassportBundle | null> {
  if (isDemoMode()) {
    const bundle =
      rebuildDemoBundle(studentProfileId) ?? getDemoSkillPassport(studentProfileId);
    if (!bundle) return null;
    if (viewerMode === "public") {
      return {
        ...bundle,
        achievements: bundle.achievements.filter((a) => a.status === "verified"),
        identity: { ...bundle.identity, email: null },
      };
    }
    return bundle;
  }

  // Live path: prefer DB when tables exist; fall back to null empty shell
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("student_profiles")
      .select(
        "id, passport_id, degree, branch, graduation_year, roll_number, academic_year, academic_eligible, organization_id, organizations(name), profiles(full_name, email, avatar_url)",
      )
      .eq("id", studentProfileId)
      .maybeSingle();

    if (!profile) return getDemoSkillPassport(studentProfileId);

    // Tables may not be migrated yet — use demo-shaped empty if query fails
    const { data: passport } = await supabase
      .from("student_passports" as never)
      .select("*")
      .eq("student_profile_id", studentProfileId)
      .maybeSingle();

    void passport;
    return getDemoSkillPassport(studentProfileId);
  } catch {
    return getDemoSkillPassport(studentProfileId);
  }
}

export async function markUnlocksSeen(studentProfileId: string, achievementIds: string[]) {
  if (isDemoMode()) {
    const rows = getDemoAchievementsMutable(studentProfileId);
    const now = new Date().toISOString();
    for (const row of rows) {
      if (achievementIds.includes(row.id) && !row.seenUnlockAt) {
        row.seenUnlockAt = now;
      }
    }
    return { ok: true };
  }
  try {
    const supabase = createServiceClient();
    await supabase
      .from("student_achievements" as never)
      .update({ seen_unlock_at: new Date().toISOString() } as never)
      .in("id", achievementIds);
  } catch {
    /* ignore until migrated */
  }
  return { ok: true };
}

export async function saveLastPage(studentProfileId: string, lastPage: number) {
  if (isDemoMode()) return { ok: true };
  try {
    const supabase = createServiceClient();
    await supabase
      .from("student_passports" as never)
      .update({ last_page: lastPage, updated_at: new Date().toISOString() } as never)
      .eq("student_profile_id", studentProfileId);
  } catch {
    /* ignore */
  }
  return { ok: true };
}

function nextDemoCode(studentProfileId: string) {
  const n = getDemoAchievementsMutable(studentProfileId).length + 200;
  return `SSP-ACH-${String(n).padStart(6, "0")}`;
}

/** Idempotent: one active achievement per certificate source. */
export async function ensureAchievementFromCertificate(params: {
  studentProfileId: string;
  organizationId: string;
  certificateId: string;
  title: string;
  issuer: string | null;
  completedOn: string | null;
  status: Extract<AchievementStatus, "submitted" | "verified" | "rejected">;
  actorId?: string | null;
  reason?: string | null;
}) {
  const cat = stampByCode("01")!;
  if (isDemoMode()) {
    const rows = getDemoAchievementsMutable(params.studentProfileId);
    const existing = rows.find(
      (r) =>
        r.sourceType === "certificate" &&
        r.sourceId === params.certificateId &&
        r.status !== "revoked",
    );
    if (existing) {
      existing.status = params.status;
      existing.title = params.title;
      existing.issuer = params.issuer;
      if (params.status === "verified") {
        existing.verifiedAt = new Date().toISOString();
        existing.physicalStatus = existing.physicalStatus ?? "eligible";
        existing.seenUnlockAt = null;
      }
      if (params.status === "rejected") {
        existing.verifiedAt = null;
        existing.physicalStatus = null;
      }
      return existing;
    }
    const created: PassportAchievement = {
      id: `${params.studentProfileId}-cert-${params.certificateId}`,
      stampCode: cat.code,
      stampTitle: cat.title,
      colour: cat.colour,
      iconKey: cat.iconKey,
      pageGroup: cat.pageGroup,
      title: params.title,
      issuer: params.issuer,
      completedOn: params.completedOn,
      status: params.status,
      achievementCode: nextDemoCode(params.studentProfileId),
      evidenceNote: params.reason ?? null,
      verifiedAt: params.status === "verified" ? new Date().toISOString() : null,
      seenUnlockAt: null,
      sourceType: "certificate",
      sourceId: params.certificateId,
      physicalStatus: params.status === "verified" ? "eligible" : null,
    };
    rows.push(created);
    return created;
  }

  try {
    const supabase = createServiceClient();
    const achievementCode = `SSP-ACH-${params.certificateId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    const { data: category } = await supabase
      .from("stamp_categories" as never)
      .select("id, code")
      .eq("code", "01")
      .maybeSingle();

    const categoryId = (category as { id?: string } | null)?.id;
    if (!categoryId) return null;

    const { data: existing } = await supabase
      .from("student_achievements" as never)
      .select("id")
      .eq("student_profile_id", params.studentProfileId)
      .eq("source_type", "certificate")
      .eq("source_id", params.certificateId)
      .neq("status", "revoked")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("student_achievements" as never)
        .update({
          status: params.status,
          title: params.title,
          issuer: params.issuer,
          verified_at: params.status === "verified" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", (existing as { id: string }).id);
      return existing;
    }

    const { data: inserted } = await supabase
      .from("student_achievements" as never)
      .insert({
        organization_id: params.organizationId,
        student_profile_id: params.studentProfileId,
        stamp_category_id: categoryId,
        title: params.title,
        issuer: params.issuer,
        completed_on: params.completedOn,
        status: params.status,
        source_type: "certificate",
        source_id: params.certificateId,
        achievement_code: achievementCode,
        verified_at: params.status === "verified" ? new Date().toISOString() : null,
      } as never)
      .select("id")
      .single();

    if (params.status === "verified" && inserted) {
      await supabase.from("physical_stamp_issuances" as never).insert({
        organization_id: params.organizationId,
        student_profile_id: params.studentProfileId,
        achievement_id: (inserted as { id: string }).id,
        stamp_category_id: categoryId,
        status: "eligible",
      } as never);
    }

    return inserted;
  } catch {
    return null;
  }
}

export async function adminUpdateAchievement(params: {
  studentProfileId: string;
  achievementId: string;
  action: "approve" | "reject" | "revoke" | "request_correction";
  reason: string;
  actorId?: string | null;
}) {
  if (isDemoMode()) {
    const rows = getDemoAchievementsMutable(params.studentProfileId);
    const row = rows.find((r) => r.id === params.achievementId);
    if (!row) return { ok: false, error: "Achievement not found" };
    if (params.action === "approve") {
      row.status = "verified";
      row.verifiedAt = new Date().toISOString();
      row.seenUnlockAt = null;
      row.physicalStatus = row.physicalStatus ?? "eligible";
      row.evidenceNote = params.reason;
    } else if (params.action === "reject" || params.action === "request_correction") {
      row.status = "rejected";
      row.verifiedAt = null;
      row.evidenceNote = params.reason;
    } else if (params.action === "revoke") {
      row.status = "revoked";
      row.physicalStatus = "cancelled";
      row.evidenceNote = params.reason;
    }
    return { ok: true };
  }
  return { ok: false, error: "Live admin achievement updates require migrated tables" };
}

export async function adminAwardAchievement(params: {
  studentProfileId: string;
  stampCode: string;
  title: string;
  issuer?: string;
  reason: string;
  completedOn?: string;
}) {
  const cat = stampByCode(params.stampCode) ?? STAMP_CATEGORIES[0];
  if (isDemoMode()) {
    const rows = getDemoAchievementsMutable(params.studentProfileId);
    const created: PassportAchievement = {
      id: `${params.studentProfileId}-manual-${Date.now()}`,
      stampCode: cat.code,
      stampTitle: cat.title,
      colour: cat.colour,
      iconKey: cat.iconKey,
      pageGroup: cat.pageGroup,
      title: params.title,
      issuer: params.issuer ?? "Institution",
      completedOn: params.completedOn ?? new Date().toISOString().slice(0, 10),
      status: "verified",
      achievementCode: nextDemoCode(params.studentProfileId),
      evidenceNote: params.reason,
      verifiedAt: new Date().toISOString(),
      seenUnlockAt: null,
      sourceType: "manual",
      sourceId: `manual-${Date.now()}`,
      physicalStatus: "eligible",
    };
    rows.push(created);
    return { ok: true, achievement: created };
  }
  return { ok: false, error: "Live manual awards require migrated tables" };
}

export function overviewFromAchievements(achievements: PassportAchievement[]) {
  const verified = achievements.filter((a) => a.status === "verified");
  const level = levelForVerifiedCount(verified.length);
  return {
    verifiedCount: verified.length,
    submittedCount: achievements.filter((a) => a.status === "submitted").length,
    certificationCount: verified.filter((a) => a.pageGroup === "certifications").length,
    projectCount: verified.filter((a) => a.pageGroup === "projects").length,
    internshipCount: verified.filter((a) => a.pageGroup === "internships").length,
    pendingVerification: achievements.filter((a) => a.status === "submitted").length,
    levelKey: level.key,
    levelLabel: level.label,
    physicalIssued: achievements.filter((a) => a.physicalStatus === "issued").length,
    physicalPending: achievements.filter(
      (a) =>
        a.physicalStatus === "eligible" ||
        a.physicalStatus === "ready_for_collection" ||
        a.physicalStatus === "awaiting_allocation",
    ).length,
    lastAchievementAt:
      verified.sort((a, b) => String(b.verifiedAt).localeCompare(String(a.verifiedAt)))[0]
        ?.verifiedAt ?? null,
  };
}

export function publicPassportSummary(bundle: SkillPassportBundle) {
  return {
    fullName: bundle.identity.fullName,
    passportNumber: bundle.identity.passportNumber,
    organizationName: bundle.identity.organizationName,
    branch: bundle.identity.branch,
    degree: bundle.identity.degree,
    graduationYear: bundle.identity.graduationYear,
    levelLabel: bundle.overview.levelLabel,
    verifiedAchievements: bundle.achievements
      .filter((a) => a.status === "verified")
      .map((a) => ({
        title: a.title,
        stampTitle: a.stampTitle,
        issuer: a.issuer,
        completedOn: a.completedOn,
        achievementCode: a.achievementCode,
      })),
  };
}
