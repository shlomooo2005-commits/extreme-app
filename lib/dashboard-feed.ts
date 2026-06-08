import type { CategorySlug } from "@/lib/competitions"
import { getCategories, getCategoryBySlug, getCompetitionById } from "@/lib/competitions"
import type { CategoryFeedClip } from "@/lib/category-feed"
import { CATEGORY_FEED_MAX_SECONDS } from "@/lib/category-feed"
import { buildClipId } from "@/lib/feed-likes-store"
import {
  getCategorySectionLabel,
  isSportInterestSlug,
  resolveInterestCategorySlugs,
  SPORT_INTERESTS,
  type SportInterestSlug,
} from "@/lib/sport-interests"
import type { SubmissionSource } from "@/lib/submission-security"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { listPublicFeedSubmissions } from "@/lib/submissions-db"

export interface DashboardVideoEntry {
  clipId: string
  submissionId: string
  competitionId: string
  categorySlug: CategorySlug
  competitionTitle: string
  athleteName: string
  videoUrl: string
  posterUrl: string
  durationSeconds: number
  source: SubmissionSource
  userId: string
  createdAt: string
}

export interface DashboardVideoSection {
  interestSlug: SportInterestSlug | null
  categorySlug: CategorySlug
  label: string
  videos: DashboardVideoEntry[]
}

export interface DashboardVideoFeed {
  forYou: DashboardVideoEntry[]
  sections: DashboardVideoSection[]
  preferredCategorySlugs: CategorySlug[]
  total: number
}

interface VideoSubmissionRow {
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

function isCategorySlugValue(value: string): value is CategorySlug {
  return getCategories().some((category) => category.slug === value)
}

function mapSupabaseRow(row: VideoSubmissionRow): DashboardVideoEntry | null {
  if (!isCategorySlugValue(row.category_slug)) return null

  return {
    clipId: row.clip_id,
    submissionId: row.submission_id,
    competitionId: row.competition_id,
    categorySlug: row.category_slug,
    competitionTitle: row.competition_title,
    athleteName: row.athlete_name,
    videoUrl: row.video_url,
    posterUrl:
      row.poster_url ?? row.video_url.replace("/upload/", "/upload/so_0/"),
    durationSeconds: row.duration_seconds,
    source: row.source as SubmissionSource,
    userId: row.user_id,
    createdAt: row.created_at,
  }
}

function mapCategoryFeedClip(clip: CategoryFeedClip): DashboardVideoEntry | null {
  const competition = getCompetitionById(clip.competitionId)
  const categorySlug = competition?.categorySlug
  if (!categorySlug) return null

  return {
    clipId: clip.id,
    submissionId: clip.submissionId ?? clip.id.split(":").pop() ?? clip.id,
    competitionId: clip.competitionId,
    categorySlug,
    competitionTitle: clip.competitionTitle,
    athleteName: clip.athleteName,
    videoUrl: clip.videoUrl,
    posterUrl: clip.posterUrl,
    durationSeconds: clip.durationSeconds,
    source: clip.source,
    userId: "",
    createdAt: new Date().toISOString(),
  }
}

async function fetchAllPublicVideosFromSupabaseServer(): Promise<DashboardVideoEntry[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("video_submissions")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data as VideoSubmissionRow[] | null ?? [])
    .map(mapSupabaseRow)
    .filter((entry): entry is DashboardVideoEntry => entry !== null)
}

