import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeTrackingCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (let index = 0; index < bytes.length; index += 1) {
    code += ALPHABET[bytes[index] % ALPHABET.length];
  }
  return `SY-${code}`;
}

export function normalizeTrackingCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}
