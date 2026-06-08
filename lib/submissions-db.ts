import { neon } from "@neondatabase/serverless"
import type { CategorySlug } from "@/lib/competitions"
import { getCompetitionById } from "@/lib/competitions"
import type { CategoryFeedClip } from "@/lib/category-feed"
import { CATEGORY_FEED_MAX_SECONDS } from "@/lib/category-feed"
import { buildClipId } from "@/lib/feed-likes-store"
import type { AISubmissionPayload } from "@/lib/submission"
import type {
  SubmissionSecurityStatus,
  SubmissionSource,
} from "@/lib/submission-security"
import { runVideoFingerprintScan } from "@/lib/video-fingerprint"

export class SubmissionsDbError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message)
    this.name = "SubmissionsDbError"
  }
}

export interface CompetitionSubmissionRow {
  id: string
  competitionId: string
  categorySlug: CategorySlug
  userId: string
  athleteName: string
  challengeTitle: string
  videoUrl: string
  videoPublicId: string
  sha256: string | null
  source: SubmissionSource
  status: SubmissionSecurityStatus
  fingerprintFlags: string[]
  fingerprintMatchedPlatform: string | null
  fingerprintScannedAt: string | null
  payload: AISubmissionPayload
  createdAt: string
}

function getDatabaseUrl(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL
}

export function isSubmissionsDbConfigured(): boolean {
  return Boolean(getDatabaseUrl())
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) {
    throw new SubmissionsDbError(
      "Database not configured. Add POSTGRES_URL for submission security.",
      503
    )
  }
  return neon(url)
}

let schemaReady: Promise<void> | null = null

export function ensureSubmissionsSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS competition_submissions (
          id TEXT PRIMARY KEY,
          competition_id TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          user_id TEXT NOT NULL,
          athlete_name TEXT NOT NULL,
          challenge_title TEXT NOT NULL,
          video_url TEXT NOT NULL,
          video_public_id TEXT NOT NULL,
          sha256 TEXT,
          source TEXT NOT NULL,
          status TEXT NOT NULL,
          fingerprint_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
          fingerprint_matched_platform TEXT,
          fingerprint_scanned_at TIMESTAMPTZ,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS competition_submissions_category_status_idx
        ON competition_submissions (category_slug, status)
      `
      await sql`
        CREATE INDEX IF NOT EXISTS competition_submissions_competition_idx
        ON competition_submissions (competition_id)
      `
      await sql`
        CREATE INDEX IF NOT EXISTS competition_submissions_sha256_idx
        ON competition_submissions (sha256)
        WHERE sha256 IS NOT NULL
      `
    })().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export function mapSubmissionRow(row: {
  id: string
  competition_id: string
  category_slug: string
  user_id: string
  athlete_name: string
  challenge_title: string
  video_url: string
  video_public_id: string
  sha256: string | null
  source: string
  status: string
  fingerprint_flags: string[] | unknown
  fingerprint_matched_platform: string | null
  fingerprint_scanned_at: Date | string | null
  payload: AISubmissionPayload
  created_at: Date | string
}): CompetitionSubmissionRow {
  const flags = Array.isArray(row.fingerprint_flags)
    ? (row.fingerprint_flags as string[])
    : []

  return {
    id: row.id,
    competitionId: row.competition_id,
    categorySlug: row.category_slug as CategorySlug,
    userId: row.user_id,
    athleteName: row.athlete_name,
    challengeTitle: row.challenge_title,
    videoUrl: row.video_url,
    videoPublicId: row.video_public_id,
    sha256: row.sha256,
    source: row.source as SubmissionSource,
    status: row.status as SubmissionSecurityStatus,
    fingerprintFlags: flags,
    fingerprintMatchedPlatform: row.fingerprint_matched_platform,
    fingerprintScannedAt: row.fingerprint_scanned_at
      ? row.fingerprint_scanned_at instanceof Date
        ? row.fingerprint_scanned_at.toISOString()
        : new Date(row.fingerprint_scanned_at).toISOString()
      : null,
    payload: row.payload,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
  }
}

export async function insertCompetitionSubmission(input: {
  payload: AISubmissionPayload
  source: SubmissionSource
  status: SubmissionSecurityStatus
  sha256: string | null
}): Promise<CompetitionSubmissionRow> {
  await ensureSubmissionsSchema()
  const sql = getSql()
  const p = input.payload

  const rows = await sql`
    INSERT INTO competition_submissions (
      id,
      competition_id,
      category_slug,
      user_id,
      athlete_name,
      challenge_title,
      video_url,
      video_public_id,
      sha256,
      source,
      status,
      fingerprint_flags,
      payload
    ) VALUES (
      ${p.submissionId},
      ${p.competitionId ?? ""},
      ${p.category},
      ${p.user.userId},
      ${p.athleteName},
      ${p.challengeTitle},
      ${p.video.secureUrl},
      ${p.video.publicId},
      ${input.sha256},
      ${input.source},
      ${input.status},
      ${JSON.stringify([])}::jsonb,
      ${JSON.stringify(p)}::jsonb
    )
    RETURNING *
  `

  const row = mapSubmissionRow(rows[0] as Parameters<typeof mapSubmissionRow>[0])

  if (input.status === "active") {
    const { registerSubmissionForFeedRanking } = await import(
      "@/lib/feed-engagement-db"
    )
    const { buildClipId } = await import("@/lib/feed-likes-store")
    await registerSubmissionForFeedRanking({
      clipId: buildClipId(row.competitionId, row.id),
      categorySlug: row.categorySlug as CategorySlug,
      competitionId: row.competitionId,
      submissionId: row.id,
    })
  }

  return row
}

export async function getSubmissionById(
  id: string
): Promise<CompetitionSubmissionRow | null> {
  if (!isSubmissionsDbConfigured()) return null
  await ensureSubmissionsSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM competition_submissions WHERE id = ${id} LIMIT 1
  `
  if ((rows as unknown[]).length === 0) return null
  return mapSubmissionRow(rows[0] as Parameters<typeof mapSubmissionRow>[0])
}

