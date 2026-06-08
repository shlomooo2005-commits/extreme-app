"use client"

import { Sparkles } from "lucide-react"
import type { DashboardVideoEntry } from "@/lib/dashboard-feed"
import { getInterestLabels } from "@/lib/sport-interests"
import { VideoFeedCard } from "@/components/dashboard/video-feed-card"

interface ForYouSectionProps {
  videos: DashboardVideoEntry[]
  preferredInterests: string[]
  getVoteCount: (clipId: string) => number
  isVoted: (clipId: string) => boolean
  canVote: boolean
  pendingClipId: string | null
  onToggleVote: (clipId: string) => void
  onSignInRequired: () => void
}

export function ForYouSection({
  videos,
  preferredInterests,
  getVoteCount,
  isVoted,
  canVote,
  pendingClipId,
  onToggleVote,
  onSignInRequired,
}: ForYouSectionProps) {
  const interestLabels = getInterestLabels(preferredInterests)

  if (videos.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/70 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="hobbyx-label-title text-lg">For you</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Set sport interests on your profile to see personalized videos here, or browse
              all categories below.
            </p>
            <a
              href="/profile#sport-interests"
              className="mt-3 inline-block text-sm font-semibold text-[#0284c7] hover:underline"
            >
              Set your sport interests
            </a>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-5 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="hobbyx-label-sub flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
            <Sparkles className="h-4 w-4" aria-hidden />
            Personalized
          </p>
          <h2 className="hobbyx-label-title mt-2 text-xl sm:text-2xl">For you</h2>
          {interestLabels.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Based on your interests: {interestLabels.join(", ")}
            </p>
          )}
        </div>
        <p className="text-sm font-semibold text-[#0284c7]">
          {videos.length} video{videos.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="-mx-3 flex gap-4 overflow-x-auto px-3 pb-2 snap-x snap-mandatory [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
        {videos.map((video) => (
          <VideoFeedCard
            key={video.clipId}
            video={video}
            compact
            voteCount={getVoteCount(video.clipId)}
            voted={isVoted(video.clipId)}
            canVote={canVote}
            isVoting={pendingClipId === video.clipId}
            onToggleVote={() => onToggleVote(video.clipId)}
            onSignInRequired={onSignInRequired}
          />
        ))}
      </div>
    </section>
  )
}
