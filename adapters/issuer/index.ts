import type { VerificationStatus } from "@/types/supabase";

export type IssuerCheckInput = {
  credentialNumber?: string | null;
  recipientName?: string | null;
  title?: string | null;
  credentialUrl?: string | null;
  issuingOrganization?: string | null;
};

export type IssuerCheckResult = {
  status: VerificationStatus;
  method: string;
  source: string;
  evidence: Record<string, unknown>;
};

export interface IssuerAdapter {
  id: string;
  supports(input: IssuerCheckInput): boolean;
  verify(input: IssuerCheckInput): Promise<IssuerCheckResult>;
}

const PRIVATE_HOSTS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|\[::1\])/i;

export function checkCredentialUrlSafety(
  urlString: string,
): { safe: true; normalizedUrl: string } | { safe: false; reason: string } {
  try {
    const url = assertSafePublicUrl(urlString.trim());
    return { safe: true, normalizedUrl: url.toString() };
  } catch (error) {
    return {
      safe: false,
      reason: error instanceof Error ? error.message : "Unsafe URL",
    };
  }
}

export function assertSafePublicUrl(urlString: string): URL {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid credential URL");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Credential URL must be http(s)");
  }
  if (PRIVATE_HOSTS.test(url.hostname) || url.hostname.endsWith(".local")) {
    throw new Error("Credential URL points to a private or local network destination");
  }
  return url;
}

/** Placeholder for future Credly/Google/etc adapters. Never claims success without a live check. */
export class UnavailableIssuerAdapter implements IssuerAdapter {
  id = "unavailable";

  supports() {
    return true;
  }

  async verify(input: IssuerCheckInput): Promise<IssuerCheckResult> {
    return {
      status: "unavailable",
      method: "issuer_api",
      source: "none",
      evidence: {
        reason:
          "No trusted issuer adapter is configured for this credential. Institutional review may be requested.",
        attemptedFields: {
          credentialNumber: Boolean(input.credentialNumber),
          credentialUrl: Boolean(input.credentialUrl),
          issuer: input.issuingOrganization ?? null,
        },
      },
    };
  }
}

export class SafeUrlPresenceAdapter implements IssuerAdapter {
  id = "url-presence";

  supports(input: IssuerCheckInput) {
    return Boolean(input.credentialUrl);
  }

  async verify(input: IssuerCheckInput): Promise<IssuerCheckResult> {
    try {
      const url = assertSafePublicUrl(input.credentialUrl!);
      return {
        status: "unavailable",
        method: "qr_or_link",
        source: url.origin,
        evidence: {
          reason:
            "A public verification URL was found, but opening a website is not sufficient to authenticate a certificate. An approved issuer adapter is required.",
          url: url.toString(),
        },
      };
    } catch (error) {
      return {
        status: "rejected",
        method: "qr_or_link",
        source: "url_safety",
        evidence: {
          reason: error instanceof Error ? error.message : "Unsafe credential URL",
        },
      };
    }
  }
}

export function getIssuerAdapters(): IssuerAdapter[] {
  return [new SafeUrlPresenceAdapter(), new UnavailableIssuerAdapter()];
}
