"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { CategorySlug } from "@/lib/competitions"
import {
  fetchArenaBoard,
  getArenaPollIntervalMs,
  submitArenaSuggestion,
  voteArenaSuggestion,
} from "@/lib/arena-api"
import {
  filterSuggestions,
  getGlobalLeaderId,
  getVoterDeviceId,
  sortSuggestionsByVotes,
  type ArenaFilter,
  type ArenaSuggestion,
} from "@/lib/arena"

export function useArenaBoard() {
  const [suggestions, setSuggestions] = useState<ArenaSuggestion[]>([])
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<ArenaFilter>("all")
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)

  const voterId = useMemo(() => getVoterDeviceId(), [])

  const refresh = useCallback(async () => {
    try {
      const data = await fetchArenaBoard(voterId)
      setSuggestions(data.suggestions)
      setVotedIds(new Set(data.votedIds))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load arena.")
    } finally {
      setReady(true)
    }
  }, [voterId])

  useEffect(() => {
    void refresh()
    const interval = window.setInterval(() => {
      void refresh()
    }, getArenaPollIntervalMs())
    return () => window.clearInterval(interval)
  }, [refresh])

  const leaderId = useMemo(
    () => getGlobalLeaderId(suggestions),
    [suggestions]
  )

  const displayed = useMemo(() => {
    const filtered = filterSuggestions(suggestions, filter)
    return sortSuggestionsByVotes(filtered)
  }, [suggestions, filter])

  const addSuggestion = useCallback(
    async (
      text: string,
      categorySlug: CategorySlug,
      videoUrl?: string | null
    ) => {
      const trimmed = text.trim()
      if (!trimmed) return false

      setIsSubmitting(true)
      setError(null)
      try {
        const created = await submitArenaSuggestion(
          trimmed,
          categorySlug,
          videoUrl
        )
        setSuggestions((prev) => sortSuggestionsByVotes([...prev, created]))
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit idea.")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  const upvote = useCallback(
    async (id: string) => {
      if (votedIds.has(id) || votingId) return false

      setVotingId(id)
      setError(null)

      const previous = suggestions
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s))
      )
      const newVoted = new Set(votedIds)
      newVoted.add(id)
      setVotedIds(newVoted)

      try {
        const { votes } = await voteArenaSuggestion(id, voterId)
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, votes } : s))
        )
        return true
      } catch (e) {
        setSuggestions(previous)
        setVotedIds(votedIds)
        setError(e instanceof Error ? e.message : "Failed to vote.")
        return false
      } finally {
        setVotingId(null)
      }
    },
    [suggestions, votedIds, voterId, votingId]
  )

  return {
    ready,
    error,
    filter,
    setFilter,
    displayed,
    leaderId,
    votedIds,
    isSubmitting,
    votingId,
    addSuggestion,
    upvote,
    refresh,
  }
}
