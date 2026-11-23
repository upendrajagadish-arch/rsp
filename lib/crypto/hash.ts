/**
 * Content hashing for certificates and share tokens (SHA-256 hex).
 */
export async function sha256Hex(bytes: Uint8Array | ArrayBuffer): Promise<string> {
  const view =
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", new Uint8Array(view));
    return bufferToHex(digest);
  }

  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(view).digest("hex");
}

export async function sha256HexFromString(value: string): Promise<string> {
  return sha256Hex(new TextEncoder().encode(value));
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}