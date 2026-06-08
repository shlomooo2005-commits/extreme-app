"use client"

import { useCallback, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { UserSubmissionSummary } from "@/app/api/submissions/mine/route"
import { getSubmissionsForUser } from "@/lib/user-submissions-store"

interface UseUserSubmissionsResult {
  submissions: UserSubmissionSummary[]
  total: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function localToSummary(
  record: ReturnType<typeof getSubmissionsForUser>[number],
): UserSubmissionSummary {
  const { payload } = record
  return {
    id: payload.submissionId,
    competitionId: payload.competitionId ?? "",
    challengeTitle: payload.challengeTitle,
    categorySlug: payload.category,
    videoUrl: payload.video.secureUrl,
    posterUrl: payload.video.secureUrl.replace("/upload/", "/upload/so_0/"),
    status: payload.security?.status ?? "active",
    submittedAt: payload.submittedAt,
    rank: null,
    totalInCompetition: null,
    likesCount: null,
  }
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
      const res = await fetch(`/api/submissions/mine?userId=${encodeURIComponent(user.id)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load your uploads.")
      }

      const fromApi = (data.submissions ?? []) as UserSubmissionSummary[]
      const apiIds = new Set(fromApi.map((item) => item.id))
      const localOnly = getSubmissionsForUser(user.id)
        .map(localToSummary)
        .filter((item) => !apiIds.has(item.id))

      const merged = [...fromApi, ...localOnly].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
      )

      setSubmissions(merged)
      setTotal(merged.length)
    } catch (err) {
      const local = getSubmissionsForUser(user.id).map(localToSummary)
      setSubmissions(local)
      setTotal(local.length)
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
