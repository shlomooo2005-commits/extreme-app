import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Play } from "lucide-react"
import type { UserSubmission } from "@/lib/user-profile"
import { getSubmissionMeta } from "@/lib/user-profile"

interface SubmissionHistoryCardProps {
  submission: UserSubmission
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 0) {
    return (
      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-400">
        Judging…
      </span>
    )
  }
  if (rank === 1) {
    return (
      <span className="rounded-full bg-gradient-to-r from-amber-300 to-amber-600 px-2.5 py-0.5 text-xs font-bold text-black">
        #{rank} Gold
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="rounded-full bg-gradient-to-r from-zinc-300 to-zinc-500 px-2.5 py-0.5 text-xs font-bold text-black">
        #{rank} Silver
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="rounded-full bg-gradient-to-r from-orange-400 to-orange-700 px-2.5 py-0.5 text-xs font-bold text-black">
        #{rank} Bronze
      </span>
    )
  }
  return (
    <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs font-bold text-muted-foreground">
      #{rank}
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
  if (value === 0) return null
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-7 text-muted-foreground">{label}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-right font-mono text-muted-foreground">
        {value}
      </span>
    </div>
  )
}

export function SubmissionHistoryCard({ submission }: SubmissionHistoryCardProps) {
  const { category } = getSubmissionMeta(submission)
  const accent = category?.accentColor ?? "#f97316"
  const isJudging = submission.status === "judging"

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-secondary/20 transition-colors hover:border-border">
      <div className="relative aspect-video">
        <Image
          src={submission.videoThumbnailUrl}
          alt={submission.challengeTitle}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {!isJudging && (
          <Link
            href={submission.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 hover:bg-black/30"
            aria-label="Watch submission"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Play className="h-5 w-5 fill-current" />
            </span>
          </Link>
        )}
        <div className="absolute left-3 top-3">
          <RankBadge rank={isJudging ? 0 : submission.rank} />
        </div>
        {!isJudging && (
          <div className="absolute bottom-3 right-3">
            <span
              className="font-mono text-3xl font-bold text-foreground drop-shadow-lg"
              style={{ color: accent }}
            >
              {submission.aiScore.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p
          className="mb-1 text-xs font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {category?.name}
        </p>
        <h3 className="mb-2 line-clamp-2 font-bold text-foreground">
          {submission.challengeTitle}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(submission.submittedAt))}
          {!isJudging && (
            <>
              {" "}
              · {submission.rank} of {submission.totalEntrants}
            </>
          )}
          {" · "}
          {submission.captureMethod === "live_camera"
            ? "Live capture"
            : "Verified upload"}
        </p>

        {!isJudging && (
          <div className="mb-4 space-y-1.5">
            <ScoreBar label="SKL" value={submission.scoreBreakdown.skill} color={accent} />
            <ScoreBar label="STL" value={submission.scoreBreakdown.style} color={accent} />
            <ScoreBar label="DIF" value={submission.scoreBreakdown.difficulty} color={accent} />
            <ScoreBar label="AUT" value={submission.scoreBreakdown.authenticity} color={accent} />
          </div>
        )}

        {isJudging && (
          <p className="mb-4 text-sm text-amber-400/90">
            AI judges are scoring your run…
          </p>
        )}

        <div className="mt-auto flex gap-2">
          <Link
            href={`/leaderboard?competition=${submission.competitionId}`}
            className="flex-1 rounded-lg border border-border/50 bg-secondary/60 py-2 text-center text-xs font-bold uppercase tracking-wider text-foreground hover:border-primary/50"
          >
            Rankings
          </Link>
          {!isJudging && (
            <Link
              href={submission.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              Watch
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