export async function countActiveSubmissionsBySha256(
  sha256: string,
  excludeId: string
): Promise<number> {
  await ensureSubmissionsSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM competition_submissions
    WHERE sha256 = ${sha256}
      AND id != ${excludeId}
      AND status IN ('active', 'pending_fingerprint')
  `
  return (rows[0] as { count: number }).count
}

export async function updateSubmissionFingerprintResult(
  id: string,
  result: {
    status: SubmissionSecurityStatus
    flags: string[]
    matchedPlatform?: string | null
    payload: AISubmissionPayload
  }
): Promise<void> {
  await ensureSubmissionsSchema()
  const sql = getSql()
  await sql`
    UPDATE competition_submissions
    SET
      status = ${result.status},
      fingerprint_flags = ${JSON.stringify(result.flags)}::jsonb,
      fingerprint_matched_platform = ${result.matchedPlatform ?? null},
      fingerprint_scanned_at = NOW(),
      payload = ${JSON.stringify(result.payload)}::jsonb
    WHERE id = ${id}
  `
}

export async function runSubmissionFingerprintScan(
  submissionId: string
): Promise<FingerprintScanResultRow | null> {
  const row = await getSubmissionById(submissionId)
  if (!row || row.source !== "external") return null

  const duplicate =
    row.sha256 != null
      ? (await countActiveSubmissionsBySha256(row.sha256, row.id)) > 0
      : false

  const probe = row.payload.capture.fileProbe

  const scan = runVideoFingerprintScan(
    {
      submissionId: row.id,
      sha256: row.sha256,
      fileName: probe?.fileName ?? null,
      hardwareMarkers: probe?.hardwareMarkers,
      videoPublicId: row.videoPublicId,
    },
    { duplicateSha256InDb: duplicate }
  )

  const nextPayload: AISubmissionPayload = {
    ...row.payload,
    status:
      scan.status === "flagged_duplicate" ? "flagged_duplicate" : row.payload.status,
    security: {
      ...row.payload.security,
      status: scan.status,
      fingerprint: {
        scannedAt: new Date().toISOString(),
        flags: scan.flags,
        matchedPlatform: scan.matchedPlatform,
        confidence: scan.confidence,
        summary: scan.summary,
      },
    },
  }

  await updateSubmissionFingerprintResult(row.id, {
    status: scan.status,
    flags: scan.flags,
    matchedPlatform: scan.matchedPlatform ?? null,
    payload: nextPayload,
  })

  if (scan.status === "active") {
    const { registerSubmissionForFeedRanking } = await import(
      "@/lib/feed-engagement-db"
    )
    const { buildClipId } = await import("@/lib/feed-likes-store")
    await registerSubmissionForFeedRanking({
      clipId: buildClipId(row.competitionId, row.id),
      categorySlug: row.categorySlug as CategorySlug,
      competitionId: row.competitionId,
      submissionId: row.id,
    })
  }

  return {
    submissionId: row.id,
    status: scan.status,
    flags: scan.flags,
    matchedPlatform: scan.matchedPlatform,
    summary: scan.summary,
  }
}

export interface FingerprintScanResultRow {
  submissionId: string
  status: SubmissionSecurityStatus
  flags: string[]
  matchedPlatform?: string
  summary: string
}

export async function listSubmissionsByUserId(
  userId: string,
): Promise<CompetitionSubmissionRow[]> {
  if (!isSubmissionsDbConfigured()) return []
  await ensureSubmissionsSchema()
  const sql = getSql()

  const rows = await sql`
    SELECT *
    FROM competition_submissions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 100
  `

  return (rows as Parameters<typeof mapSubmissionRow>[0][]).map(mapSubmissionRow)
}

export async function getCompetitionSubmissionRanks(
  competitionId: string,
): Promise<
  Array<{ submissionId: string; likesCount: number; rank: number }>
> {
  if (!isSubmissionsDbConfigured()) return []
  await ensureSubmissionsSchema()
  const { ensureFeedEngagementSchema } = await import("@/lib/feed-engagement-db")
  await ensureFeedEngagementSchema()
  const sql = getSql()

  const rows = await sql`
    SELECT
      fe.submission_id,
      COALESCE(fe.likes_count, 0) + COALESCE(fe.seed_likes, 0) AS total_likes
    FROM feed_engagement fe
    WHERE fe.competition_id = ${competitionId}
      AND fe.submission_id IS NOT NULL
    ORDER BY total_likes DESC, fe.created_at ASC
  `

  return (rows as { submission_id: string; total_likes: number }[]).map(
    (row, index) => ({
      submissionId: row.submission_id,
      likesCount: Number(row.total_likes),
      rank: index + 1,
    }),
  )
}

export async function countSubmissionsInCompetition(
  competitionId: string,
): Promise<number> {
  if (!isSubmissionsDbConfigured()) return 0
  await ensureSubmissionsSchema()
  const sql = getSql()

  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM competition_submissions
    WHERE competition_id = ${competitionId}
      AND status IN ('active', 'pending_fingerprint')
  `

  return (rows[0] as { count: number }).count
}

