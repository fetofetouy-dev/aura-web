/**
 * Google API utilities
 * - Token refresh (access_token expires every 1h, refresh_token is permanent)
 * - Gmail send
 * - Calendar events
 */

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * Exchange a refresh_token for a fresh access_token.
 * Calls Google's token endpoint directly (no SDK needed).
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  expiresAt: number
}> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  })

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Token refresh failed: ${error.error_description ?? error.error}`)
  }

  const data: TokenResponse = await res.json()
  return {
    accessToken: data.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
  }
}

/**
 * Send an email via Gmail API.
 * Encodes the email as RFC 2822 base64url.
 */
export async function sendGmail(
  accessToken: string,
  {
    to,
    subject,
    body,
    fromName,
  }: { to: string; subject: string; body: string; fromName?: string }
): Promise<{ messageId: string }> {
  const from = fromName ?? "Aura Automations"

  const rawEmail = [
    `From: ${from} <me>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    body,
  ].join("\r\n")

  // base64url encode
  const encoded = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Gmail send failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  return { messageId: data.id }
}

/**
 * Get upcoming calendar events.
 */
export async function getCalendarEvents(
  accessToken: string,
  { timeMin, timeMax }: { timeMin: string; timeMax: string }
): Promise<{ id: string; summary: string; start: string; end: string }[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "20",
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Calendar fetch failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    summary: item.summary,
    start: item.start?.dateTime ?? item.start?.date,
    end: item.end?.dateTime ?? item.end?.date,
  }))
}
