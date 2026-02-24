import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { User } from "@supabase/supabase-js"

type AuthResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse }

/**
 * Authenticate the current request and return the user.
 * Returns a NextResponse error if not authenticated — use it directly as the route response.
 *
 * Usage:
 *   const { user, error } = await requireAuth()
 *   if (error) return error
 *   // user is guaranteed to be defined
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { user, error: null }
}
