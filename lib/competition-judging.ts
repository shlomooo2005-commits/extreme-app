import type { Competition, CompetitionJudgedBy } from "@/lib/competitions"
import type { LeaderboardEntry } from "@/lib/leaderboard"

export type { CompetitionJudgedBy }

export const DEFAULT_COMPETITION_JUDGED_BY: CompetitionJudgedBy = "likes"

export function usesLikesForWinner(competition: Competition): boolean {
  return competition.judgedBy === "likes"
}

export function usesAiForWinner(competition: Competition): boolean {
  return competition.judgedBy === "AI"
}

export function getJudgingLabel(judgedBy: CompetitionJudgedBy): string {
  return judgedBy === "likes" ? "Crowd likes" : "AI judged"
}

export function resolveEntryLikeCount(
  entry: LeaderboardEntry,
  liveLikeCount?: number
): number {
  if (liveLikeCount != null) return liveLikeCount
  if (entry.seedLikeCount != null) return entry.seedLikeCount
  return Math.round(entry.aiScore * 12)
}

export function compareLeaderboardEntries(
  a: LeaderboardEntry,
  b: LeaderboardEntry,
  judgedBy: CompetitionJudgedBy,
  likeCountFor: (entry: LeaderboardEntry) => number
): number {
  if (judgedBy === "likes") {
    return likeCountFor(b) - likeCountFor(a)
  }
  return b.aiScore - a.aiScore
}

export function rankLeaderboardEntries(
  entries: LeaderboardEntry[],
  judgedBy: CompetitionJudgedBy,
  likeCountFor: (entry: LeaderboardEntry) => number
): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => compareLeaderboardEntries(a, b, judgedBy, likeCountFor))
    .map((row, index) => ({ ...row, rank: index + 1 }))
}

export function getCompetitionWinner(
  competition: Competition,
  entries: LeaderboardEntry[],
  likeCountFor: (entry: LeaderboardEntry) => number
): LeaderboardEntry | undefined {
  if (entries.length === 0) return undefined
  return rankLeaderboardEntries(entries, competition.judgedBy, likeCountFor)[0]
}
