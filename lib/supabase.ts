import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client — for server-side API routes only (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

/**
 * Browser-side Supabase client for Client Components.
 * Uses anonymous key — session managed via cookies set by the server.
 */
export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
