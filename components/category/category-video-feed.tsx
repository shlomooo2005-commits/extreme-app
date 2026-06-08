"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Heart, Info, Trophy, Upload } from "lucide-react"
import type { Category } from "@/lib/competitions"
import { CATEGORY_FEED_MAX_SECONDS, type CategoryFeedClip } from "@/lib/category-feed"
import { getCategoryCardImage } from "@/lib/category-images"
import { countryCodeToFlag } from "@/lib/leaderboard"
import { useFeedLikes } from "@/hooks/use-feed-likes"
import { SubmissionSourceBadge } from "@/components/submission-source-badge"

interface CategoryVideoFeedProps {
  category: Category
  clips: CategoryFeedClip[]
  likedClipIds?: string[]
  accentColor: string
  loading?: boolean
  onOpenCompetitions: () => void
}

function FeedSlide({
  clip,
  accentColor,
  isActive,
  likeCount,
  liked,
  canVote,
  onToggleLike,
  voteMessage,
}: {
  clip: CategoryFeedClip
  accentColor: string
  isActive: boolean
  likeCount: number
  liked: boolean
  canVote: boolean
  onToggleLike: () => void
  voteMessage: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <SubmissionSourceBadge source={clip.source} compact />
        <span className="rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white/80">
          {clip.durationSeconds}s / {CATEGORY_FEED_MAX_SECONDS}s max
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-8 pr-20">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          {clip.competitionTitle}
        </p>
        <p className="flex items-center gap-2 text-lg font-black text-white">
          <span aria-hidden>{countryCodeToFlag(clip.countryCode)}</span>
          {clip.athleteName}
        </p>
        <span
          className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
          style={{
            backgroundColor: aiJudged ? "rgba(139,92,246,0.25)" : "rgba(34,197,94,0.2)",
            color: aiJudged ? "#c4b5fd" : "#86efac",
            border: `1px solid ${aiJudged ? "rgba(139,92,246,0.5)" : "rgba(34,197,94,0.45)"}`,
          }}
        >
          {aiJudged ? "AI winner · likes for fun" : "Likes decide the winner"}
        </span>
      </div>

      <div className="absolute bottom-24 right-4 z-20 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onToggleLike}
          disabled={!canVote && !liked}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90 disabled:opacity-60"
          aria-pressed={liked}
          aria-label={liked ? "Unlike clip" : "Like clip"}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 backdrop-blur-md transition-colors"
            style={{
              borderColor: liked ? accentColor : "rgba(255,255,255,0.35)",
              backgroundColor: liked
                ? `color-mix(in srgb, ${accentColor} 35%, transparent)`
                : "rgba(0,0,0,0.45)",
              color: liked ? accentColor : "white",
            }}
          >
            <Heart className={`h-7 w-7 ${liked ? "fill-current" : ""}`} />
          </span>
          <span className="text-xs font-black tabular-nums text-white">
            {likeCount.toLocaleString()}
          </span>
        </button>
        {voteMessage && (
          <p className="max-w-[120px] text-center text-[10px] leading-snug text-amber-200">
            {voteMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export function CategoryVideoFeed({
  category,
  clips,
  likedClipIds = [],
  accentColor,
  loading = false,
  onOpenCompetitions,
}: CategoryVideoFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const impressedRef = useRef<Set<string>>(new Set())
  const [activeIndex, setActiveIndex] = useState(0)
  const [voteMessage, setVoteMessage] = useState<string | null>(null)
  const { ready, canVote, getDisplayLikeCount, isLiked, toggleLike, syncClipCounts } =
    useFeedLikes(likedClipIds)
  const brandImage = getCategoryCardImage(category.slug)

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const slideHeight = el.clientHeight || 1
    const index = Math.round(el.scrollTop / slideHeight)
    setActiveIndex(Math.min(Math.max(index, 0), clips.length - 1))
  }, [clips.length])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateActiveIndex, { passive: true })
    return () => el.removeEventListener("scroll", updateActiveIndex)
  }, [updateActiveIndex])

  useEffect(() => {
    syncClipCounts(clips)
  }, [clips, syncClipCounts])

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

  const handleToggleLike = (clip: CategoryFeedClip) => {
    setVoteMessage(null)
    const result = toggleLike(clip.id)
    if (!result.ok) {
      setVoteMessage(result.reason)
      return
    }
  }

  if (!ready || loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (clips.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-white/70">No feed clips yet for {category.name}.</p>
        <button
          type="button"
          onClick={onOpenCompetitions}
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: accentColor }}
        >
          View competitions
        </button>
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
        <div className="flex max-w-[52%] items-center justify-center gap-2">
          {brandImage && (
            <span
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2"
              style={{
                borderColor: accentColor,
                boxShadow: `0 0 20px ${accentColor}99`,
              }}
            >
              <Image
                src={brandImage}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
                priority
              />
            </span>
          )}
          <p className="truncate text-center text-xs font-black uppercase tracking-[0.2em] text-white/90">
            {category.shortName}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenCompetitions}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
            aria-label="Competition details"
          >
            <Info className="h-5 w-5" />
          </button>
          <Link
            href="/leaderboard"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
            aria-label="Leaderboard"
          >
            <Trophy className="h-5 w-5" />
          </Link>
          <Link
            href={`/submit?category=${category.slug}`}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full text-black backdrop-blur-md"
            style={{ backgroundColor: accentColor }}
            aria-label="Enter competition"
          >
            <Upload className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="category-feed-scroll h-[100dvh] w-full overflow-y-scroll overscroll-y-contain"
      >
        {clips.map((clip, index) => (
          <FeedSlide
            key={clip.id}
            clip={clip}
            accentColor={accentColor}
            isActive={index === activeIndex}
            likeCount={getDisplayLikeCount(
              clip.id,
              clip.likeCount ?? clip.seedLikeCount
            )}
            liked={isLiked(clip.id)}
            canVote={canVote}
            onToggleLike={() => handleToggleLike(clip)}
            voteMessage={index === activeIndex ? voteMessage : null}
          />
        ))}
      </div>
    </div>
  )
}
