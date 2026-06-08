import Image from "next/image"
import Link from "next/link"
import { Play, TrendingDown, TrendingUp, Minus } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { countryCodeToFlag } from "@/lib/leaderboard"

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[]
  accentColor: string
  glowRgb?: string
}

const PODIUM_ORDER = [1, 0, 2] as const
const PODIUM_HEIGHT = ["h-24 sm:h-36", "h-32 sm:h-48", "h-20 sm:h-28"] as const
const PODIUM_LABEL = ["2nd", "1st", "3rd"] as const
const PODIUM_MEDAL = [
  "from-zinc-400/80 to-zinc-600/30",
  "from-amber-300/90 to-amber-600/40",
  "from-orange-500/70 to-orange-800/30",
] as const

function TrendBadge({ entry }: { entry: LeaderboardEntry }) {
  if (entry.trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400">
        <TrendingUp className="h-3 w-3" />+{entry.rankChange}
      </span>
    )
  }
  if (entry.trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-bold text-red-400">
        <TrendingDown className="h-3 w-3" />-{entry.rankChange}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" />
    </span>
  )
}

function PodiumAthleteCard({
  entry,
  slotIndex,
  displayIndex,
  accentColor,
  glowRgb,
}: {
  entry: LeaderboardEntry
  slotIndex: number
  displayIndex: number
  accentColor: string
  glowRgb: string
}) {
  const isFirst = slotIndex === 0

  return (
    <div className="flex w-full min-w-0 max-w-md flex-col items-center sm:max-w-[220px]">
      <div
        className={`relative mb-3 w-full overflow-hidden rounded-md border-2 ${
          isFirst ? "border-amber-400/80" : "border-border"
        }`}
        style={
          isFirst
            ? { boxShadow: `0 0 40px rgba(251,191,36,0.4)` }
            : { boxShadow: `0 0 20px rgba(${glowRgb}, 0.2)` }
        }
      >
        <div className="relative aspect-video h-40 w-full sm:h-auto sm:min-h-0">
          <Image
            src={entry.videoThumbnailUrl}
            alt={`${entry.athleteName} run preview`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 220px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <Link
            href={entry.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 hover:bg-black/50"
            aria-label={`Watch ${entry.athleteName}'s video`}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-black sm:h-12 sm:w-12"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 20px ${accentColor}`,
              }}
            >
              <Play className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
            </span>
          </Link>
        </div>
      </div>

      <p className="mb-1 text-xl sm:text-2xl">{countryCodeToFlag(entry.countryCode)}</p>
      <p className="w-full max-w-[min(100%,16rem)] break-words px-1 text-center text-xs font-black uppercase leading-snug text-foreground sm:text-sm">
        {entry.athleteName}
      </p>
      <p
        className="mb-1 font-mono text-2xl font-black tabular-nums sm:text-3xl md:text-4xl"
        style={{
          color: accentColor,
          textShadow: `0 0 24px rgba(${glowRgb}, 0.6)`,
        }}
      >
        {entry.aiScore.toFixed(1)}
      </p>
      <TrendBadge entry={entry} />

      <div
        className={`mt-4 flex w-full flex-col items-center justify-end rounded-t-md bg-gradient-to-b ${PODIUM_MEDAL[displayIndex]} ${PODIUM_HEIGHT[displayIndex]} border border-border`}
      >
        <span className="pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90 sm:pb-3 sm:text-xs">
          {PODIUM_LABEL[displayIndex]}
        </span>
      </div>
    </div>
  )
}

export function LeaderboardPodium({
  entries,
  accentColor,
  glowRgb = "255, 149, 0",
}: LeaderboardPodiumProps) {
  const topThree = entries.slice(0, 3)
  if (topThree.length === 0) return null

  return (
    <>
      {/* Mobile: single column, rank order */}
      <div className="mb-10 grid grid-cols-1 gap-8 sm:hidden">
        {topThree.map((entry, index) => (
          <PodiumAthleteCard
            key={entry.participantId}
            entry={entry}
            slotIndex={index}
            displayIndex={index}
            accentColor={accentColor}
            glowRgb={glowRgb}
          />
        ))}
      </div>

      {/* Tablet+: classic podium layout */}
      <div className="mb-12 hidden grid-cols-3 items-end gap-2 sm:grid md:gap-6">
        {PODIUM_ORDER.map((slotIndex, displayIndex) => {
          const entry = topThree[slotIndex]
          if (!entry) return <div key={displayIndex} />

          const isFirst = slotIndex === 0

          return (
            <div
              key={entry.participantId}
              className={`flex flex-col items-center ${isFirst ? "order-2" : slotIndex === 1 ? "order-1" : "order-3"}`}
            >
              <PodiumAthleteCard
                entry={entry}
                slotIndex={slotIndex}
                displayIndex={displayIndex}
                accentColor={accentColor}
                glowRgb={glowRgb}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
