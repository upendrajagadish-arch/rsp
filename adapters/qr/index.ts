import { checkCredentialUrlSafety } from "@/adapters/issuer";

export type QrExtractionOutcome =
  | {
      status: "success";
      urls: string[];
      credentialUrls: string[];
    }
  | { status: "insufficient"; reason: string }
  | { status: "unavailable"; reason: string };

const URL_IN_TEXT =
  /https?:\/\/[^\s<>"')\]]+/gi;

const GENERIC_HOME_PATTERNS = [
  /^https?:\/\/[^/]+\/?$/i,
  /^https?:\/\/[^/]+\/(index\.(html?|php)|home)\/?$/i,
];

export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_IN_TEXT) ?? [];
  const unique = new Set<string>();
  for (const raw of matches) {
    const cleaned = raw.replace(/[.,;]+$/, "");
    const safety = checkCredentialUrlSafety(cleaned);
    if (safety.safe) {
      unique.add(safety.normalizedUrl);
    }
  }
  return [...unique];
}

function isGenericWebsiteOnly(urls: string[]): boolean {
  if (urls.length === 0) return true;
  return urls.every((url) => GENERIC_HOME_PATTERNS.some((re) => re.test(url)));
}

/**
 * Parses QR / embedded URL hints from credential text.
 * Marks insufficient when only generic issuer homepages are present.
 */
export function extractCredentialUrlsFromContent(
  rawText: string | null | undefined,
  declaredUrl: string | null | undefined,
): QrExtractionOutcome {
  const fromText = rawText ? extractUrlsFromText(rawText) : [];
  const declared: string[] = [];

  if (declaredUrl) {
    const safety = checkCredentialUrlSafety(declaredUrl);
    if (safety.safe) {
      declared.push(safety.normalizedUrl);
    }
  }

  const merged = [...new Set([...declared, ...fromText])];
  if (merged.length === 0) {
    return {
      status: "insufficient",
      reason: "No verifiable credential URLs were found in the document",
    };
  }

  if (isGenericWebsiteOnly(merged)) {
    return {
      status: "insufficient",
      reason:
        "Only generic website links were found — a specific credential verification URL is required",
    };
  }

  return {
    status: "success",
    urls: merged,
    credentialUrls: merged,
  };
}