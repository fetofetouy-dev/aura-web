import { NextResponse } from "next/server"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitMap.forEach((value, key) => {
    if (value.resetAt < now) rateLimitMap.delete(key)
  })
}, 300_000)

/**
 * Simple in-memory rate limiter.
 * Returns null if allowed, or a 429 response if rate limited.
 *
 * @param key - Unique identifier (e.g., userId + endpoint)
 * @param maxRequests - Max requests per window
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): NextResponse | null {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  entry.count++

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    )
  }

  return null
}
