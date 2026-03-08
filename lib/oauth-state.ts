import crypto from "crypto"

const SECRET = process.env.OAUTH_STATE_SECRET || ""
if (!SECRET && process.env.NODE_ENV === "production") {
  console.error("[SECURITY] OAUTH_STATE_SECRET is not set in production!")
}

const MAX_STATE_AGE_MS = 10 * 60 * 1000 // 10 minutes

/**
 * Create a signed OAuth state parameter.
 * Format: base64url(JSON) + "." + HMAC signature
 */
export function createSignedState(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString("base64url")
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url")
  return `${data}.${signature}`
}

/**
 * Verify and decode a signed OAuth state parameter.
 * Returns the decoded payload or null if invalid/expired.
 */
export function verifySignedState(state: string): Record<string, unknown> | null {
  const parts = state.split(".")
  if (parts.length !== 2) return null

  const [data, signature] = parts
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url")

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString())

    // Reject expired state tokens
    if (typeof payload.ts === "number" && Date.now() - payload.ts > MAX_STATE_AGE_MS) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
