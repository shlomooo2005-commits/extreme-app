"use client"

import Image from "next/image"
import { Calendar, Trophy, Video } from "lucide-react"
import type { Competition } from "@/lib/competitions"
import { getCategoryBySlug } from "@/lib/competitions"
import { getCategoryCardImage } from "@/lib/category-images"

interface ActiveCompetitionsGridProps {
  competitions: Competition[]
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

export function ActiveCompetitionsGrid({ competitions }: ActiveCompetitionsGridProps) {
  if (competitions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">No active competitions right now. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {competitions.map((competition) => {
        const category = getCategoryBySlug(competition.categorySlug)
        const thumbnail = getCategoryCardImage(competition.categorySlug)
        const accent = category?.accentColor ?? "#ff6b00"

        return (
          <article
            key={competition.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow hover:shadow-xl"
            style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
          >
            <div className="relative aspect-video w-full overflow-hidden bg-secondary">
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${accent}22 0%, ${accent}44 100%)`,
                  }}
                >
                  <Video className="h-12 w-12 text-foreground/40" aria-hidden />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span
                className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black"
                style={{ backgroundColor: accent }}
              >
                {category?.shortName ?? competition.categorySlug}
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
              <h3 className="hobbyx-label-title line-clamp-2 text-base leading-snug">
                {competition.title}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                <p className="text-xs font-semibold text-[#0284c7]">{competition.countdownBadge}</p>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
