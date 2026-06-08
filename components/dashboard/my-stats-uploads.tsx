"use client"

import Image from "next/image"
import Link from "next/link"
import { Loader2, Medal, Trophy, Upload, Video } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { getCategoryBySlug } from "@/lib/competitions"
import { useUserSubmissions } from "@/hooks/use-user-submissions"

interface MyStatsUploadsProps {
  user: User
  onUploadClick: () => void
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso))
}

function StandingBadge({
  rank,
  total,
}: {
  rank: number | null
  total: number | null
}) {
  if (rank == null) {
    return (
      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-600">
        Judging…
      </span>
    )
  }

  const label =
    rank === 1 ? "Gold" : rank === 2 ? "Silver" : rank === 3 ? "Bronze" : null

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-foreground">
      <Medal className="h-3 w-3" aria-hidden />
      #{rank}
      {label ? ` ${label}` : ""}
      {total != null && (
        <span className="font-normal text-muted-foreground">of {total}</span>
      )}
    </span>
  )
}

export function MyStatsUploads({ user, onUploadClick }: MyStatsUploadsProps) {
  const { submissions, total, loading, error } = useUserSubmissions(user)

  const rankedEntries = submissions.filter((item) => item.rank != null)
  const bestRank =
    rankedEntries.length > 0
      ? Math.min(...rankedEntries.map((item) => item.rank!))
      : null

  return (
    <section
      className="rounded-2xl border border-border bg-card/95 p-5 shadow-lg backdrop-blur-sm sm:p-8"
      aria-labelledby="my-stats-heading"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="hobbyx-label-sub text-xs uppercase tracking-[0.25em]">
            Your activity
          </p>
          <h2 id="my-stats-heading" className="hobbyx-label-title mt-2 text-xl sm:text-2xl">
            My stats & uploads
          </h2>
        </div>
        <button
          type="button"
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Upload className="h-4 w-4" aria-hidden />
          Upload video
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total uploads
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">
            {loading ? "—" : total}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Competitions
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">
            {loading
              ? "—"
              : new Set(submissions.map((item) => item.competitionId)).size}
          </p>
        </div>
        <div className="col-span-2 rounded-xl border border-border bg-secondary/50 px-4 py-3 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Best standing
          </p>
          <p className="mt-1 flex items-center gap-2 font-mono text-2xl font-bold text-foreground">
            {loading ? (
              "—"
            ) : bestRank != null ? (
              <>
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden />#{bestRank}
              </>
            ) : (
              "—"
            )}
          </p>
        </div>
      </div>

      {error && (
        <p
          className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[120px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        </div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
          <Video className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden />
          <p className="text-sm text-muted-foreground">
            No uploads yet. Enter a competition and submit your first video.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => {
            const category = getCategoryBySlug(
              submission.categorySlug as Parameters<typeof getCategoryBySlug>[0],
            )
            const accent = category?.accentColor ?? "#ff6b00"

            return (
              <article
                key={submission.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                style={{ boxShadow: `inset 3px 0 0 0 ${accent}` }}
              >
                <div className="relative aspect-video bg-secondary">
                  <Image
                    src={submission.posterUrl}
                    alt={submission.challengeTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
                    <StandingBadge
                      rank={submission.rank}
                      total={submission.totalInCompetition}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    {category?.shortName ?? submission.categorySlug}
                  </p>
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                    {submission.challengeTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(submission.submittedAt)}
                    {submission.likesCount != null && (
                      <> · {submission.likesCount} likes</>
                    )}
                  </p>
                  <Link
                    href={`/leaderboard?competition=${submission.competitionId}`}
                    className="mt-auto text-xs font-semibold text-[#0284c7] hover:underline"
                  >
                    View rankings
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
