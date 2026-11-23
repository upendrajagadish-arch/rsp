import { describe, expect, it } from "vitest";
import { hashBuffer } from "@/services/certificates";

describe("certificate content hash", () => {
  it("produces identical SHA-256 hex for the same bytes", () => {
    const payload = Buffer.from("same-certificate-bytes");
    const a = hashBuffer(payload);
    const b = hashBuffer(Buffer.from(payload));
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("differs for different payloads", () => {
    expect(hashBuffer(Buffer.from("file-a"))).not.toBe(hashBuffer(Buffer.from("file-b")));
  });
});