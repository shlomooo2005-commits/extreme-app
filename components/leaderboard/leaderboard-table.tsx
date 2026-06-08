import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Play, TrendingDown, TrendingUp, Minus } from "lucide-react"
import type { CompetitionJudgedBy } from "@/lib/competitions"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { countryCodeToFlag } from "@/lib/leaderboard"
import { SubmissionSourceBadge } from "@/components/submission-source-badge"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  accentColor: string
  glowRgb?: string
  judgedBy?: CompetitionJudgedBy
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-amber-300 to-amber-600 text-sm font-black text-black shadow-[0_0_16px_rgba(251,191,36,0.5)] sm:h-9 sm:w-9">
        {rank}
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-zinc-300 to-zinc-500 text-sm font-black text-black sm:h-9 sm:w-9">
        {rank}
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-orange-400 to-orange-700 text-sm font-black text-black sm:h-9 sm:w-9">
        {rank}
      </span>
    )
  }
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-white/10 font-mono text-sm font-bold text-muted-foreground sm:h-9 sm:w-9">
      {rank}
    </span>
  )
}

function TrendCell({ entry }: { entry: LeaderboardEntry }) {
  if (entry.trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-400">
        <TrendingUp className="h-4 w-4" />
        <span className="hidden sm:inline">+{entry.rankChange}</span>
      </span>
    )
  }
  if (entry.trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-bold text-red-400">
        <TrendingDown className="h-4 w-4" />
        <span className="hidden sm:inline">-{entry.rankChange}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-muted-foreground">
      <Minus className="h-4 w-4" />
    </span>
  )
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 shrink-0 font-bold text-muted-foreground">{label}</span>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-muted-foreground">
        {value}
      </span>
    </div>
  )
}

function LeaderboardMobileCard({
  entry,
  accentColor,
  judgedBy,
}: {
  entry: LeaderboardEntry
  accentColor: string
  judgedBy: CompetitionJudgedBy
}) {
  const primaryMetric =
    judgedBy === "likes"
      ? (entry.likeCount ?? 0).toLocaleString()
      : entry.aiScore.toFixed(1)
  const primaryLabel = judgedBy === "likes" ? "Likes" : "AI score"
  return (
    <article className="min-w-0 rounded-lg border border-border bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <RankCell rank={entry.rank} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className="shrink-0 text-xl leading-none"
              role="img"
              aria-label={entry.countryName}
            >
              {countryCodeToFlag(entry.countryCode)}
            </span>
            <p className="min-w-0 break-words text-sm font-bold uppercase leading-snug tracking-wide text-foreground">
              {entry.athleteName}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{entry.countryName}</p>
          {entry.source && (
            <div className="mt-2">
              <SubmissionSourceBadge source={entry.source} compact />
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            {primaryLabel}
          </p>
          <span
            className="font-mono text-xl font-black tabular-nums sm:text-2xl"
            style={{ color: accentColor }}
          >
            {primaryMetric}
          </span>
          <div className="mt-1 flex justify-end">
            <TrendCell entry={entry} />
          </div>
        </div>
      </div>

      <Link
        href={entry.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mt-4 block aspect-video h-48 w-full overflow-hidden rounded-md border border-border sm:h-52 md:h-56"
      >
        <Image
          src={entry.videoThumbnailUrl}
          alt=""
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 400px"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Play className="h-8 w-8 fill-white text-foreground opacity-90" />
        </span>
      </Link>

      <Link
        href={entry.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:underline"
        style={{ color: accentColor }}
      >
        Watch
        <ExternalLink className="h-3 w-3" />
      </Link>
    </article>
  )
}

export function LeaderboardTable({
  entries,
  accentColor,
  judgedBy = "likes",
}: LeaderboardTableProps) {
  const scoreHeader = judgedBy === "likes" ? "Likes" : "AI score"

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur-sm">
      {/* Mobile: stacked cards */}
      <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-4 md:hidden">
        {entries.map((entry) => (
          <LeaderboardMobileCard
            key={entry.participantId}
            entry={entry}
            accentColor={accentColor}
            judgedBy={judgedBy}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <th className="px-4 py-4 md:px-6">Rank</th>
              <th className="px-4 py-4 md:px-6">Athlete</th>
              <th className="px-4 py-4 md:px-6">{scoreHeader}</th>
              <th className="hidden px-4 py-4 lg:table-cell md:px-6">
                Breakdown
              </th>
              <th className="px-4 py-4 md:px-6">Preview</th>
              <th className="px-4 py-4 md:px-6">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.participantId}
                className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/5"
              >
                <td className="px-4 py-4 md:px-6">
                  <RankCell rank={entry.rank} />
                </td>
                <td className="px-4 py-4 md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="shrink-0 text-2xl"
                      title={entry.countryName}
                      role="img"
                      aria-label={entry.countryName}
                    >
                      {countryCodeToFlag(entry.countryCode)}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words font-bold uppercase tracking-wide text-foreground">
                        {entry.athleteName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {entry.countryName}
                      </p>
                      {entry.source && (
                        <div className="mt-1.5">
                          <SubmissionSourceBadge
                            source={entry.source}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 md:px-6">
                  <span
                    className="font-mono text-2xl font-black tabular-nums"
                    style={{ color: accentColor }}
                  >
                    {judgedBy === "likes"
                      ? (entry.likeCount ?? 0).toLocaleString()
                      : entry.aiScore.toFixed(1)}
                  </span>
                </td>
                <td className="hidden px-4 py-4 lg:table-cell md:px-6">
                  <div className="w-44 space-y-1.5">
                    <ScoreBar label="SKL" value={entry.scoreBreakdown.skill} color={accentColor} />
                    <ScoreBar label="STL" value={entry.scoreBreakdown.style} color={accentColor} />
                    <ScoreBar label="DIF" value={entry.scoreBreakdown.difficulty} color={accentColor} />
                    <ScoreBar label="AUT" value={entry.scoreBreakdown.authenticity} color={accentColor} />
                  </div>
                </td>
                <td className="px-4 py-4 md:px-6">
                  <Link
                    href={entry.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-video h-14 w-24 overflow-hidden rounded-sm border border-border md:h-16 md:w-28"
                  >
                    <Image
                      src={entry.videoThumbnailUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="112px"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Play className="h-5 w-5 fill-white text-foreground opacity-90 group-hover:opacity-100" />
                    </span>
                  </Link>
                  <Link
                    href={entry.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:underline"
                    style={{ color: accentColor }}
                  >
                    Watch
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
                <td className="px-4 py-4 md:px-6">
                  <TrendCell entry={entry} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