async function fetchFallbackVideosFromPostgres(): Promise<DashboardVideoEntry[]> {
  const categories = getCategories().map((category) => category.slug)
  const merged = new Map<string, DashboardVideoEntry>()

  for (const categorySlug of categories) {
    const { clips } = await listPublicFeedSubmissions(categorySlug)
    for (const clip of clips) {
      const entry = mapCategoryFeedClip(clip)
      if (!entry || merged.has(entry.clipId)) continue
      merged.set(entry.clipId, entry)
    }
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

/** Fetch every public uploaded video from Supabase (all users), with Postgres fallback. */
export async function fetchPublicDashboardVideos(): Promise<DashboardVideoEntry[]> {
  let supabaseVideos: DashboardVideoEntry[] = []

  try {
    supabaseVideos = await fetchAllPublicVideosFromSupabaseServer()
  } catch {
    supabaseVideos = []
  }

  const bySubmission = new Map<string, DashboardVideoEntry>()
  for (const video of supabaseVideos) {
    bySubmission.set(video.submissionId, video)
  }

  const postgresVideos = await fetchFallbackVideosFromPostgres()
  for (const video of postgresVideos) {
    if (!bySubmission.has(video.submissionId)) {
      bySubmission.set(video.submissionId, video)
    }
  }

  return [...bySubmission.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

function groupVideosByCategory(
  videos: DashboardVideoEntry[],
): Map<CategorySlug, DashboardVideoEntry[]> {
  const grouped = new Map<CategorySlug, DashboardVideoEntry[]>()

  for (const video of videos) {
    const existing = grouped.get(video.categorySlug) ?? []
    existing.push(video)
    grouped.set(video.categorySlug, existing)
  }

  return grouped
}

function buildInterestVideoSections(
  videos: DashboardVideoEntry[],
  preferredInterests: string[],
): DashboardVideoSection[] {
  const grouped = groupVideosByCategory(videos)
  const sections: DashboardVideoSection[] = []
  const seenInterests = new Set<SportInterestSlug>()

  for (const interestSlug of preferredInterests) {
    if (!isSportInterestSlug(interestSlug) || seenInterests.has(interestSlug)) {
      continue
    }

    const interest = SPORT_INTERESTS.find((item) => item.slug === interestSlug)
    if (!interest) continue

    const sectionVideos = grouped.get(interest.categorySlug) ?? []
    if (sectionVideos.length === 0) continue

    seenInterests.add(interestSlug)
    sections.push({
      interestSlug,
      categorySlug: interest.categorySlug,
      label: interest.label,
      videos: sectionVideos,
    })
  }

  return sections
}

function sortVideosByPreference(
  videos: DashboardVideoEntry[],
  preferredCategorySlugs: CategorySlug[],
): DashboardVideoEntry[] {
  const order = new Map(
    preferredCategorySlugs.map((slug, index) => [slug, index]),
  )

  return [...videos].sort((a, b) => {
    const aOrder = order.get(a.categorySlug) ?? Number.MAX_SAFE_INTEGER
    const bOrder = order.get(b.categorySlug) ?? Number.MAX_SAFE_INTEGER
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function buildDashboardVideoFeed(
  videos: DashboardVideoEntry[],
  preferredInterests: string[] = [],
): DashboardVideoFeed {
  const preferredCategorySlugs = resolveInterestCategorySlugs(preferredInterests)

  const forYou =
    preferredCategorySlugs.length > 0
      ? sortVideosByPreference(
          videos.filter((video) =>
            preferredCategorySlugs.includes(video.categorySlug),
          ),
          preferredCategorySlugs,
        )
      : []

  const forYouIds = new Set(forYou.map((video) => video.clipId))
  const remainingVideos = videos.filter((video) => !forYouIds.has(video.clipId))

  const interestSections = buildInterestVideoSections(
    remainingVideos,
    preferredInterests,
  )
  const coveredCategorySlugs = new Set(
    interestSections.map((section) => section.categorySlug),
  )

  const grouped = groupVideosByCategory(remainingVideos)
  const otherSections: DashboardVideoSection[] = []

  for (const [categorySlug, sectionVideos] of grouped) {
    if (coveredCategorySlugs.has(categorySlug)) continue

    otherSections.push({
      interestSlug: null,
      categorySlug,
      label:
        getCategorySectionLabel(categorySlug, preferredInterests) ||
        getCategoryBySlug(categorySlug)?.name ||
        categorySlug,
      videos: sectionVideos,
    })
  }

  otherSections.sort((a, b) => a.label.localeCompare(b.label))

  return {
    forYou,
    sections: [...interestSections, ...otherSections],
    preferredCategorySlugs,
    total: videos.length,
  }
}

export function dashboardVideoFromPayload(
  payload: {
    submissionId: string
    competitionId?: string
    category: CategorySlug
    athleteName: string
    challengeTitle: string
    video: { secureUrl: string; duration?: number }
    source: SubmissionSource
  },
  userId: string,
): DashboardVideoEntry {
  const competitionId = payload.competitionId ?? ""
  const clipId = buildClipId(competitionId, payload.submissionId)

  return {
    clipId,
    submissionId: payload.submissionId,
    competitionId,
    categorySlug: payload.category,
    competitionTitle: payload.challengeTitle,
    athleteName: payload.athleteName,
    videoUrl: payload.video.secureUrl,
    posterUrl: payload.video.secureUrl.replace("/upload/", "/upload/so_0/"),
    durationSeconds: Math.min(
      CATEGORY_FEED_MAX_SECONDS,
      Math.max(3, Math.round(payload.video.duration ?? 15)),
    ),
    source: payload.source,
    userId,
    createdAt: new Date().toISOString(),
  }
}
