import { NextResponse } from "next/server"
import { getCompetitionById } from "@/lib/competitions"
import {
  countSubmissionsInCompetition,
  getCompetitionSubmissionRanks,
  isSubmissionsDbConfigured,
  listSubmissionsByUserId,
} from "@/lib/submissions-db"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  fetchUserVideoSubmissionsFromSupabase,
  type VideoSubmissionRow,
} from "@/lib/supabase-video-submissions"

export interface UserSubmissionSummary {
  id: string
  competitionId: string
  challengeTitle: string
  categorySlug: string
  videoUrl: string
  posterUrl: string
  status: string
  submittedAt: string
  rank: number | null
  totalInCompetition: number | null
  likesCount: number | null
}

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization")
  if (!header?.startsWith("Bearer ")) return null
  return header.slice(7).trim()
}

async function resolveAuthenticatedUserId(
  request: Request,
): Promise<string | null> {
  const token = getBearerToken(request)
  if (!token) return null

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

function mapSupabaseRow(row: VideoSubmissionRow): UserSubmissionSummary {
  const competition = getCompetitionById(row.competition_id)

  return {
    id: row.submission_id,
    competitionId: row.competition_id,
    challengeTitle: competition?.title ?? row.competition_title,
    categorySlug: row.category_slug,
    videoUrl: row.video_url,
    posterUrl:
      row.poster_url ?? row.video_url.replace("/upload/", "/upload/so_0/"),
    status: row.status,
    submittedAt: row.created_at,
    rank: null,
    totalInCompetition: null,
    likesCount: null,
  }
}

async function enrichWithRankings(
  submissions: UserSubmissionSummary[],
): Promise<UserSubmissionSummary[]> {
  if (!isSubmissionsDbConfigured() || submissions.length === 0) {
    return submissions
  }

  const rankCache = new Map<
    string,
    Awaited<ReturnType<typeof getCompetitionSubmissionRanks>>
  >()
  const totalCache = new Map<string, number>()
  const enriched: UserSubmissionSummary[] = []

  for (const submission of submissions) {
    if (!rankCache.has(submission.competitionId)) {
      rankCache.set(
        submission.competitionId,
        await getCompetitionSubmissionRanks(submission.competitionId),
      )
      totalCache.set(
        submission.competitionId,
        await countSubmissionsInCompetition(submission.competitionId),
      )
    }

    const ranks = rankCache.get(submission.competitionId) ?? []
    const standing = ranks.find((entry) => entry.submissionId === submission.id)

    enriched.push({
      ...submission,
      rank: standing?.rank ?? submission.rank,
      totalInCompetition:
        totalCache.get(submission.competitionId) ?? submission.totalInCompetition,
      likesCount: standing?.likesCount ?? submission.likesCount,
    })
  }

  return enriched
}

export async function GET(request: Request) {
  const userId = await resolveAuthenticatedUserId(request)

  if (!userId) {
    return NextResponse.json(
      { error: "Sign in required to view your uploads." },
      { status: 401 },
    )
  }

  try {
    const byId = new Map<string, UserSubmissionSummary>()

    const supabaseRows = await fetchUserVideoSubmissionsFromSupabase(userId)
    for (const row of supabaseRows) {
      byId.set(row.submission_id, mapSupabaseRow(row))
    }

    if (isSubmissionsDbConfigured()) {
      const postgresRows = await listSubmissionsByUserId(userId)
      for (const row of postgresRows) {
        if (byId.has(row.id)) continue

        const competition = getCompetitionById(row.competitionId)
        byId.set(row.id, {
          id: row.id,
          competitionId: row.competitionId,
          challengeTitle: competition?.title ?? row.challengeTitle,
          categorySlug: row.categorySlug,
          videoUrl: row.videoUrl,
          posterUrl: row.videoUrl.replace("/upload/", "/upload/so_0/"),
          status: row.status,
          submittedAt: row.createdAt,
          rank: null,
          totalInCompetition: null,
          likesCount: null,
        })
      }
    }

    const submissions = [...byId.values()].sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )

    const enriched = await enrichWithRankings(submissions)

    return NextResponse.json({
      submissions: enriched,
      total: enriched.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load submissions."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
