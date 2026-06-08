import { NextResponse } from "next/server"
import { after } from "next/server"
import {
  buildAISubmissionPayload,
  type CloudinaryVideoUploadResult,
  type CompetitionCategorySlug,
} from "@/lib/submission"
import { getCompetitionById, isCategorySlug } from "@/lib/competitions"
import {
  initialSecurityStatus,
  resolveSubmissionSource,
} from "@/lib/submission-security"
import {
  insertCompetitionSubmission,
  isSubmissionsDbConfigured,
  runSubmissionFingerprintScan,
} from "@/lib/submissions-db"
import { isValidEmail, isValidPhone } from "@/lib/user-account"
import {
  getCaptureMethodForCompetition,
  requiresLiveCameraForCompetition,
  requiresVerifiedUploadForCompetition,
} from "@/lib/upload-policy"
import type { ServerVerificationResult } from "@/lib/video-verification-server"
import { randomUUID } from "node:crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const userEmail =
      typeof body.userEmail === "string" ? body.userEmail.trim() : ""
    const userPhone =
      typeof body.userPhone === "string" ? body.userPhone.trim() : ""
    const athleteName =
      typeof body.athleteName === "string" ? body.athleteName.trim() : ""
    const challengeTitle =
      typeof body.challengeTitle === "string"
        ? body.challengeTitle.trim()
        : ""
    const category = body.category as CompetitionCategorySlug
    const competitionId =
      typeof body.competitionId === "string" ? body.competitionId : ""
    const upload = body.upload as CloudinaryVideoUploadResult
    const captureMethod = body.captureMethod as "live_camera" | "verified_file"
    const captureMeta = body.captureMeta as {
      recordedAt?: string
      liveDurationSeconds?: number
      clientUserAgent?: string
    }
    const verification = body.verification as
      | ServerVerificationResult
      | undefined
    const fileProbe = body.fileProbe as
      | {
          fileName: string
          sha256: string
          hardwareMarkers: string[]
          deviceType?: string
        }
      | undefined

    if (!userId || !athleteName || !challengeTitle) {
      return NextResponse.json(
        { error: "Registered user identity and challenge details are required." },
        { status: 400 }
      )
    }

    if (!isValidEmail(userEmail)) {
      return NextResponse.json(
        { error: "A valid email is required on your profile." },
        { status: 400 }
      )
    }

    if (!isValidPhone(userPhone)) {
      return NextResponse.json(
        { error: "A valid phone number is required on your profile." },
        { status: 400 }
      )
    }

    if (!isCategorySlug(category)) {
      return NextResponse.json(
        { error: "Invalid competition category." },
        { status: 400 }
      )
    }

    if (!upload?.public_id || !upload?.secure_url) {
      return NextResponse.json(
        { error: "Valid Cloudinary upload result is required." },
        { status: 400 }
      )
    }

    const competition = competitionId
      ? getCompetitionById(competitionId)
      : undefined

    if (!competition) {
      return NextResponse.json(
        { error: "Valid competition is required." },
        { status: 400 }
      )
    }

    if (competition.categorySlug !== category) {
      return NextResponse.json(
        { error: "Competition does not match the selected category." },
        { status: 400 }
      )
    }

    const expectedCapture = getCaptureMethodForCompetition(competition)
    if (captureMethod !== expectedCapture) {
      return NextResponse.json(
        {
          error:
            competition.submissionType === "LIVE_CAMERA_ONLY"
              ? "This competition requires live in-app camera recording. File uploads are not allowed."
              : "This competition requires a verified file upload. Live camera recordings are not allowed.",
        },
        { status: 400 }
      )
    }

    if (requiresLiveCameraForCompetition(competition)) {
      if (!captureMeta?.recordedAt) {
        return NextResponse.json(
          { error: "Live capture timestamp is required." },
          { status: 400 }
        )
      }
    }

    if (requiresVerifiedUploadForCompetition(competition)) {
      if (!verification?.verified || !verification?.signature) {
        return NextResponse.json(
          {
            error:
              "File must pass metadata and hardware signature verification before submission.",
          },
          { status: 400 }
        )
      }
      if (!fileProbe?.sha256) {
        return NextResponse.json(
          { error: "File fingerprint (SHA-256) is required for external uploads." },
          { status: 400 }
        )
      }
    }

    const source = resolveSubmissionSource(captureMethod)
    const securityStatus = initialSecurityStatus(source)
    const sha256 =
      fileProbe?.sha256 ?? verification?.fileHash ?? null

    const submission = buildAISubmissionPayload({
      submissionId: randomUUID(),
      competitionId: competition.id,
      user: {
        userId,
        fullName: athleteName,
        email: userEmail,
        phone: userPhone,
      },
      athleteName,
      category,
      challengeTitle,
      description: competition.description,
      upload,
      capture: {
        method: captureMethod,
        recordedAt: captureMeta?.recordedAt,
        liveDurationSeconds: captureMeta?.liveDurationSeconds,
        clientUserAgent: captureMeta?.clientUserAgent,
        verification,
        fileProbe: fileProbe
          ? {
              fileName: fileProbe.fileName,
              sha256: fileProbe.sha256,
              hardwareMarkers: fileProbe.hardwareMarkers ?? [],
              deviceType: fileProbe.deviceType,
            }
          : undefined,
      },
      source,
      securityStatus,
    })

    if (isSubmissionsDbConfigured()) {
      await insertCompetitionSubmission({
        payload: submission,
        source,
        status: securityStatus,
        sha256,
      })

      if (source === "external") {
        after(async () => {
          try {
            await runSubmissionFingerprintScan(submission.submissionId)
          } catch (err) {
            console.error("[fingerprint job]", submission.submissionId, err)
          }
        })
      }
    }

    return NextResponse.json({
      submission,
      security: {
        source,
        status: securityStatus,
        fingerprintQueued: source === "external",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare submission"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
