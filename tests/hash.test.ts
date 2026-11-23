import { describe, expect, it } from "vitest";
import { sha256Hex, sha256HexFromString } from "@/lib/crypto/hash";

describe("sha256HexFromString", () => {
  it("returns a stable 64-char hex digest", async () => {
    const a = await sha256HexFromString("smart-skill-passport");
    const b = await sha256HexFromString("smart-skill-passport");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("differs for different inputs", async () => {
    const a = await sha256HexFromString("token-a");
    const b = await sha256HexFromString("token-b");
    expect(a).not.toBe(b);
  });
});

describe("sha256Hex", () => {
  it("hashes byte payloads", async () => {
    const bytes = new TextEncoder().encode("bytes");
    const fromBytes = await sha256Hex(bytes);
    const fromString = await sha256HexFromString("bytes");
    expect(fromBytes).toBe(fromString);
  });
});