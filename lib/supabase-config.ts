/**
 * Normalizes Supabase project URL for GoTrue and REST clients.
 * Trailing slashes or pasted REST/auth paths cause
 * "Invalid path specified in request URL" in production.
 */
export function normalizeSupabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) return ""

  let url = raw.trim()

  // Strip accidental API path suffixes if pasted from the dashboard.
  url = url.replace(/\/rest\/v1\/?$/i, "")
  url = url.replace(/\/auth\/v1\/?$/i, "")
  url = url.replace(/\/+$/, "")

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }

  return url
}

export function getSupabaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ""
  return normalizeSupabaseUrl(raw)
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    ""
  ).trim()
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export function assertSupabaseConfigured(): { url: string; anonKey: string } {
  const url = getSupabaseUrl()
  const anonKey = getSupabaseAnonKey()

  if (!url) {
    throw new Error(
      "Supabase URL is not configured. Set NEXT_PUBLIC_SUPABASE_URL to your project root (e.g. https://xyz.supabase.co) without trailing slashes or /auth/v1 paths.",
    )
  }

  if (!anonKey) {
    throw new Error(
      "Supabase anon key is not configured. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return { url, anonKey }
}
