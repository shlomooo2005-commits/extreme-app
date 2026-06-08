"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, LogOut, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { CategoryFeedClip } from "@/lib/category-feed"
import type { UserProfileRow } from "@/lib/supabase-profiles"
import { supabase } from "@/lib/supabaseClient"
import { useSupabaseFeedVotes } from "@/hooks/use-supabase-feed-votes"
import { HobbyXLogo } from "@/components/hobbyx-logo"
import { VerticalFeedSlide } from "@/components/dashboard/vertical-feed-slide"
import { DashboardUploadModal } from "@/components/dashboard/dashboard-upload-modal"
import { getActiveCompetitions } from "@/lib/competitions"

interface VerticalFeedProps {
  user: User
  profile: UserProfileRow | null
}

export function VerticalFeed({ user, profile }: VerticalFeedProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const impressedRef = useRef<Set<string>>(new Set())
  const [clips, setClips] = useState<CategoryFeedClip[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [voteMessage, setVoteMessage] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const clipIds = useMemo(() => clips.map((clip) => clip.id), [clips])
  const uploadableCompetitions = useMemo(
    () =>
      getActiveCompetitions().filter(
        (competition) => competition.submissionType === "VERIFIED_UPLOAD",
      ),
    [],
  )

  const {
    ready: votesReady,
    error: votesError,
    canVote,
    getVoteCount,
    isVoted,
    toggleVote,
    pendingClipId,
  } = useSupabaseFeedVotes({
    userId: user.id,
    clipIds,
  })

  useEffect(() => {
    let cancelled = false

    const loadFeed = async () => {
      setLoading(true)
      setLoadError(null)

      try {
        const interests = (profile?.preferred_sport_interests ?? []).join(",")
        const params = interests ? `?interests=${encodeURIComponent(interests)}` : ""
        const res = await fetch(`/api/dashboard/feed${params}`)
        const data = (await res.json()) as {
          clips?: CategoryFeedClip[]
          error?: string
        }

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load feed.")
        }

        if (!cancelled) {
          setClips(data.clips ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load feed.")
          setClips([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadFeed()
    return () => {
      cancelled = true
    }
  }, [profile?.preferred_sport_interests?.join(",")])

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const slideHeight = el.clientHeight || 1
    const index = Math.round(el.scrollTop / slideHeight)
    setActiveIndex(Math.min(Math.max(index, 0), Math.max(clips.length - 1, 0)))
  }, [clips.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateActiveIndex, { passive: true })
    return () => el.removeEventListener("scroll", updateActiveIndex)
  }, [updateActiveIndex])

  useEffect(() => {
    const clip = clips[activeIndex]
    if (!clip || impressedRef.current.has(clip.id)) return
    impressedRef.current.add(clip.id)
    void fetch("/api/submissions/feed/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clipIds: [clip.id] }),
    }).catch(() => {})
  }, [activeIndex, clips])

  const handleVote = async (clip: CategoryFeedClip) => {
    setVoteMessage(null)
    const result = await toggleVote(clip.id)
    if (!result.ok) {
      setVoteMessage(result.reason)
      window.alert(result.reason)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  if (loading || !votesReady) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (clips.length === 0) {
    return (
      <div className="relative flex h-[100dvh] flex-col items-center justify-center gap-5 bg-black px-6 text-center">
        <HobbyXLogo href="/" size="lg" showWordmark />
        <p className="max-w-sm text-white/75">
          {loadError ?? "No competition videos yet. Upload your first entry to start the feed."}
        </p>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
        >
          <Upload className="h-4 w-4" />
          Upload video
        </button>
        <Link href="/" className="text-sm font-semibold text-white/60 hover:text-white">
          Back to home
        </Link>
        <DashboardUploadModal
          open={uploadOpen}
          competitions={uploadableCompetitions}
          user={user}
          onClose={() => setUploadOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="relative h-[100dvh] w-full bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-4">
        <Link
          href="/"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="pointer-events-auto rounded-full bg-black/50 px-4 py-2 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/90">
            For you
          </p>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground backdrop-blur-md"
            aria-label="Upload video"
          >
            <Upload className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {(votesError || loadError) && (
        <div className="absolute inset-x-4 top-16 z-20 rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-center text-xs text-amber-100">
          {votesError ?? loadError}
        </div>
      )}

      <div
        ref={scrollRef}
        className="category-feed-scroll h-[100dvh] w-full overflow-y-scroll overscroll-y-contain"
      >
        {clips.map((clip, index) => (
          <VerticalFeedSlide
            key={clip.id}
            clip={clip}
            isActive={index === activeIndex}
            voteCount={getVoteCount(clip.id, clip.likeCount ?? clip.seedLikeCount)}
            voted={isVoted(clip.id)}
            canVote={canVote}
            isVoting={pendingClipId === clip.id}
            voteMessage={index === activeIndex ? voteMessage : null}
            onVote={() => void handleVote(clip)}
          />
        ))}
      </div>

      <DashboardUploadModal
        open={uploadOpen}
        competitions={uploadableCompetitions}
        user={user}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  )
}
