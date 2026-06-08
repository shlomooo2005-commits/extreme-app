"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Crown,
  Medal,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import { usesLikesForWinner } from "@/lib/competition-judging"
import { buildClipId } from "@/lib/feed-likes-store"
import {
  getLeaderboardCompetitions,
  getLeaderboardForCompetition,
  getLeaderboardMeta,
} from "@/lib/leaderboard"
import { getCategoryBySlug, getCompetitionById } from "@/lib/competitions"
import { useFeedLikes } from "@/hooks/use-feed-likes"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CategoryThemeDecor } from "@/components/category/category-theme-decor"
import { LeaderboardPodium } from "./leaderboard-podium"
import { LeaderboardTable } from "./leaderboard-table"

interface LeaderboardDashboardProps {
  initialCompetitionId?: string
}

export function LeaderboardDashboard({
  initialCompetitionId,
}: LeaderboardDashboardProps) {
  const competitions = getLeaderboardCompetitions()
  const defaultId =
    initialCompetitionId &&
    competitions.some((c) => c.id === initialCompetitionId)
      ? initialCompetitionId
      : competitions[0]?.id ?? ""

  const [selectedId, setSelectedId] = useState(defaultId)
  const { getDisplayLikeCount } = useFeedLikes()

  const { competition, category, leaderboard } = useMemo(() => {
    const competition = getCompetitionById(selectedId)
    const category = competition
      ? getCategoryBySlug(competition.categorySlug)
      : undefined

    const seedRows =
      getLeaderboardMeta(selectedId).leaderboard?.entries ?? []

    const likeCountFor = (participantId: string) => {
      const row = seedRows.find((e) => e.participantId === participantId)
      return getDisplayLikeCount(
        buildClipId(selectedId, participantId),
        row?.seedLikeCount ?? 0
      )
    }

    const leaderboard = getLeaderboardForCompetition(selectedId, {
      likeCountFor,
    })

    return { competition, category, leaderboard }
  }, [selectedId, getDisplayLikeCount])

  const entries = leaderboard?.entries ?? []
  const visual = category ? getCategoryVisual(category.slug) : null
  const accentColor = visual?.neonAccent ?? "#ff9500"
  const glowRgb = visual?.glowRgb ?? "255, 149, 0"
  const likesJudged = competition ? usesLikesForWinner(competition) : false
  const topScore = likesJudged
    ? (entries[0]?.likeCount ?? 0)
    : (entries[0]?.aiScore ?? 0)
  const avgScore =
    entries.length > 0
      ? likesJudged
        ? entries.reduce((s, e) => s + (e.likeCount ?? 0), 0) / entries.length
        : entries.reduce((s, e) => s + e.aiScore, 0) / entries.length
      : 0

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          visual?.darkPageBackground ??
          "linear-gradient(180deg, #e8f4fc 0%, #dbeafe 100%)",
      }}
    >
      <section
        className={`relative min-h-[50vh] overflow-hidden md:min-h-[55vh] ${visual ? `category-theme-root ${visual.themeClass}` : ""}`}
      >
        {visual && category && (
          <>
            {visual.heroImageSrc ? (
              <>
                <Image
                  key={category.slug}
                  src={visual.heroImageSrc}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-70"
                  sizes="100vw"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: visual.sportGradient }}
                />
              </>
            ) : null}
            <CategoryThemeDecor slug={category.slug} variant="hero" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-transparent" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(ellipse 50% 80% at 50% 100%, rgba(${glowRgb}, 0.35), transparent)`,
          }}
        />

        <div className="relative z-10 px-4 pb-10 pt-6 sm:px-5 sm:pb-12 sm:pt-8 md:mx-auto md:max-w-6xl md:px-8 md:pb-16 md:pt-12">
          <p
            className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.25em] sm:text-sm sm:tracking-[0.35em]"
            style={{ color: accentColor }}
          >
            <Trophy className="h-4 w-4 shrink-0" />
            HobbyX · Season 4 rankings
          </p>
          <h1 className="magazine-title text-4xl leading-[0.95] text-foreground sm:text-5xl md:text-7xl lg:text-8xl">
            Live
            <br />
            <span style={{ color: accentColor }}>Leaderboard</span>
          </h1>
          {category && competition && (
            <p className="mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Now viewing{" "}
              <span className="font-bold text-foreground">{competition.title}</span>{" "}
              — {category.name}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-card/60 sm:mt-8 md:grid-cols-4">
            {[
              { icon: Trophy, label: "Events", value: String(competitions.length) },
              {
                icon: Users,
                label: "Athletes",
                value: String(
                  competitions.reduce(
                    (n, c) =>
                      n +
                      (getLeaderboardForCompetition(c.id)?.entries.length ?? 0),
                    0
                  )
                ),
              },
              {
                icon: Crown,
                label: "Top score",
                value: topScore > 0 ? topScore.toFixed(1) : "—",
              },
              {
                icon: Sparkles,
                label: "Event avg",
                value: avgScore > 0 ? avgScore.toFixed(1) : "—",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="min-w-0 bg-card/90 px-3 py-4 backdrop-blur-md sm:px-4 sm:py-5"
              >
                <Icon className="mb-2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                <p
                  className="truncate font-mono text-xl font-black tabular-nums sm:text-2xl md:text-3xl"
                  style={{ color: accentColor }}
                >
                  {value}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[10px] sm:tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            boxShadow: `0 0 20px ${accentColor}`,
          }}
        />
      </section>

      <div className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-8 sm:px-5 sm:py-10 md:px-8 md:py-14">
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
            <Medal className="h-4 w-4" />
            Select competition
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {competitions.map((c) => {
              const meta = getLeaderboardMeta(c.id)
              const catVisual = meta.category
                ? getCategoryVisual(meta.category.slug)
                : null
              const isActive = c.id === selectedId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`relative max-w-[min(100%,240px)] shrink-0 overflow-hidden rounded-md border px-3 py-2.5 text-left transition-all sm:px-4 sm:py-3 ${
                    isActive
                      ? "border-transparent text-black"
                      : "border-border bg-white/5 text-foreground hover:border-white/25"
                  }`}
                  style={
                    isActive && catVisual
                      ? {
                          backgroundColor: catVisual.neonAccent,
                          boxShadow: `0 0 28px rgba(${catVisual.glowRgb}, 0.5)`,
                        }
                      : undefined
                  }
                >
                  {catVisual && !isActive && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `url(${catVisual.heroImageSrc})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}
                  <div className="relative">
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        isActive ? "text-black/70" : "text-muted-foreground"
                      }`}
                    >
                      {meta.category?.shortName}
                    </p>
                    <p className="line-clamp-2 text-xs font-bold leading-snug sm:max-w-[180px] sm:text-sm">
                      {c.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {competition && category && visual && (
          <div
            className="mb-8 flex min-w-0 flex-col gap-4 overflow-hidden rounded-lg border border-border p-4 sm:mb-10 sm:p-6 md:flex-row md:items-center md:justify-between md:p-8"
            style={{
              background: `linear-gradient(135deg, rgba(${glowRgb}, 0.12) 0%, rgba(0,0,0,0.8) 100%)`,
              boxShadow: `inset 4px 0 0 0 ${visual.neonAccent}`,
            }}
          >
            <div>
              <p
                className="mb-1 text-xs font-black uppercase tracking-[0.25em]"
                style={{ color: visual.neonAccent }}
              >
                {category.name}
              </p>
              <h2 className="magazine-title break-words text-xl text-foreground sm:text-2xl md:text-4xl">
                {competition.title}
              </h2>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                {entries.length} ranked · ${competition.prizePoolUsd.toLocaleString()}{" "}
                pool
              </p>
            </div>
            <Link
              href={`/submit?category=${competition.categorySlug}&competition=${competition.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3.5 text-xs font-black uppercase tracking-widest text-black sm:w-auto sm:px-6 sm:py-4 sm:text-sm"
              style={{
                backgroundColor: visual.neonAccent,
                boxShadow: `0 0 30px rgba(${glowRgb}, 0.5)`,
              }}
            >
              <Zap className="h-4 w-4" />
              Enter
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {entries.length > 0 ? (
          <>
            <LeaderboardPodium
              entries={entries}
              accentColor={accentColor}
              glowRgb={glowRgb}
            />
            <h3 className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">
              Full standings
            </h3>
            <LeaderboardTable
              entries={entries}
              accentColor={accentColor}
              glowRgb={glowRgb}
              judgedBy={competition?.judgedBy ?? "likes"}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-border py-20 text-center text-muted-foreground">
            No rankings for this competition yet.
          </div>
        )}
      </div>
    </div>
  )
}
