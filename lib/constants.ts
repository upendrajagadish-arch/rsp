export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;

export const VERIFICATION_LABELS = {
  issuer_verified: "Issuer Verified",
  institution_reviewed: "Institution Reviewed",
  pending: "Pending Verification",
  unavailable: "Verification Unavailable",
  rejected: "Rejected",
  expired: "Expired",
  revoked: "Revoked",
} as const;