export async function listPublicFeedSubmissions(
  categorySlug: CategorySlug
): Promise<{
  clips: CategoryFeedClip[]
  createdAtByClipId: Map<string, number>
}> {
  if (!isSubmissionsDbConfigured()) {
    return { clips: [], createdAtByClipId: new Map() }
  }

  await ensureSubmissionsSchema()
  const sql = getSql()

  const rows = await sql`
    SELECT *
    FROM competition_submissions
    WHERE category_slug = ${categorySlug}
      AND status IN ('active', 'pending_fingerprint')
    ORDER BY created_at DESC
    LIMIT 50
  `

  const createdAtByClipId = new Map<string, number>()
  const clips = (rows as Parameters<typeof mapSubmissionRow>[0][]).map((row) => {
    const mapped = mapSubmissionRow(row)
    const competition = getCompetitionById(mapped.competitionId)
    const duration = Math.min(
      mapped.payload.video.duration ?? CATEGORY_FEED_MAX_SECONDS,
      CATEGORY_FEED_MAX_SECONDS
    )

    const clipId = buildClipId(mapped.competitionId, mapped.id)
    createdAtByClipId.set(
      clipId,
      new Date(mapped.createdAt).getTime()
    )

    return {
      id: clipId,
      submissionId: mapped.id,
      competitionId: mapped.competitionId,
      competitionTitle:
        competition?.title ?? mapped.challengeTitle,
      judgedBy: competition?.judgedBy ?? "likes",
      athleteName: mapped.athleteName,
      countryCode: "IL",
      videoUrl: mapped.videoUrl,
      posterUrl: mapped.videoUrl.replace("/upload/", "/upload/so_0/"),
      durationSeconds: Math.max(3, Math.round(duration)),
      seedLikeCount: 0,
      source: mapped.source,
    } satisfies CategoryFeedClip
  })

  return { clips, createdAtByClipId }
}
