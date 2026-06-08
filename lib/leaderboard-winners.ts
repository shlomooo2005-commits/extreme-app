import {
  getActiveCompetitionsByCategory,
  getCategories,
  type CategorySlug,
  type Competition,
} from "@/lib/competitions"
import {
  getLeaderboardForCompetition,
  type LeaderboardEntry,
} from "@/lib/leaderboard"

export interface CategoryWinner {
  categorySlug: CategorySlug
  categoryName: string
  categoryShortName: string
  competition: Competition
  winner: LeaderboardEntry
  /** Demo payout — 50% of active competition prize pool to 1st place */
  prizeEarnedUsd: number
}

export function calculateFirstPlacePrize(poolUsd: number): number {
  return Math.round(poolUsd * 0.5)
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

/** One winning athlete per hobby domain (current #1 on active competition). */
export function getWinnersByCategory(): CategoryWinner[] {
  const rows: CategoryWinner[] = []

  for (const category of getCategories()) {
    const [competition] = getActiveCompetitionsByCategory(category.slug)
    if (!competition) continue

    const leaderboard = getLeaderboardForCompetition(competition.id)
    const winner = leaderboard?.entries.find((e) => e.rank === 1)
    if (!winner) continue

    rows.push({
      categorySlug: category.slug,
      categoryName: category.name,
      categoryShortName: category.shortName,
      competition,
      winner,
      prizeEarnedUsd: calculateFirstPlacePrize(competition.prizePoolUsd),
    })
  }

  return rows
}
