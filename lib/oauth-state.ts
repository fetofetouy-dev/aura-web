import crypto from "crypto"

const SECRET = process.env.OAUTH_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

/**
 * Create a signed OAuth state parameter.
 * Format: base64url(JSON) + "." + HMAC signature
 */
export function createSignedState(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url")
  return `${data}.${signature}`
}

/**
 * Verify and decode a signed OAuth state parameter.
 * Returns the decoded payload or null if invalid.
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
    return JSON.parse(Buffer.from(data, "base64url").toString())
  } catch {
    return null
  }
}
