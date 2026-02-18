import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client — for server-side API routes only (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

/**
 * Server-side Supabase client for API routes and Server Components.
 * Reads/writes session from cookies — call inside request handlers only.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

/**
 * Browser-side Supabase client for Client Components.
 * Uses anonymous key — session managed via cookies set by the server.
 */
export function createSupabaseBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}
