import { NextResponse } from "next/server"
import { getCompetitionById } from "@/lib/competitions"
import {
  countSubmissionsInCompetition,
  getCompetitionSubmissionRanks,
  isSubmissionsDbConfigured,
  listSubmissionsByUserId,
} from "@/lib/submissions-db"

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")?.trim()

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 })
  }

  if (!isSubmissionsDbConfigured()) {
    return NextResponse.json({ submissions: [], total: 0 })
  }

  try {
    const rows = await listSubmissionsByUserId(userId)
    const rankCache = new Map<string, Awaited<ReturnType<typeof getCompetitionSubmissionRanks>>>()
    const totalCache = new Map<string, number>()

    const submissions: UserSubmissionSummary[] = []

    for (const row of rows) {
      if (!rankCache.has(row.competitionId)) {
        rankCache.set(
          row.competitionId,
          await getCompetitionSubmissionRanks(row.competitionId),
        )
        totalCache.set(
          row.competitionId,
          await countSubmissionsInCompetition(row.competitionId),
        )
      }

      const ranks = rankCache.get(row.competitionId) ?? []
      const standing = ranks.find((entry) => entry.submissionId === row.id)
      const competition = getCompetitionById(row.competitionId)

      submissions.push({
        id: row.id,
        competitionId: row.competitionId,
        challengeTitle: competition?.title ?? row.challengeTitle,
        categorySlug: row.categorySlug,
        videoUrl: row.videoUrl,
        posterUrl: row.videoUrl.replace("/upload/", "/upload/so_0/"),
        status: row.status,
        submittedAt: row.createdAt,
        rank: standing?.rank ?? null,
        totalInCompetition: totalCache.get(row.competitionId) ?? null,
        likesCount: standing?.likesCount ?? null,
      })
    }

    return NextResponse.json({
      submissions,
      total: submissions.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load submissions."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
