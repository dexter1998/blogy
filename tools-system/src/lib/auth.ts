import { env } from "@/lib/env";

export type AuthResult =
  | { ok: true; principal: string }
  | { ok: false; reason: string };

/**
 * Single-source auth check. In `open` mode anyone can call.
 * In `key` mode, x-api-key must match a configured key.
 * Replace with DB lookup later — keep the signature.
 */
export function authenticate(req: Request): AuthResult {
  if (env.apiAuthMode === "open") {
    return { ok: true, principal: "anonymous" };
  }
  const provided = req.headers.get("x-api-key");
  if (!provided) return { ok: false, reason: "Missing x-api-key header" };
  if (!env.apiKeys.includes(provided)) {
    return { ok: false, reason: "Invalid API key" };
  }
  return { ok: true, principal: `key:${provided.slice(0, 6)}…` };
}
