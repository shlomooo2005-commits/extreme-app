import { neon } from "@neondatabase/serverless"
import type { CategorySlug } from "@/lib/competitions"
import type { CategoryFeedClip } from "@/lib/category-feed"
import {
  rankClipsForLikesFeed,
  type FeedEngagementStats,
  type RankedFeedClip,
} from "@/lib/feed-ranking"
import {
  ensureSubmissionsSchema,
  isSubmissionsDbConfigured,
} from "@/lib/submissions-db"

function getDatabaseUrl(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) throw new Error("Database not configured.")
  return neon(url)
}

let engagementSchemaReady: Promise<void> | null = null

export function ensureFeedEngagementSchema(): Promise<void> {
  if (!engagementSchemaReady) {
    engagementSchemaReady = (async () => {
      await ensureSubmissionsSchema()
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS feed_engagement (
          clip_id TEXT PRIMARY KEY,
          category_slug TEXT NOT NULL,
          competition_id TEXT NOT NULL,
          submission_id TEXT,
          impressions INT NOT NULL DEFAULT 0,
          likes_count INT NOT NULL DEFAULT 0,
          seed_likes INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS feed_engagement_category_idx
        ON feed_engagement (category_slug)
      `
      await sql`
        CREATE TABLE IF NOT EXISTS feed_clip_likes (
          clip_id TEXT NOT NULL,
          voter_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (clip_id, voter_id)
        )
      `
    })().catch((err) => {
      engagementSchemaReady = null
      throw err
    })
  }
  return engagementSchemaReady
}

export async function ensureFeedEngagementRow(input: {
  clipId: string
  categorySlug: CategorySlug
  competitionId: string
  submissionId?: string | null
  seedLikes?: number
}): Promise<void> {
  if (!isSubmissionsDbConfigured()) return
  await ensureFeedEngagementSchema()
  const sql = getSql()
  await sql`
    INSERT INTO feed_engagement (
      clip_id,
      category_slug,
      competition_id,
      submission_id,
      seed_likes
    ) VALUES (
      ${input.clipId},
      ${input.categorySlug},
      ${input.competitionId},
      ${input.submissionId ?? null},
      ${input.seedLikes ?? 0}
    )
    ON CONFLICT (clip_id) DO NOTHING
  `
}

export async function getEngagementStatsForClips(
  clipIds: string[]
): Promise<Map<string, FeedEngagementStats>> {
  const map = new Map<string, FeedEngagementStats>()
  if (!isSubmissionsDbConfigured() || clipIds.length === 0) return map

  await ensureFeedEngagementSchema()
  const sql = getSql()

  const rows = await sql`
    SELECT clip_id, impressions, likes_count, seed_likes
    FROM feed_engagement
    WHERE clip_id = ANY(${clipIds})
  `

  for (const row of rows as {
    clip_id: string
    impressions: number
    likes_count: number
    seed_likes: number
  }[]) {
    const totalLikes = Number(row.likes_count) + Number(row.seed_likes)
    map.set(row.clip_id, {
      clipId: row.clip_id,
      impressions: Number(row.impressions),
      likesCount: totalLikes,
    })
  }

  return map
}

export async function recordFeedImpressions(clipIds: string[]): Promise<void> {
  if (!isSubmissionsDbConfigured() || clipIds.length === 0) return
  await ensureFeedEngagementSchema()
  const sql = getSql()

  for (const clipId of clipIds) {
    await sql`
      UPDATE feed_engagement
      SET
        impressions = impressions + 1,
        updated_at = NOW()
      WHERE clip_id = ${clipId}
    `
  }
}

export async function toggleFeedClipLike(
  clipId: string,
  voterId: string
): Promise<{ liked: boolean; likesCount: number }> {
  if (!isSubmissionsDbConfigured()) {
    throw new Error("Database not configured.")
  }
  await ensureFeedEngagementSchema()
  const sql = getSql()

  const existing = await sql`
    SELECT 1 FROM feed_clip_likes
    WHERE clip_id = ${clipId} AND voter_id = ${voterId}
    LIMIT 1
  `
  const wasLiked = (existing as unknown[]).length > 0

  if (wasLiked) {
    await sql`
      DELETE FROM feed_clip_likes
      WHERE clip_id = ${clipId} AND voter_id = ${voterId}
    `
    await sql`
      UPDATE feed_engagement
      SET likes_count = GREATEST(likes_count - 1, 0), updated_at = NOW()
      WHERE clip_id = ${clipId}
    `
  } else {
    await sql`
      INSERT INTO feed_clip_likes (clip_id, voter_id)
      VALUES (${clipId}, ${voterId})
      ON CONFLICT DO NOTHING
    `
    await sql`
      UPDATE feed_engagement
      SET likes_count = likes_count + 1, updated_at = NOW()
      WHERE clip_id = ${clipId}
    `
  }

  const counts = await sql`
    SELECT likes_count, seed_likes FROM feed_engagement WHERE clip_id = ${clipId}
  `
  const row = counts[0] as { likes_count: number; seed_likes: number } | undefined
  const liked = !wasLiked
  const likesCount = row
    ? Number(row.likes_count) + Number(row.seed_likes)
    : 0

  return { liked, likesCount }
}

export async function voterHasLikedClips(
  voterId: string,
  clipIds: string[]
): Promise<Set<string>> {
  if (!isSubmissionsDbConfigured() || clipIds.length === 0) {
    return new Set()
  }
  await ensureFeedEngagementSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT clip_id FROM feed_clip_likes
    WHERE voter_id = ${voterId}
      AND clip_id = ANY(${clipIds})
  `
  return new Set((rows as { clip_id: string }[]).map((r) => r.clip_id))
}

export async function registerSubmissionForFeedRanking(input: {
  clipId: string
  categorySlug: CategorySlug
  competitionId: string
  submissionId: string
}): Promise<void> {
  await ensureFeedEngagementRow({
    clipId: input.clipId,
    categorySlug: input.categorySlug,
    competitionId: input.competitionId,
    submissionId: input.submissionId,
    seedLikes: 0,
  })
}

export async function syncEngagementRowsForClips(
  categorySlug: CategorySlug,
  clips: CategoryFeedClip[]
): Promise<void> {
  if (!isSubmissionsDbConfigured()) return
  for (const clip of clips) {
    await ensureFeedEngagementRow({
      clipId: clip.id,
      categorySlug,
      competitionId: clip.competitionId,
      submissionId: clip.submissionId ?? null,
      seedLikes: clip.seedLikeCount ?? 0,
    })
  }
}

/** Ranked main-feed clips for a category (likes-based cooling applied). */
export async function getRankedCategoryFeed(
  categorySlug: CategorySlug,
  clips: CategoryFeedClip[],
  createdAtByClipId?: Map<string, number>
): Promise<RankedFeedClip[]> {
  if (clips.length === 0) return []

  if (isSubmissionsDbConfigured()) {
    await syncEngagementRowsForClips(categorySlug, clips)
  }

  const stats = isSubmissionsDbConfigured()
    ? await getEngagementStatsForClips(clips.map((c) => c.id))
    : new Map<string, FeedEngagementStats>()

  for (const clip of clips) {
    if (!stats.has(clip.id)) {
      stats.set(clip.id, {
        clipId: clip.id,
        impressions: 0,
        likesCount: clip.seedLikeCount ?? 0,
      })
    }
  }

  return rankClipsForLikesFeed(clips, stats, {
    createdAtByClipId,
    includeHidden: false,
  })
}
