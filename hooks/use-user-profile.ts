"use client"

import { useCallback, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import {
  ensureUserProfile,
  fetchUserProfile,
  type UserProfileRow,
} from "@/lib/supabase-profiles"

interface UseUserProfileResult {
  profile: UserProfileRow | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserProfile(user: User | null): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const row = await ensureUserProfile(user)
      setProfile(row)
    } catch (err) {
      try {
        const existing = await fetchUserProfile(user.id)
        setProfile(existing)
        setError(
          existing
            ? null
            : err instanceof Error
              ? err.message
              : "Failed to load profile.",
        )
      } catch (innerErr) {
        setProfile(null)
        setError(
          innerErr instanceof Error
            ? innerErr.message
            : "Failed to load profile.",
        )
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { profile, loading, error, refresh }
}
