"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  ensureClipVoteStats,
  fetchClipVoteStats,
  fetchUserVotedClipIds,
  toggleFeedClipVote,
} from "@/lib/supabase-feed-votes"

interface UseSupabaseFeedVotesOptions {
  userId: string | null
  clipIds: string[]
}

export function useSupabaseFeedVotes({
  userId,
  clipIds,
}: UseSupabaseFeedVotesOptions) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({})
  const [votedClipIds, setVotedClipIds] = useState<Set<string>>(new Set())
  const [pendingClipId, setPendingClipId] = useState<string | null>(null)

  const clipKey = clipIds.join("|")

  const refresh = useCallback(async () => {
    if (clipIds.length === 0) {
      setVoteCounts({})
      setVotedClipIds(new Set())
      setReady(true)
      return
    }

    setError(null)

    try {
      await ensureClipVoteStats(clipIds)
      const [counts, voted] = await Promise.all([
        fetchClipVoteStats(clipIds),
        userId
          ? fetchUserVotedClipIds(userId, clipIds)
          : Promise.resolve(new Set<string>()),
      ])

      setVoteCounts(counts)
      setVotedClipIds(voted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load votes.")
    } finally {
      setReady(true)
    }
  }, [clipIds, userId])

  useEffect(() => {
    setReady(false)
    void refresh()
  }, [refresh, clipKey])

  useEffect(() => {
    if (clipIds.length === 0) return

    const channel = supabase
      .channel(`dashboard-votes-${clipKey.slice(0, 48)}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "feed_clip_vote_stats",
        },
        (payload) => {
          const row = payload.new as { clip_id?: string; vote_count?: number }
          if (!row.clip_id || row.vote_count == null) return
          if (!clipIds.includes(row.clip_id)) return

          setVoteCounts((prev) => ({
            ...prev,
            [row.clip_id!]: Number(row.vote_count) || 0,
          }))
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [clipIds, clipKey])

  const getVoteCount = useCallback(
    (clipId: string, seedCount = 0) => voteCounts[clipId] ?? seedCount,
    [voteCounts],
  )

  const isVoted = useCallback(
    (clipId: string) => votedClipIds.has(clipId),
    [votedClipIds],
  )

  const toggleVote = useCallback(
    async (
      clipId: string,
    ): Promise<{ ok: true } | { ok: false; reason: string }> => {
      if (!userId) {
        return { ok: false, reason: "Sign in to vote on entries." }
      }

      if (pendingClipId) {
        return { ok: false, reason: "Please wait…" }
      }

      const wasVoted = votedClipIds.has(clipId)
      const previousCount = voteCounts[clipId] ?? 0

      setPendingClipId(clipId)
      setVotedClipIds((prev) => {
        const next = new Set(prev)
        if (wasVoted) next.delete(clipId)
        else next.add(clipId)
        return next
      })
      setVoteCounts((prev) => ({
        ...prev,
        [clipId]: Math.max(0, previousCount + (wasVoted ? -1 : 1)),
      }))

      try {
        const result = await toggleFeedClipVote(clipId)
        setVoteCounts((prev) => ({ ...prev, [clipId]: result.voteCount }))
        setVotedClipIds((prev) => {
          const next = new Set(prev)
          if (result.liked) next.add(clipId)
          else next.delete(clipId)
          return next
        })
        return { ok: true }
      } catch (err) {
        setVotedClipIds((prev) => {
          const next = new Set(prev)
          if (wasVoted) next.add(clipId)
          else next.delete(clipId)
          return next
        })
        setVoteCounts((prev) => ({ ...prev, [clipId]: previousCount }))
        return {
          ok: false,
          reason: err instanceof Error ? err.message : "Vote failed.",
        }
      } finally {
        setPendingClipId(null)
      }
    },
    [pendingClipId, userId, voteCounts, votedClipIds],
  )

  return {
    ready,
    error,
    canVote: Boolean(userId),
    getVoteCount,
    isVoted,
    toggleVote,
    refresh,
    pendingClipId,
  }
}
