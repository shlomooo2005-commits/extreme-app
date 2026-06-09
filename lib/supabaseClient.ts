import { createClient } from "@supabase/supabase-js"
import {
  assertSupabaseConfigured,
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase-config"

function createBrowserSupabaseClient() {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()

  if (!url || !anonKey) {
    return createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = createBrowserSupabaseClient()

export function isSupabaseClientConfigured(): boolean {
  try {
    assertSupabaseConfigured()
    return true
  } catch {
    return false
  }
}
