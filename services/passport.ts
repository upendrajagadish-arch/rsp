import { sha256HexFromString } from "@/lib/crypto/hash";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/supabase";
import { getSessionContext } from "@/services/auth";
import { writeAuditLog } from "@/services/audit";

type StudentProfileRow = Database["public"]["Tables"]["student_profiles"]["Row"];

export type PublicPassportPayload = {
  passportId: string;
  studentProfile: Pick<
    StudentProfileRow,
    "degree" | "branch" | "graduation_year" | "bio" | "public_sections"
  >;
  credentials: Array<{
    id: string;
    title: string | null;
    issuing_organization: string | null;
    verification_status: string;
    issue_date: string | null;
  }>;
  skills: Array<{
    name: string;
    slug: string;
    evidence_count: number;
    strongest_evidence: string;
  }>;
};

function generateShareToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ShareLinkResult = {
  shareId: string;
  token: string;
  url: string;
  expiresAt: string | null;
  label: string | null;
};

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export async function createShareLink(
  studentProfileId: string,
  label?: string | null,
  expiresAt?: string | null,
): Promise<ShareLinkResult> {
  const session = await getSessionContext();
  if (!session?.studentProfile || session.studentProfile.id !== studentProfileId) {
    throw new Error("Student profile required to create a share link");
  }

  const rawToken = generateShareToken();
  const tokenHash = await sha256HexFromString(rawToken);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("passport_shares")
    .insert({
      student_profile_id: studentProfileId,
      token_hash: tokenHash,
      label: label ?? null,
      expires_at: expiresAt ?? null,
      is_active: true,
    })
    .select("id, created_at, expires_at, label")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("student_profiles")
    .update({ sharing_enabled: true })
    .eq("id", studentProfileId);

  await writeAuditLog({
    action: "passport.share_created",
    entityType: "passport_share",
    entityId: data.id,
    organizationId: session.organization?.id ?? null,
    actorId: session.user.id,
  });

  const url = `${appBaseUrl()}/passport/${rawToken}`;
  return {
    shareId: data.id,
    token: rawToken,
    url,
    expiresAt: data.expires_at,
    label: data.label,
  };
}

/** @deprecated Use createShareLink */
export async function createShareToken(input?: { label?: string | null; expiresAt?: string | null }) {
  const session = await getSessionContext();
  if (!session?.studentProfile) {
    throw new Error("Student profile required to create a share link");
  }
  return createShareLink(session.studentProfile.id, input?.label ?? null, input?.expiresAt ?? null);
}

export async function revokeShare(shareId: string) {
  const session = await getSessionContext();
  if (!session?.studentProfile) {
    throw new Error("Student profile required");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("passport_shares")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", shareId)
    .eq("student_profile_id", session.studentProfile.id);

  if (error) {
    throw new Error(error.message);
  }

  await writeAuditLog({
    action: "passport.share_revoked",
    entityType: "passport_share",
    entityId: shareId,
    organizationId: session.organization?.id ?? null,
    actorId: session.user.id,
  });
}

export async function getPublicPassport(token: string): Promise<PublicPassportPayload | null> {
  return getPublicPassportByToken(token);
}

export async function getPublicPassportByToken(token: string): Promise<PublicPassportPayload | null> {
  const tokenHash = await sha256HexFromString(token.trim());
  const supabase = createServiceClient();

  const { data: share } = await supabase
    .from("passport_shares")
    .select("id, student_profile_id, is_active, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!share || !share.is_active || share.revoked_at) {
    return null;
  }

  if (share.expires_at && Date.parse(share.expires_at) < Date.now()) {
    return null;
  }

  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("id, passport_id, degree, branch, graduation_year, bio, public_sections, sharing_enabled")
    .eq("id", share.student_profile_id)
    .single();

  if (!studentProfile?.sharing_enabled) {
    return null;
  }

  const sections = (studentProfile.public_sections ?? {}) as Record<string, boolean>;

  let credentials: PublicPassportPayload["credentials"] = [];
  if (sections.credentials !== false) {
    const { data } = await supabase
      .from("certificates")
      .select("id, title, issuing_organization, verification_status, issue_date")
      .eq("student_profile_id", studentProfile.id)
      .order("created_at", { ascending: false });
    credentials = data ?? [];
  }

  let skills: PublicPassportPayload["skills"] = [];
  if (sections.skills !== false) {
    const { data } = await supabase
      .from("student_skills")
      .select("evidence_count, strongest_evidence, skill:skills(name, slug)")
      .eq("student_profile_id", studentProfile.id)
      .order("evidence_count", { ascending: false });

    skills = (data ?? []).map((row) => {
      const skill = row.skill as unknown as { name: string; slug: string };
      return {
        name: skill.name,
        slug: skill.slug,
        evidence_count: row.evidence_count,
        strongest_evidence: row.strongest_evidence,
      };
    });
  }

  await writeAuditLog({
    action: "passport.public_view",
    entityType: "student_profile",
    entityId: studentProfile.id,
    metadata: { shareId: share.id } as Json,
    asService: true,
  });

  return {
    passportId: studentProfile.passport_id,
    studentProfile: {
      degree: studentProfile.degree,
      branch: studentProfile.branch,
      graduation_year: studentProfile.graduation_year,
      bio: studentProfile.bio,
      public_sections: studentProfile.public_sections,
    },
    credentials,
    skills,
  };
}