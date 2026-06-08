import type { CategorySlug } from "@/lib/competitions"
import type { CompetitionJudgedBy } from "@/lib/competitions"
import { getCompetitionById } from "@/lib/competitions"
import type { SubmissionSource } from "@/lib/submission-security"

/** All category feed clips are capped at 15 seconds for fast scrolling. */
export const CATEGORY_FEED_MAX_SECONDS = 15

export interface CategoryFeedClip {
  id: string
  submissionId?: string
  competitionId: string
  competitionTitle: string
  judgedBy: CompetitionJudgedBy
  athleteName: string
  countryCode: string
  videoUrl: string
  posterUrl: string
  durationSeconds: number
  seedLikeCount: number
  /** Total likes from ranked feed API (seed + votes). */
  likeCount?: number
  source: SubmissionSource
}

/** No demo clips — feed is populated from real submissions in the database only. */
export function getCategoryFeedClips(_categorySlug: CategorySlug): CategoryFeedClip[] {
  return []
}

/** Returns database clips only (no mock merge). */
export function mergeCategoryFeedClips(
  _categorySlug: CategorySlug,
  dbClips: CategoryFeedClip[]
): CategoryFeedClip[] {
  return dbClips
}

export function getFeedClipCompetition(clip: CategoryFeedClip) {
  return getCompetitionById(clip.competitionId)
}
