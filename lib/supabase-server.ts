import { createClient } from "@supabase/supabase-js"
import { assertSupabaseConfigured } from "@/lib/supabase-config"

/** Server-side Supabase client for API routes (auth, reads, etc.). */
export function createSupabaseServerClient() {
  const { url, anonKey } = assertSupabaseConfigured()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  return createClient(url, serviceKey || anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
