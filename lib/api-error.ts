import { NextResponse } from "next/server"

/**
 * Return a safe error response that never leaks internal details.
 * Always log the real error server-side for debugging.
 */
export function safeError(
  realError: unknown,
  userMessage = "Error al procesar la solicitud.",
  status = 500
) {
  console.error("[api-error]", realError)
  return NextResponse.json({ error: userMessage }, { status })
}

/**
 * Sanitize an email header value to prevent header injection.
 * Strips \r and \n characters.
 */
export function sanitizeEmailHeader(value: string): string {
  return value.replace(/[\r\n]/g, "")
}

/**
 * Validate that a URL is a safe HTTP(S) URL (not javascript:, data:, etc.)
 */
export function isValidHttpUrl(url: string | undefined | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Validate an ISO date string (YYYY-MM-DD).
 */
export function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
}

/**
 * Validate and clamp a numeric query parameter.
 */
export function parseIntParam(value: string | null, defaultVal: number, min: number, max: number): number {
  if (!value) return defaultVal
  const n = parseInt(value, 10)
  if (isNaN(n)) return defaultVal
  return Math.max(min, Math.min(max, n))
}
