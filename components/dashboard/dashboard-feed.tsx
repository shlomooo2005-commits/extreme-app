"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { DashboardVideoFeed } from "@/lib/dashboard-feed"
import type { UserProfileRow } from "@/lib/supabase-profiles"
import { useSupabaseFeedVotes } from "@/hooks/use-supabase-feed-votes"
import { ForYouSection } from "@/components/dashboard/for-you-section"
import { VideoCategoryRow } from "@/components/dashboard/video-category-row"

interface DashboardFeedProps {
  user: User | null
  profile: UserProfileRow | null
  profileLoading: boolean
  profileError: string | null
  refreshKey?: number
}

function FeedSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-48 animate-pulse rounded-2xl bg-card/80" />
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-card/80" />
        <div className="flex gap-4 overflow-hidden">
          <div className="h-72 w-[240px] shrink-0 animate-pulse rounded-2xl bg-card/80" />
          <div className="h-72 w-[240px] shrink-0 animate-pulse rounded-2xl bg-card/80" />
          <div className="h-72 w-[240px] shrink-0 animate-pulse rounded-2xl bg-card/80" />
        </div>
      </div>
    </div>
  )
}

export function DashboardFeed({
  user,
  profile,
  profileLoading,
  profileError,
  refreshKey = 0,
}: DashboardFeedProps) {
  const router = useRouter()
  const [feed, setFeed] = useState<DashboardVideoFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [voteMessage, setVoteMessage] = useState<string | null>(null)

  const allClipIds = useMemo(() => {
    if (!feed) return []
    return [
      ...feed.forYou.map((video) => video.clipId),
      ...feed.sections.flatMap((section) =>
        section.videos.map((video) => video.clipId),
      ),
    ]
  }, [feed])

  const {
    ready: votesReady,
    error: votesError,
    canVote,
    getVoteCount,
    isVoted,
    toggleVote,
    pendingClipId,
  } = useSupabaseFeedVotes({
    userId: user?.id ?? null,
    clipIds: allClipIds,
  })

  const loadFeed = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const interests = (profile?.preferred_sport_interests ?? []).join(",")
      const params = interests ? `?interests=${encodeURIComponent(interests)}` : ""
      const res = await fetch(`/api/dashboard/feed${params}`)
      const data = (await res.json()) as DashboardVideoFeed & { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load feed.")
      }

      setFeed(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load feed.")
      setFeed(null)
    } finally {
      setLoading(false)
    }
  }, [profile?.preferred_sport_interests?.join(",")])

  useEffect(() => {
    if (profileLoading) return
    void loadFeed()
  }, [loadFeed, profileLoading, refreshKey])

  const handleToggleVote = async (clipId: string) => {
    setVoteMessage(null)
    const result = await toggleVote(clipId)
    if (!result.ok) {
      setVoteMessage(result.reason)
      window.alert(result.reason)
    }
  }

  const handleSignInRequired = () => {
    const message = "Sign in to like videos."
    setVoteMessage(message)
    window.alert(message)
    router.push("/login")
  }

  if (profileLoading || loading || !votesReady) {
    return <FeedSkeleton />
  }

  const totalVideos = feed?.total ?? 0

  return (
    <div className="space-y-10">
      {(profileError || loadError || votesError || voteMessage) && (
        <div className="space-y-2">
          {profileError && (
            <p
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800"
              role="status"
            >
              Could not sync your profile. ({profileError})
            </p>
          )}
          {loadError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600" role="alert">
              {loadError}
            </p>
          )}
          {votesError && (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800" role="status">
              Votes unavailable: {votesError}
            </p>
          )}
          {voteMessage && !votesError && (
            <p className="rounded-xl border border-border bg-secondary/80 px-4 py-3 text-sm text-foreground" role="status">
              {voteMessage}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
        Public feed · {totalVideos} video{totalVideos === 1 ? "" : "s"} from all athletes
        {!user && (
          <span>
            {" "}
            · <button type="button" onClick={() => router.push("/login")} className="font-semibold text-foreground underline-offset-4 hover:underline">Sign in</button> to like
          </span>
        )}
      </div>

      <ForYouSection
        videos={feed?.forYou ?? []}
        preferredInterests={profile?.preferred_sport_interests ?? []}
        getVoteCount={getVoteCount}
        isVoted={isVoted}
        canVote={canVote}
        pendingClipId={pendingClipId}
        onToggleVote={handleToggleVote}
        onSignInRequired={handleSignInRequired}
      />

      {feed && feed.sections.length > 0 && feed.forYou.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            All categories
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      <div className="space-y-10">
        {!feed || feed.sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No uploaded videos yet. Be the first to enter a competition.
            </p>
          </div>
        ) : (
          feed.sections.map((section) => (
            <VideoCategoryRow
              key={section.interestSlug ?? section.categorySlug}
              section={section}
              getVoteCount={getVoteCount}
              isVoted={isVoted}
              canVote={canVote}
              pendingClipId={pendingClipId}
              onToggleVote={handleToggleVote}
              onSignInRequired={handleSignInRequired}
            />
          ))
        )}
      </div>
    </div>
  )
}
