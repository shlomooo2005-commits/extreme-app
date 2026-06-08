import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, Trophy, Users, Video } from "lucide-react"
import type { Competition } from "@/lib/competitions"
import { getCategoryBySlug } from "@/lib/competitions"
import { getJudgingLabel } from "@/lib/competition-judging"
import { getCategoryCardImage } from "@/lib/category-images"
import { getSubmissionRules } from "@/lib/submission-rules"

interface CompetitionCardProps {
  competition: Competition
  neonAccent: string
  accentSecondary: string
  glowRgb: string
  heroImageSrc?: string
}

function formatDateRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
}

function formatPrize(competition: Competition) {
  if (competition.prizeDisplay) return competition.prizeDisplay
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(competition.prizePoolUsd)
}

export function CompetitionCard({
  competition,
  neonAccent,
  accentSecondary,
  glowRgb,
  heroImageSrc,
}: CompetitionCardProps) {
  const submitHref = `/submit?category=${competition.categorySlug}&competition=${competition.id}`
  const rules = getSubmissionRules(competition)
  const category = getCategoryBySlug(competition.categorySlug)
  const thumbnail = heroImageSrc ?? getCategoryCardImage(competition.categorySlug)

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300 hover:border-border active:scale-[0.99]"
      style={{
        boxShadow: `inset 4px 0 0 0 ${neonAccent}, 0 8px 32px rgba(15,23,42,0.08), 0 0 0 1px rgba(${glowRgb}, 0.12)`,
      }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-secondary">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${neonAccent}22 0%, ${neonAccent}44 100%)`,
            }}
          >
            <Video className="h-12 w-12 text-foreground/40" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <span
          className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black"
          style={{ backgroundColor: neonAccent }}
        >
          {category?.shortName ?? competition.categorySlug}
        </span>
      </div>

      <div
        className="pointer-events-none absolute -right-10 top-24 h-36 w-36 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-45"
        style={{ backgroundColor: neonAccent }}
      />

      <div className="relative min-w-0 p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <span
                className="inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-black"
                style={{ backgroundColor: neonAccent }}
              >
                {competition.difficulty}
              </span>
              {competition.countdownBadge && (
                <span
                  className="inline-flex items-center gap-1 rounded-md border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-black text-amber-200"
                  dir="rtl"
                >
                  <Clock className="h-3 w-3 shrink-0" aria-hidden />
                  {competition.countdownBadge}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                  competition.judgedBy === "AI"
                    ? "border-violet-400/40 bg-violet-500/10 text-violet-200"
                    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {getJudgingLabel(competition.judgedBy)}
              </span>
              {rules.isLiveCamera && (
                <span className="inline-flex items-center gap-1 rounded-md border border-red-400/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-300">
                  <Video className="h-3 w-3 shrink-0" />
                  In-app camera
                </span>
              )}
            </div>
            <h2 className="hobbyx-label-title break-words text-base leading-snug tracking-tight sm:text-lg md:text-xl">
              {competition.title}
            </h2>
          </div>
          <span
            className="shrink-0 rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-widest animate-pulse-glow"
            style={{
              borderColor: `rgba(${glowRgb}, 0.4)`,
              backgroundColor: `rgba(${glowRgb}, 0.12)`,
              color: neonAccent,
              boxShadow: `0 0 16px rgba(${glowRgb}, 0.35)`,
            }}
          >
            Live
          </span>
        </div>

        <p className="mb-5 flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground/70 sm:mb-6 md:text-base">
          {competition.description}
        </p>

        <ul className="mb-5 space-y-2 text-xs text-muted-foreground sm:mb-6 sm:text-sm">
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" style={{ color: neonAccent }} />
            {formatDateRange(competition.startDate, competition.endDate)}
          </li>
          <li className="flex items-center gap-2">
            <Trophy className="h-4 w-4 shrink-0" style={{ color: neonAccent }} />
            <span className="font-mono text-lg font-bold text-foreground">
              {formatPrize(competition)}
            </span>
            <span className="text-muted-foreground">prize</span>
          </li>
          <li className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" style={{ color: neonAccent }} />
            {competition.entrantCount.toLocaleString()} entrants
          </li>
        </ul>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href={`/leaderboard?competition=${competition.id}`}
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border bg-secondary px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-muted"
          >
            Rankings
          </Link>
          <Link
            href={submitHref}
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${neonAccent}, ${accentSecondary})`,
              boxShadow: `0 0 28px rgba(${glowRgb}, 0.45)`,
            }}
          >
            Enter
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
