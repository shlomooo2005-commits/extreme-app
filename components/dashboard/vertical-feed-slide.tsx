"use client"

import { useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import type { CategoryFeedClip } from "@/lib/category-feed"
import { CATEGORY_FEED_MAX_SECONDS } from "@/lib/category-feed"
import { getCategoryBySlug, getCompetitionById } from "@/lib/competitions"
import { countryCodeToFlag } from "@/lib/leaderboard"
import { SubmissionSourceBadge } from "@/components/submission-source-badge"

interface VerticalFeedSlideProps {
  clip: CategoryFeedClip
  isActive: boolean
  voteCount: number
  voted: boolean
  canVote: boolean
  isVoting: boolean
  voteMessage: string | null
  onVote: () => void
}

export function VerticalFeedSlide({
  clip,
  isActive,
  voteCount,
  voted,
  canVote,
  isVoting,
  voteMessage,
  onVote,
}: VerticalFeedSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const competition = getCompetitionById(clip.competitionId)
  const categoryMeta = competition
    ? getCategoryBySlug(competition.categorySlug)
    : undefined
  const accentColor = categoryMeta?.accentColor ?? "#ff6b00"
  const aiJudged = clip.judgedBy === "AI"

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isActive) {
      video.currentTime = 0
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isActive])

  return (
    <section
      className="category-feed-slide relative flex h-[100dvh] w-full shrink-0 snap-start snap-always items-center justify-center bg-black"
      aria-label={`${clip.athleteName} — ${clip.competitionTitle}`}
    >
      <video
        ref={videoRef}
        src={clip.videoUrl}
        poster={clip.posterUrl}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        loop
        preload={isActive ? "auto" : "metadata"}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85" />

      <div className="absolute left-4 top-20 z-10 flex flex-col gap-2 sm:top-24">
        <SubmissionSourceBadge source={clip.source} compact />
        <span className="rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80">
          {clip.durationSeconds}s / {CATEGORY_FEED_MAX_SECONDS}s max
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-10 pr-24 sm:pr-28">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
          {categoryMeta?.shortName ?? "Competition"}
        </p>
        <p className="mb-2 line-clamp-2 text-sm font-bold text-white/90">
          {clip.competitionTitle}
        </p>
        <p className="flex items-center gap-2 text-xl font-black text-white">
          <span aria-hidden>{countryCodeToFlag(clip.countryCode)}</span>
          {clip.athleteName}
        </p>
        <span
          className="mt-3 inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
          style={{
            backgroundColor: aiJudged ? "rgba(139,92,246,0.25)" : "rgba(34,197,94,0.2)",
            color: aiJudged ? "#c4b5fd" : "#86efac",
            border: `1px solid ${aiJudged ? "rgba(139,92,246,0.5)" : "rgba(34,197,94,0.45)"}`,
          }}
        >
          {aiJudged ? "AI judged" : "Votes decide the winner"}
        </span>
      </div>

      <div className="absolute bottom-28 right-3 z-20 flex flex-col items-center gap-2 sm:right-5">
        <button
          type="button"
          onClick={onVote}
          disabled={(!canVote && !voted) || isVoting}
          className="group flex flex-col items-center gap-2 transition-transform active:scale-90 disabled:opacity-60"
          aria-pressed={voted}
          aria-label={voted ? "Remove vote" : "Vote for this entry"}
        >
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] shadow-[0_0_24px_rgba(255,107,0,0.35)] backdrop-blur-md transition-all group-hover:scale-105"
            style={{
              borderColor: voted ? accentColor : "rgba(255,255,255,0.45)",
              backgroundColor: voted
                ? `color-mix(in srgb, ${accentColor} 40%, rgba(0,0,0,0.55))`
                : "rgba(0,0,0,0.5)",
              color: voted ? accentColor : "white",
              boxShadow: voted
                ? `0 0 28px color-mix(in srgb, ${accentColor} 55%, transparent)`
                : "0 0 24px rgba(255,107,0,0.35)",
            }}
          >
            <Heart className={`h-8 w-8 ${voted ? "fill-current" : ""}`} />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
            {voted ? "Voted" : "Vote"}
          </span>
          <span className="text-sm font-black tabular-nums text-white">
            {voteCount.toLocaleString()}
          </span>
        </button>
        {voteMessage && (
          <p className="max-w-[130px] text-center text-[10px] leading-snug text-amber-200">
            {voteMessage}
          </p>
        )}
      </div>
    </section>
  )
}
