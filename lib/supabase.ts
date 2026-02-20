import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Browser-side Supabase client for Client Components.
 * Uses @supabase/ssr's createBrowserClient which stores auth state (including
 * the PKCE code_verifier) in cookies instead of localStorage. This is required
 * for the server-side /auth/callback route to successfully exchange the OAuth
 * code for a session — localStorage is not accessible server-side.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
