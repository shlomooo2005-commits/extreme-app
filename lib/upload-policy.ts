import type { CategorySlug, Competition, SubmissionType } from "@/lib/competitions"
import {
  captureMethodFromSubmissionType,
  getUploadPolicyLabelForType,
} from "@/lib/submission-rules"

/** Must record in-browser — no gallery / file picker */
export const LIVE_CAMERA_CATEGORY_SLUGS = [
  "football",
  "basketball",
  "calisthenics",
  "music",
] as const satisfies readonly CategorySlug[]

/** Action-cam / original file upload with metadata verification */
export const VERIFIED_FILE_CATEGORY_SLUGS = [
  "mountain-biking",
  "surfing",
  "random",
  "extreme",
] as const satisfies readonly CategorySlug[]

export type LiveCameraCategorySlug =
  (typeof LIVE_CAMERA_CATEGORY_SLUGS)[number]

export type VerifiedFileCategorySlug =
  (typeof VERIFIED_FILE_CATEGORY_SLUGS)[number]

export type CaptureMethod = "live_camera" | "verified_file"

export function requiresLiveCamera(slug: CategorySlug): slug is LiveCameraCategorySlug {
  return (LIVE_CAMERA_CATEGORY_SLUGS as readonly string[]).includes(slug)
}

export function requiresVerifiedFile(
  slug: CategorySlug
): slug is VerifiedFileCategorySlug {
  return (VERIFIED_FILE_CATEGORY_SLUGS as readonly string[]).includes(slug)
}

export function getCaptureMethod(slug: CategorySlug): CaptureMethod {
  if (requiresLiveCamera(slug)) return "live_camera"
  if (requiresVerifiedFile(slug)) return "verified_file"
  return "verified_file"
}

/** Prefer competition-level rules when available */
export function getCaptureMethodForCompetition(
  competition: Competition
): CaptureMethod {
  return captureMethodFromSubmissionType(competition.submissionType)
}

export function requiresLiveCameraForCompetition(
  competition: Competition
): boolean {
  return competition.submissionType === "LIVE_CAMERA_ONLY"
}

export function requiresVerifiedUploadForCompetition(
  competition: Competition
): boolean {
  return competition.submissionType === "VERIFIED_UPLOAD"
}

export function getUploadPolicyLabel(slug: CategorySlug): string {
  if (requiresLiveCamera(slug)) {
    return getUploadPolicyLabelForType("LIVE_CAMERA_ONLY")
  }
  return getUploadPolicyLabelForType("VERIFIED_UPLOAD")
}

export function getUploadPolicyLabelForCompetition(
  competition: Competition
): string {
  return getUploadPolicyLabelForType(competition.submissionType)
}

export function getDefaultSubmissionTypeForCategory(
  slug: CategorySlug
): SubmissionType {
  return requiresLiveCamera(slug) ? "LIVE_CAMERA_ONLY" : "VERIFIED_UPLOAD"
}

export const MAX_LIVE_RECORDING_SECONDS = 180
export const MIN_LIVE_RECORDING_SECONDS = 3
export const MAX_FILE_BYTES = 100 * 1024 * 1024
