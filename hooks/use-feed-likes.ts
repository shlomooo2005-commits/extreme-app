"use client"

import { useCallback, useEffect, useState } from "react"
import type { CategoryFeedClip } from "@/lib/category-feed"
import {
  loadFeedLikes,
  saveFeedLikes,
  type FeedLikesState,
} from "@/lib/feed-likes-store"
import { hasCompletePersonalDetails, loadUserAccount } from "@/lib/user-account"

export function useFeedLikes(serverLikedIds: string[] = []) {
  const [likes, setLikes] = useState<FeedLikesState>({})
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const local = loadFeedLikes()
    const merged: FeedLikesState = { ...local }
    for (const id of serverLikedIds) {
      merged[id] = true
    }
    setLikes(merged)
    setReady(true)
  }, [serverLikedIds.join("|")])

  const syncClipCounts = useCallback((clips: CategoryFeedClip[]) => {
    setCounts((prev) => {
      const next = { ...prev }
      for (const clip of clips) {
        if (clip.likeCount != null) {
          next[clip.id] = clip.likeCount
        }
      }
      return next
    })
  }, [])

  const canVote = hasCompletePersonalDetails(loadUserAccount())

  const getDisplayLikeCount = useCallback(
    (clipId: string, seedLikes: number) => counts[clipId] ?? seedLikes,
    [counts]
  )

  const isLiked = useCallback(
    (clipId: string) => likes[clipId] === true,
    [likes]
  )

  const toggleLike = useCallback(
    (
      clipId: string
    ): { ok: true } | { ok: false; reason: string } => {
      const account = loadUserAccount()
      if (!canVote || !account) {
        return {
          ok: false,
          reason:
            "Verify your name and phone in your profile before you can like entries.",
        }
      }

      const wasLiked = likes[clipId] === true
      const optimisticLiked = !wasLiked
      const nextLikes: FeedLikesState = { ...likes }
      if (optimisticLiked) {
        nextLikes[clipId] = true
      } else {
        delete nextLikes[clipId]
      }
      setLikes(nextLikes)
      saveFeedLikes(nextLikes)

      setCounts((prev) => {
        const current = prev[clipId] ?? 0
        return {
          ...prev,
          [clipId]: Math.max(0, current + (optimisticLiked ? 1 : -1)),
        }
      })

      void fetch("/api/submissions/feed/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId,
          voterId: account.id,
          voterPhone: account.phone,
        }),
      })
        .then(async (res) => {
          const data = (await res.json()) as {
            liked?: boolean
            likesCount?: number
            error?: string
          }
          if (!res.ok) {
            setLikes(likes)
            saveFeedLikes(likes)
            return
          }
          if (typeof data.likesCount === "number") {
            setCounts((prev) => ({ ...prev, [clipId]: data.likesCount! }))
          }
          if (typeof data.liked === "boolean") {
            setLikes((prev) => {
              const synced = { ...prev }
              if (data.liked) synced[clipId] = true
              else delete synced[clipId]
              saveFeedLikes(synced)
              return synced
            })
          }
        })
        .catch(() => {
          setLikes(likes)
          saveFeedLikes(likes)
        })

      return { ok: true }
    },
    [canVote, likes]
  )

  return {
    ready,
    canVote,
    getDisplayLikeCount,
    isLiked,
    toggleLike,
    syncClipCounts,
  }
}
