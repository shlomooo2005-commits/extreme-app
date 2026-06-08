import {
  getCategoryOptions,
  type CategorySlug,
  isCategorySlug,
} from "@/lib/competitions"
import type {
  SubmissionSecurityStatus,
  SubmissionSource,
} from "@/lib/submission-security"
import {
  initialSecurityStatus,
  resolveSubmissionSource,
} from "@/lib/submission-security"
import type { CaptureMethod } from "@/lib/upload-policy"
import type { ServerVerificationResult } from "@/lib/video-verification-server"

export type { SubmissionSource, SubmissionSecurityStatus }

export const COMPETITION_CATEGORIES = getCategoryOptions()

export type CompetitionCategorySlug = CategorySlug

export { isCategorySlug as isCompetitionCategorySlug }

export type SubmissionStatus =
  | "uploaded"
  | "queued_for_ai"
  | "judging"
  | "complete"
  | "flagged_duplicate"
  | "pending_fingerprint"

/** Payload shape for your AI judging pipeline */
export interface SubmissionUserIdentity {
  userId: string
  fullName: string
  email: string
  phone: string
}

export interface AISubmissionPayload {
  submissionId: string
  competitionId?: string
  user: SubmissionUserIdentity
  athleteName: string
  category: CompetitionCategorySlug
  challengeTitle: string
  description: string
  video: {
    publicId: string
    url: string
    secureUrl: string
    duration?: number
    format?: string
    bytes?: number
    width?: number
    height?: number
  }
  status: SubmissionStatus
  submittedAt: string
  capture: {
    method: CaptureMethod
    recordedAt?: string
    liveDurationSeconds?: number
    verification?: ServerVerificationResult
    clientUserAgent?: string
    fileProbe?: {
      fileName: string
      sha256: string
      hardwareMarkers: string[]
      deviceType?: string
    }
  }
  security: {
    source: SubmissionSource
    status: SubmissionSecurityStatus
    fingerprint?: {
      scannedAt: string
      flags: string[]
      matchedPlatform?: string
      confidence?: number
      summary?: string
    }
  }
  aiJudging: {
    ready: boolean
    pipelineVersion: string
    requestedAt: string
    tags: string[]
    context: {
      categoryLabel: string
      notes: string
    }
  }
}

export interface CloudinaryVideoUploadResult {
  public_id: string
  secure_url: string
  url: string
  duration?: number
  format?: string
  bytes?: number
  width?: number
  height?: number
}

export function buildAISubmissionPayload(input: {
  submissionId: string
  competitionId?: string
  user: SubmissionUserIdentity
  athleteName: string
  category: CompetitionCategorySlug
  challengeTitle: string
  description: string
  upload: CloudinaryVideoUploadResult
  capture: AISubmissionPayload["capture"]
  source?: SubmissionSource
  securityStatus?: SubmissionSecurityStatus
}): AISubmissionPayload {
  const categoryLabel =
    COMPETITION_CATEGORIES.find((c) => c.slug === input.category)?.label ??
    input.category

  const submittedAt = new Date().toISOString()
  const source =
    input.source ?? resolveSubmissionSource(input.capture.method)
  const securityStatus =
    input.securityStatus ?? initialSecurityStatus(source)

  const pipelineStatus: SubmissionStatus =
    securityStatus === "pending_fingerprint"
      ? "pending_fingerprint"
      : securityStatus === "flagged_duplicate"
        ? "flagged_duplicate"
        : "queued_for_ai"

  return {
    submissionId: input.submissionId,
    competitionId: input.competitionId,
    user: {
      userId: input.user.userId,
      fullName: input.user.fullName.trim(),
      email: input.user.email.trim(),
      phone: input.user.phone.trim(),
    },
    athleteName: input.athleteName.trim(),
    category: input.category,
    challengeTitle: input.challengeTitle.trim(),
    description: input.description.trim(),
    video: {
      publicId: input.upload.public_id,
      url: input.upload.url,
      secureUrl: input.upload.secure_url,
      duration: input.upload.duration,
      format: input.upload.format,
      bytes: input.upload.bytes,
      width: input.upload.width,
      height: input.upload.height,
    },
    status: pipelineStatus,
    submittedAt,
    capture: input.capture,
    security: {
      source,
      status: securityStatus,
    },
    aiJudging: {
      ready: true,
      pipelineVersion: "1.0.0",
      requestedAt: submittedAt,
      tags: [
        "competition",
        input.category,
        "pending-ai-judge",
        input.capture.method,
        `source:${source}`,
        `security:${securityStatus}`,
        input.capture.verification?.trustLevel ?? "live_capture",
        `athlete:${slugify(input.athleteName)}`,
        `user:${input.user.userId}`,
      ],
      context: {
        categoryLabel,
        notes:
          source === "app_camera"
            ? "Verified in-app camera capture (תג מקוריות מאומתת)."
            : securityStatus === "pending_fingerprint"
              ? "External upload queued for video fingerprint anti-plagiarism scan."
              : input.capture.verification?.aiScreeningNote ??
                "Ready for automated skill, style, and authenticity scoring.",
      },
    },
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "anonymous"
}
