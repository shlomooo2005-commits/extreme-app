"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Trophy, Video } from "lucide-react"
import type { Competition } from "@/lib/competitions"
import { getCategoryBySlug } from "@/lib/competitions"
import { getCategoryCardImage } from "@/lib/category-images"

interface CompetitionFeedCardProps {
  competition: Competition
  compact?: boolean
}

function formatPrize(competition: Competition) {
  if (competition.prizeDisplay) return competition.prizeDisplay
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(competition.prizePoolUsd)
}

function formatDateRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  })
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
}

export function CompetitionFeedCard({
  competition,
  compact = false,
}: CompetitionFeedCardProps) {
  const category = getCategoryBySlug(competition.categorySlug)
  const thumbnail = getCategoryCardImage(competition.categorySlug)
  const accent = category?.accentColor ?? "#ff6b00"
  const submitHref = `/submit?category=${competition.categorySlug}&competition=${competition.id}`

  return (
    <article
      className={`flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:shadow-xl ${
        compact ? "w-[240px] sm:w-[260px]" : "w-full"
      }`}
      style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes={compact ? "260px" : "(max-width: 640px) 100vw, 33vw"}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}22 0%, ${accent}44 100%)`,
            }}
          >
            <Video className="h-10 w-10 text-foreground/40" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black"
          style={{ backgroundColor: accent }}
        >
          {category?.shortName ?? competition.categorySlug}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="hobbyx-label-title line-clamp-2 text-sm leading-snug sm:text-base">
          {competition.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            {formatPrize(competition)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatDateRange(competition.startDate, competition.endDate)}
          </span>
        </div>

        {competition.countdownBadge && (
          <p className="text-xs font-semibold text-[#0284c7]">
            {competition.countdownBadge}
          </p>
        )}

        <Link
          href={submitHref}
          className="mt-auto inline-flex items-center justify-center rounded-lg border border-border bg-secondary/80 px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
        >
          Enter competition
        </Link>
      </div>
    </article>
  )
}
