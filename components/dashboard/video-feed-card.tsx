"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Loader2, Play } from "lucide-react"
import type { DashboardVideoEntry } from "@/lib/dashboard-feed"
import { getCategoryBySlug } from "@/lib/competitions"

interface VideoFeedCardProps {
  video: DashboardVideoEntry
  voteCount: number
  voted: boolean
  canVote: boolean
  isVoting: boolean
  onToggleVote: () => void
  onSignInRequired?: () => void
  compact?: boolean
}

export function VideoFeedCard({
  video,
  voteCount,
  voted,
  canVote,
  isVoting,
  onToggleVote,
  onSignInRequired,
  compact = false,
}: VideoFeedCardProps) {
  const category = getCategoryBySlug(video.categorySlug)
  const accent = category?.accentColor ?? "#ff6b00"

  const handleVote = () => {
    if (!canVote) {
      onSignInRequired?.()
      return
    }
    onToggleVote()
  }

  return (
    <article
      className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:shadow-xl ${
        compact ? "w-[240px] sm:w-[280px]" : "w-full"
      }`}
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black sm:aspect-video">
        <Image
          src={video.posterUrl}
          alt={`${video.athleteName} — ${video.competitionTitle}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes={compact ? "280px" : "(max-width: 640px) 100vw, 33vw"}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        <span
          className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black"
          style={{ backgroundColor: accent }}
        >
          {category?.shortName ?? video.categorySlug}
        </span>

        <Link
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75"
          aria-label={`Play ${video.athleteName}'s video`}
        >
          <Play className="h-4 w-4 fill-current" />
        </Link>

        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleVote}
            disabled={isVoting}
            className="flex flex-col items-center gap-1 transition-transform active:scale-90 disabled:opacity-70"
            aria-pressed={voted}
            aria-label={voted ? "Remove like" : "Like this video"}
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-md"
              style={{
                borderColor: voted ? accent : "rgba(255,255,255,0.5)",
                backgroundColor: voted
                  ? `color-mix(in srgb, ${accent} 45%, rgba(0,0,0,0.55))`
                  : "rgba(0,0,0,0.55)",
                color: voted ? accent : "white",
                boxShadow: voted
                  ? `0 0 20px color-mix(in srgb, ${accent} 50%, transparent)`
                  : undefined,
              }}
            >
              {isVoting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Heart className={`h-6 w-6 ${voted ? "fill-current" : ""}`} />
              )}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
              {voted ? "Liked" : "Like"}
            </span>
            <span className="text-xs font-black tabular-nums text-white">
              {voteCount.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          {video.competitionTitle}
        </p>
        <h3 className="hobbyx-label-title line-clamp-1 text-sm sm:text-base">
          {video.athleteName}
        </h3>
        <p className="text-xs text-muted-foreground">
          {video.durationSeconds}s clip
        </p>
      </div>
    </article>
  )
}
