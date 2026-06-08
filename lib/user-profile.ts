/**
 * Athlete profile — edit DEMO_USER and USER_SUBMISSIONS to update the profile UI.
 */

import {
  getCategoryBySlug,
  getCompetitionById,
  type CategorySlug,
} from "@/lib/competitions"
import type { LeaderboardScoreBreakdown } from "@/lib/leaderboard"
import type { CaptureMethod } from "@/lib/upload-policy"
import { getSubmissionsForUser } from "@/lib/user-submissions-store"

export interface AthleteProfile {
  id: string
  displayName: string
  username: string
  countryCode: string
  countryName: string
  bio: string
  memberSince: string
  season: string
  avatarInitials: string
  social?: {
    instagram?: string
    youtube?: string
  }
}

export interface UserSubmission {
  id: string
  competitionId: string
  categorySlug: CategorySlug
  challengeTitle: string
  aiScore: number
  rank: number
  totalEntrants: number
  scoreBreakdown: LeaderboardScoreBreakdown
  videoThumbnailUrl: string
  videoUrl: string
  submittedAt: string
  captureMethod: CaptureMethod
  status: "complete" | "judging" | "queued_for_ai"
}

/** Demo athlete — matches header initials "JD" */
export const DEMO_USER: AthleteProfile = {
  id: "user-jordan-davis",
  displayName: "Jordan Davis",
  username: "jordanrides",
  countryCode: "US",
  countryName: "United States",
  bio: "MTB & calisthenics. Chasing podiums in Season 4 — upload clean, ride dirty.",
  memberSince: "2025-11-01",
  season: "Season 4",
  avatarInitials: "JD",
  social: {
    instagram: "@jordanrides_hobbyx",
    youtube: "Jordan Davis MTB",
  },
}

/** No demo submission history — profile uses real uploads from local store / API. */
export const USER_SUBMISSIONS: UserSubmission[] = []

export interface ProfileStats {
  totalSubmissions: number
  completedSubmissions: number
  averageAiScore: number
  bestAiScore: number
  podiumFinishes: number
  firstPlaceWins: number
  categoriesCompeted: number
  liveCaptures: number
  verifiedUploads: number
}

export function getDemoUser(): AthleteProfile {
  return DEMO_USER
}

function storedPayloadToUserSubmission(
  record: ReturnType<typeof getSubmissionsForUser>[number]
): UserSubmission {
  const { payload } = record
  return {
    id: payload.submissionId,
    competitionId: payload.competitionId ?? "",
    categorySlug: payload.category,
    challengeTitle: payload.challengeTitle,
    aiScore: 0,
    rank: 0,
    totalEntrants: 0,
    scoreBreakdown: { skill: 0, style: 0, difficulty: 0, authenticity: 0 },
    videoThumbnailUrl: payload.video.secureUrl,
    videoUrl: payload.video.secureUrl,
    submittedAt: payload.submittedAt,
    captureMethod: payload.capture.method,
    status: "queued_for_ai",
  }
}

export function getUserSubmissions(userId: string = DEMO_USER.id): UserSubmission[] {
  const fromStore = getSubmissionsForUser(userId).map(storedPayloadToUserSubmission)
  if (fromStore.length > 0) {
    return fromStore
  }
  if (userId !== DEMO_USER.id) return []
  return [...USER_SUBMISSIONS].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
}

export function computeProfileStats(submissions: UserSubmission[]): ProfileStats {
  const completed = submissions.filter((s) => s.status === "complete")
  const scores = completed.map((s) => s.aiScore)
  const categories = new Set(completed.map((s) => s.categorySlug))

  return {
    totalSubmissions: submissions.length,
    completedSubmissions: completed.length,
    averageAiScore:
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0,
    bestAiScore: scores.length > 0 ? Math.max(...scores) : 0,
    podiumFinishes: completed.filter((s) => s.rank >= 1 && s.rank <= 3).length,
    firstPlaceWins: completed.filter((s) => s.rank === 1).length,
    categoriesCompeted: categories.size,
    liveCaptures: submissions.filter((s) => s.captureMethod === "live_camera")
      .length,
    verifiedUploads: submissions.filter(
      (s) => s.captureMethod === "verified_file"
    ).length,
  }
}

export function getSubmissionMeta(submission: UserSubmission) {
  const competition = getCompetitionById(submission.competitionId)
  const category = getCategoryBySlug(submission.categorySlug)
  return { competition, category }
}

export { countryCodeToFlag } from "@/lib/leaderboard"
