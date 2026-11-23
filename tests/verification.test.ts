import { describe, expect, it } from "vitest";
import { checkCredentialUrlSafety } from "@/adapters/issuer";
import { UnavailableIssuerAdapter } from "@/adapters/issuer";

describe("issuer verification safety", () => {
  it("rejects private-network credential URLs", () => {
    const result = checkCredentialUrlSafety("http://127.0.0.1/credential/1");
    expect(result.safe).toBe(false);
  });

  it("allows public https URLs", () => {
    const result = checkCredentialUrlSafety("https://www.credly.com/badges/example");
    expect(result.safe).toBe(true);
    if (result.safe) {
      expect(result.normalizedUrl).toContain("credly.com");
    }
  });

  it("never returns issuer_verified without a trusted adapter", async () => {
    const adapter = new UnavailableIssuerAdapter();
    const result = await adapter.verify({
      credentialNumber: "ABC-123",
      credentialUrl: "https://example.com/verify",
      title: "AWS Cloud Practitioner",
    });
    expect(result.status).not.toBe("issuer_verified");
    expect(result.status).toBe("unavailable");
  });
});