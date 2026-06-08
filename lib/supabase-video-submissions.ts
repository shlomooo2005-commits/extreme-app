import type { CategorySlug } from "@/lib/competitions"
import { isCategorySlug } from "@/lib/competitions"
import { buildClipId } from "@/lib/feed-likes-store"
import type { AISubmissionPayload } from "@/lib/submission"
import type { SubmissionSource } from "@/lib/submission-security"
import { supabase } from "@/lib/supabaseClient"
import type { DashboardVideoEntry } from "@/lib/dashboard-feed"

export interface VideoSubmissionRow {
  clip_id: string
  submission_id: string
  user_id: string
  competition_id: string
  category_slug: string
  athlete_name: string
  competition_title: string
  video_url: string
  poster_url: string | null
  duration_seconds: number
  source: string
  status: string
  created_at: string
}

function mapRow(row: VideoSubmissionRow): DashboardVideoEntry | null {
  if (!isCategorySlug(row.category_slug)) return null

  return {
    clipId: row.clip_id,
    submissionId: row.submission_id,
    competitionId: row.competition_id,
    categorySlug: row.category_slug,
    competitionTitle: row.competition_title,
    athleteName: row.athlete_name,
    videoUrl: row.video_url,
    posterUrl:
      row.poster_url ??
      row.video_url.replace("/upload/", "/upload/so_0/"),
    durationSeconds: row.duration_seconds,
    source: row.source as SubmissionSource,
    userId: row.user_id,
    createdAt: row.created_at,
  }
}

export async function fetchAllPublicVideosFromSupabase(): Promise<
  DashboardVideoEntry[]
> {
  const { data, error } = await supabase
    .from("video_submissions")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as VideoSubmissionRow[] | null ?? [])
    .map(mapRow)
    .filter((entry): entry is DashboardVideoEntry => entry !== null)
}

export async function publishVideoSubmission(input: {
  payload: AISubmissionPayload
  userId: string
}): Promise<DashboardVideoEntry> {
  const { payload, userId } = input
  const clipId = buildClipId(
    payload.competitionId ?? "",
    payload.submissionId,
  )

  const row = {
    clip_id: clipId,
    submission_id: payload.submissionId,
    user_id: userId,
    competition_id: payload.competitionId ?? "",
    category_slug: payload.category,
    athlete_name: payload.athleteName,
    competition_title: payload.challengeTitle,
    video_url: payload.video.secureUrl,
    poster_url: payload.video.secureUrl.replace("/upload/", "/upload/so_0/"),
    duration_seconds: Math.max(
      3,
      Math.round(payload.video.duration ?? 15),
    ),
    source: payload.security.source,
    status: "published",
  }

  const { data, error } = await supabase
    .from("video_submissions")
    .upsert(row, { onConflict: "submission_id" })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const mapped = mapRow(data as VideoSubmissionRow)
  if (!mapped) {
    throw new Error("Published video has an invalid category.")
  }

  return mapped
}
