/**
 * Leaderboard data — populated from real submissions when integrated.
 * No mock athletes or demo video URLs.
 */

import {
  rankLeaderboardEntries,
  resolveEntryLikeCount,
} from "@/lib/competition-judging"
import {
  COMPETITIONS,
  getCategoryBySlug,
  getCompetitionById,
  resolveCompetitionId,
  type CategorySlug,
  type Competition,
} from "@/lib/competitions"
import type { SubmissionSource } from "@/lib/submission-security"

export interface LeaderboardScoreBreakdown {
  skill: number
  style: number
  difficulty: number
  authenticity: number
}

export interface LeaderboardEntry {
  rank: number
  participantId: string
  athleteName: string
  countryCode: string
  countryName: string
  aiScore: number
  scoreBreakdown: LeaderboardScoreBreakdown
  videoThumbnailUrl: string
  videoUrl: string
  submittedAt: string
  trend: "up" | "down" | "same"
  rankChange: number
  seedLikeCount?: number
  likeCount?: number
  source?: SubmissionSource
}

export interface CompetitionLeaderboard {
  competitionId: string
  lastUpdated: string
  entries: LeaderboardEntry[]
}

/** Real leaderboard rows only — empty until submissions rank athletes. */
export const LEADERBOARD_ENTRIES: Record<
  string,
  Omit<LeaderboardEntry, "rank">[]
> = {}

function defaultSourceForCategory(categorySlug: CategorySlug): SubmissionSource {
  if (categorySlug === "mountain-biking") return "external"
  if (
    categorySlug === "basketball" ||
    categorySlug === "football" ||
    categorySlug === "music"
  ) {
    return "app_camera"
  }
  return "external"
}

export function getLeaderboardForCompetition(
  competitionId: string,
  options?: { likeCountFor?: (participantId: string) => number }
): CompetitionLeaderboard | undefined {
  const resolvedId = resolveCompetitionId(competitionId)
  const competition = getCompetitionById(resolvedId)
  if (!competition) return undefined

  const rows = LEADERBOARD_ENTRIES[resolvedId] ?? []
  const judgedBy = competition.judgedBy

  const entries = rankLeaderboardEntries(
    rows.map((row) => ({ ...row, rank: 0 })),
    judgedBy,
    (entry) => {
      if (judgedBy === "AI") return 0
      return resolveEntryLikeCount(
        entry,
        options?.likeCountFor?.(entry.participantId)
      )
    }
  ).map((row) => ({
    ...row,
    source:
      row.source ?? defaultSourceForCategory(competition.categorySlug),
    likeCount:
      judgedBy === "likes"
        ? resolveEntryLikeCount(
            row,
            options?.likeCountFor?.(row.participantId)
          )
        : undefined,
  }))

  return {
    competitionId: resolvedId,
    lastUpdated: new Date().toISOString(),
    entries,
  }
}

export function getAllCompetitionLeaderboards(): CompetitionLeaderboard[] {
  return COMPETITIONS.filter((c) => c.status === "active")
    .map((c) => getLeaderboardForCompetition(c.id))
    .filter((lb): lb is CompetitionLeaderboard => Boolean(lb))
}

export function getLeaderboardCompetitions(): Competition[] {
  return COMPETITIONS.filter((c) => c.status === "active")
}

export function countryCodeToFlag(countryCode: string): string {
  const code = countryCode.toUpperCase()
  return [...code]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("")
}

export function getLeaderboardMeta(competitionId: string) {
  const resolvedId = resolveCompetitionId(competitionId)
  const competition = getCompetitionById(resolvedId)
  const category = competition
    ? getCategoryBySlug(competition.categorySlug)
    : undefined
  const leaderboard = getLeaderboardForCompetition(resolvedId)

  return { competition, category, leaderboard }
}
