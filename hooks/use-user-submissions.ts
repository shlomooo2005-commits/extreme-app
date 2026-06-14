"use client"

import { useCallback, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { UserSubmissionSummary } from "@/app/api/submissions/mine/route"
import { supabase } from "@/lib/supabaseClient"

interface UseUserSubmissionsResult {
  submissions: UserSubmissionSummary[]
  total: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUserSubmissions(user: User | null): UseUserSubmissionsResult {
  const [submissions, setSubmissions] = useState<UserSubmissionSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setSubmissions([])
      setTotal(0)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const res = await fetch("/api/submissions/mine", { headers })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load your uploads.")
      }

      const fromApi = (data.submissions ?? []) as UserSubmissionSummary[]
      setSubmissions(fromApi)
      setTotal(fromApi.length)
    } catch (err) {
      setSubmissions([])
      setTotal(0)
      setError(err instanceof Error ? err.message : "Failed to load your uploads.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { submissions, total, loading, error, refresh }
}
