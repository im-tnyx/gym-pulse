import { createHmac, timingSafeEqual } from "node:crypto";

export function sign(raw: Uint8Array, secret: string): string {
  return createHmac("sha256", secret).update(raw).digest("hex");
}

export function verifyRawWebhook(raw: Uint8Array, signature: string, secret: string): Readonly<{ eventId: string; ok: true }> {
  const expected = Buffer.from(sign(raw, secret), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("invalid_signature");
  const parsed = JSON.parse(Buffer.from(raw).toString("utf8")) as Record<string, unknown>;
  if (typeof parsed.eventId !== "string") throw new Error("invalid_event");
  return { eventId: parsed.eventId, ok: true };
}
