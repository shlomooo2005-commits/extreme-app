import type { CompetitionJudgedBy } from "@/lib/competitions"
import type { CategoryFeedClip } from "@/lib/category-feed"

/** Impressions served during the initial test cluster (exploration window). */
export const FEED_INITIAL_REVIEW_IMPRESSIONS = 25

/** Minimum impressions before engagement-based cooling applies. */
export const FEED_MIN_IMPRESSIONS_TO_EVALUATE = 20

/** Below this like/view ratio (after min impressions), clip is cooled. */
export const FEED_CRITICAL_LIKE_RATIO = 0.02

/** Hide from main infinite scroll when impressions >= this and likes === 0. */
export const FEED_ZERO_LIKES_HIDE_IMPRESSIONS = 15

export type FeedDistributionPhase = "review" | "main" | "cooled" | "hidden"

export interface FeedEngagementStats {
  clipId: string
  impressions: number
  likesCount: number
}

export interface RankedFeedClip extends CategoryFeedClip {
  likeCount: number
  impressions: number
  distributionPhase: FeedDistributionPhase
  feedScore: number
  /** Excluded from main infinite scroll when true */
  feedHidden: boolean
}

export function getLikeRatio(stats: FeedEngagementStats): number {
  if (stats.impressions <= 0) return 0
  return stats.likesCount / stats.impressions
}

export function resolveDistributionPhase(
  stats: FeedEngagementStats,
  judgedBy: CompetitionJudgedBy
): FeedDistributionPhase {
  if (judgedBy === "AI") return "main"

  const { impressions, likesCount } = stats

  if (impressions < FEED_INITIAL_REVIEW_IMPRESSIONS) {
    return "review"
  }

  if (impressions >= FEED_ZERO_LIKES_HIDE_IMPRESSIONS && likesCount === 0) {
    return "hidden"
  }

  if (
    impressions >= FEED_MIN_IMPRESSIONS_TO_EVALUATE &&
    getLikeRatio(stats) <= FEED_CRITICAL_LIKE_RATIO
  ) {
    return "cooled"
  }

  return "main"
}

export function isHiddenFromMainFeed(phase: FeedDistributionPhase): boolean {
  return phase === "hidden"
}

/** Higher = shown earlier in the feed. */
export function computeFeedScore(
  stats: FeedEngagementStats,
  phase: FeedDistributionPhase,
  judgedBy: CompetitionJudgedBy,
  createdAtMs: number
): number {
  if (judgedBy === "AI") {
    return createdAtMs / 1000
  }

  const ratio = getLikeRatio(stats)
  const engagementScore =
    ratio * 1000 + Math.log10(stats.likesCount + 1) * 200

  switch (phase) {
    case "review":
      return 10_000 + engagementScore + createdAtMs / 1_000_000
    case "main":
      return 5_000 + engagementScore + createdAtMs / 1_000_000
    case "cooled":
      return 200 + ratio * 100
    case "hidden":
      return 0
    default:
      return engagementScore
  }
}

export function rankClipsForLikesFeed(
  clips: CategoryFeedClip[],
  statsByClipId: Map<string, FeedEngagementStats>,
  options?: {
    createdAtByClipId?: Map<string, number>
    includeHidden?: boolean
  }
): RankedFeedClip[] {
  const createdAtByClipId = options?.createdAtByClipId ?? new Map()
  const includeHidden = options?.includeHidden ?? false

  const ranked = clips.map((clip) => {
    const stats = statsByClipId.get(clip.id) ?? {
      clipId: clip.id,
      impressions: 0,
      likesCount: clip.seedLikeCount ?? 0,
    }

    const effectiveLikes = Math.max(stats.likesCount, clip.seedLikeCount ?? 0)
    const effectiveStats: FeedEngagementStats = {
      ...stats,
      likesCount: effectiveLikes,
    }

    const phase = resolveDistributionPhase(effectiveStats, clip.judgedBy)
    const createdAtMs = createdAtByClipId.get(clip.id) ?? Date.now()
    const feedScore = computeFeedScore(
      effectiveStats,
      phase,
      clip.judgedBy,
      createdAtMs
    )

    return {
      ...clip,
      seedLikeCount: effectiveLikes,
      likeCount: effectiveLikes,
      impressions: stats.impressions,
      distributionPhase: phase,
      feedScore,
      feedHidden: isHiddenFromMainFeed(phase),
    }
  })

  const visible = includeHidden
    ? ranked
    : ranked.filter((c) => !c.feedHidden)

  return visible.sort((a, b) => b.feedScore - a.feedScore)
}
