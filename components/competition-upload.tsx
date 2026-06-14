"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Flame, Loader2, Lock, Upload } from "lucide-react"
import {
  getActiveCompetitionsByCategory,
  getCompetitionById,
  resolveCompetitionId,
} from "@/lib/competitions"
import { getSubmissionRules } from "@/lib/submission-rules"
import { uploadVideoToCloudinary } from "@/lib/upload-cloudinary"
import { getUploadIdentity, isUploadUnlocked } from "@/lib/auth-bridge"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { useUserAccount } from "@/hooks/use-user-account"
import { PersonalDetailsForm } from "@/components/profile/personal-details-form"
import { SubmissionSourceBadge } from "@/components/submission-source-badge"
import { getKaraokeChallengeForCompetition } from "@/lib/karaoke-challenges"
import { KaraokeCameraRecorder } from "./karaoke-camera-recorder"
import { LiveCameraRecorder } from "./live-camera-recorder"
import { VerifiedFileUpload } from "./verified-file-upload"
import {
  COMPETITION_CATEGORIES,
  type AISubmissionPayload,
  type CompetitionCategorySlug,
} from "@/lib/submission"
import type { ServerVerificationResult } from "@/lib/video-verification-server"

type Step = "form" | "uploading" | "preparing" | "success" | "error"

interface CompetitionUploadProps {
  defaultCategory?: CompetitionCategorySlug
  defaultCompetitionId?: string
}

const UPLOAD_LOCKED_MESSAGE =
  "Sign in or enter your personal details so we can link your uploads to your profile."

function resolveInitialCompetitionId(
  category: CompetitionCategorySlug,
  preferredId?: string
): string {
  const active = getActiveCompetitionsByCategory(category)
  const resolvedId = preferredId ? resolveCompetitionId(preferredId) : undefined
  if (resolvedId && active.some((c) => c.id === resolvedId)) {
    return resolvedId
  }
  return active[0]?.id ?? ""
}

function StepBadge({
  number,
  label,
  active,
  complete,
}: {
  number: number
  label: string
  active: boolean
  complete: boolean
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
          complete
            ? "bg-[#22c55e] text-black"
            : active
              ? "bg-gradient-to-br from-[#00e5ff] to-[#8b5cf6] text-black"
              : "bg-white/10 text-muted-foreground"
        }`}
      >
        {complete ? "✓" : number}
      </span>
      <span
        className={`text-xs uppercase tracking-[0.2em] sm:text-sm ${
          active || complete ? "hobbyx-label-title" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  )
}

export function CompetitionUpload({
  defaultCategory = "mountain-biking",
  defaultCompetitionId,
}: CompetitionUploadProps) {
  const { user, loading: sessionLoading } = useSupabaseSession()
  const { account, ready, hasPersonalDetails, savePersonalDetails } =
    useUserAccount()

  const [step, setStep] = useState<Step>("form")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [submission, setSubmission] = useState<AISubmissionPayload | null>(null)

  const [category, setCategory] =
    useState<CompetitionCategorySlug>(defaultCategory)
  const [competitionId, setCompetitionId] = useState(() =>
    resolveInitialCompetitionId(defaultCategory, defaultCompetitionId)
  )

  const [challengeTitle, setChallengeTitle] = useState("")

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [liveMeta, setLiveMeta] = useState<{
    recordedAt: string
    durationSeconds: number
  } | null>(null)
  const [verification, setVerification] =
    useState<ServerVerificationResult | null>(null)
  const [fileProbe, setFileProbe] = useState<{
    fileName: string
    sha256: string
    hardwareMarkers: string[]
    deviceType?: string
  } | null>(null)

  const activeCompetitions = useMemo(
    () => getActiveCompetitionsByCategory(category),
    [category]
  )

  const competition = useMemo(
    () => getCompetitionById(competitionId),
    [competitionId]
  )

  const rules = useMemo(
    () => (competition ? getSubmissionRules(competition) : null),
    [competition]
  )

  const karaokeChallenge = useMemo(
    () =>
      competition
        ? getKaraokeChallengeForCompetition(
            competition.id,
            competition.karaokeChallengeId
          )
        : null,
    [competition]
  )

  const uploadUnlocked = isUploadUnlocked(user, account, ready)

  useEffect(() => {
    if (!activeCompetitions.some((c) => c.id === competitionId)) {
      const nextId = activeCompetitions[0]?.id ?? ""
      setCompetitionId(nextId)
    }
  }, [activeCompetitions, competitionId])

  useEffect(() => {
    if (competition) {
      setChallengeTitle(competition.title)
    }
  }, [competition])

  const clearMedia = () => {
    setVideoFile(null)
    setLiveMeta(null)
    setVerification(null)
    setFileProbe(null)
  }

  const onCategoryChange = (next: CompetitionCategorySlug) => {
    setCategory(next)
    clearMedia()
    setCompetitionId(resolveInitialCompetitionId(next))
  }

  const onCompetitionChange = (nextId: string) => {
    setCompetitionId(nextId)
    clearMedia()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const identity = getUploadIdentity(user, account)
    if (!uploadUnlocked || !identity) {
      setError(UPLOAD_LOCKED_MESSAGE)
      return
    }

    if (!competition || !rules) {
      setError("Select a valid competition.")
      return
    }

    if (!videoFile) {
      setError(
        rules.isLiveCamera
          ? "Record your video with the live camera before submitting."
          : "Upload and verify your video file before submitting."
      )
      return
    }

    const resolvedTitle = karaokeChallenge
      ? (competition.title.trim() || challengeTitle.trim())
      : challengeTitle.trim()

    if (!resolvedTitle) {
      setError("Challenge title is required.")
      return
    }

    if (rules.isLiveCamera && !liveMeta) {
      setError("Live capture metadata is missing. Please re-record.")
      return
    }

    if (rules.isVerifiedUpload && !verification?.verified) {
      setError("File must pass verification before submission.")
      return
    }

    try {
      setStep("uploading")
      setProgress(0)

      const uploadResult = await uploadVideoToCloudinary(
        videoFile,
        category,
        setProgress
      )

      setStep("preparing")

      const prepareRes = await fetch("/api/submissions/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: identity.userId,
          userEmail: identity.email,
          userPhone: identity.phone,
          competitionId: competition.id,
          athleteName: identity.fullName,
          challengeTitle: resolvedTitle,
          category,
          upload: uploadResult,
          captureMethod: rules.captureMethod,
          captureMeta: rules.isLiveCamera
            ? {
                recordedAt: liveMeta!.recordedAt,
                liveDurationSeconds: liveMeta!.durationSeconds,
                clientUserAgent:
                  typeof navigator !== "undefined"
                    ? navigator.userAgent
                    : undefined,
              }
            : {
                recordedAt: verification!.serverVerifiedAt,
                clientUserAgent:
                  typeof navigator !== "undefined"
                    ? navigator.userAgent
                    : undefined,
              },
          verification: rules.isLiveCamera ? undefined : verification,
          fileProbe: rules.isVerifiedUpload ? fileProbe ?? undefined : undefined,
        }),
      })

      if (!prepareRes.ok) {
        const data = await prepareRes.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to prepare submission for AI")
      }

      const { submission: payload } = await prepareRes.json()
      setSubmission(payload)

      const queueKey = "hobbyx-ai-submission-queue"
      const existing = JSON.parse(localStorage.getItem(queueKey) ?? "[]")
      existing.push(payload)
      localStorage.setItem(queueKey, JSON.stringify(existing))

      setStep("success")
    } catch (err) {
      setStep("error")
      setError(err instanceof Error ? err.message : "Submission failed")
    }
  }

  if (!ready || sessionLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00e5ff] border-t-transparent" />
      </div>
    )
  }

  if (step === "success" && submission) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-1">
        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-[#4ade80]" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            Submission received
          </h2>
          <p className="mt-2 text-sm text-foreground/65 sm:text-base">
            Linked to {submission.user.fullName} ({submission.user.email})
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <SubmissionSourceBadge source={submission.security.source} />
          </div>
          {submission.security.status === "pending_fingerprint" && (
            <p className="mt-3 text-xs text-amber-200/90">
              External upload — video fingerprint anti-plagiarism scan running.
              Your clip appears in the public feed only after it passes.
            </p>
          )}
          {submission.security.source === "app_camera" && (
            <p className="mt-3 text-xs text-emerald-200/90" dir="rtl">
              תג מקוריות מאומתת — Verified Original in-app capture.
            </p>
          )}
          <p className="mt-4 font-mono text-xs text-foreground/45">
            ID: {submission.submissionId}
          </p>
        </div>

        {submission.video.secureUrl && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <video
              src={submission.video.secureUrl}
              controls
              className="aspect-video h-48 w-full bg-black sm:h-56 md:h-64"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold uppercase tracking-wider text-foreground"
          >
            Back home
          </Link>
          <Link
            href="/profile"
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b5cf6] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black"
          >
            Personal area
          </Link>
        </div>
      </div>
    )
  }

  const isBusy = step === "uploading" || step === "preparing"
  const canRecordMedia = uploadUnlocked && !isBusy
  const canSubmit =
    uploadUnlocked &&
    Boolean(competition && rules) &&
    Boolean(videoFile) &&
    (rules?.isLiveCamera ? Boolean(liveMeta) : Boolean(verification?.verified))

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 overflow-x-hidden px-1">
      {/* Step 1 — Account */}
      <section aria-labelledby="step-personal">
        <StepBadge
          number={1}
          label={user ? "Signed in" : "Personal details (required)"}
          active={!uploadUnlocked}
          complete={uploadUnlocked}
        />
        {user ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            Signed in with your phone session. Uploads are linked to your account
            automatically.
          </div>
        ) : (
          <PersonalDetailsForm
            variant="step"
            initialAccount={account}
            submitLabel="Save personal details"
            onSave={(data) => savePersonalDetails(data)}
          />
        )}
        {!user && !uploadUnlocked && (
          <p className="mt-3 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login?next=/submit" className="font-semibold text-[#0284c7] hover:underline">
              Sign in with phone
            </Link>
          </p>
        )}
      </section>

      {/* Step 2 — Video upload */}
      <section
        aria-labelledby="step-upload"
        className={`rounded-2xl border p-4 transition-opacity sm:p-5 md:p-6 ${
          uploadUnlocked
            ? "border-[#ff6b00]/30 bg-card/60"
            : "border-border bg-card/30 opacity-90"
        }`}
        style={
          uploadUnlocked
            ? { boxShadow: "inset 4px 0 0 0 #ff6b00" }
            : undefined
        }
      >
        <StepBadge
          number={2}
          label="Upload video"
          active={uploadUnlocked}
          complete={false}
        />

        {!uploadUnlocked && (
          <div
            className="mb-5 flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
            role="status"
          >
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-sm leading-relaxed text-amber-100/90">
              {UPLOAD_LOCKED_MESSAGE}
            </p>
          </div>
        )}

        <div
          className={`min-w-0 space-y-5 ${
            !uploadUnlocked ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <fieldset
            disabled={!uploadUnlocked || isBusy}
            className="min-w-0 space-y-5 border-0 p-0 disabled:opacity-60"
          >
          <div className="space-y-2">
            <label
              htmlFor="competition"
              className="hobbyx-setting-label text-xs sm:text-sm"
            >
              Competition
            </label>
            <select
              id="competition"
              value={competitionId}
              onChange={(e) => onCompetitionChange(e.target.value)}
              disabled={isBusy || activeCompetitions.length === 0}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#ff6b00] focus:outline-none disabled:opacity-60 sm:text-base"
            >
              {activeCompetitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            {rules && (
              <p className="rounded-lg border border-border bg-background/80 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
                <span className="font-semibold text-foreground">{rules.typeLabel}</span>
                {" — "}
                {rules.policyLabel}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="hobbyx-setting-label text-xs sm:text-sm"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as CompetitionCategorySlug)
              }
              disabled={isBusy}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#ff6b00] focus:outline-none sm:text-base"
            >
              {COMPETITION_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {!karaokeChallenge && (
            <div className="space-y-2">
              <label
                htmlFor="challengeTitle"
                className="hobbyx-setting-label text-xs sm:text-sm"
              >
                Title
              </label>
              <input
                id="challengeTitle"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                disabled={isBusy}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#ff6b00] focus:outline-none sm:text-base"
              />
            </div>
          )}
          </fieldset>

          {rules && (
            <div className="space-y-3">
              <span className="hobbyx-setting-label text-xs sm:text-sm">
                {rules.isLiveCamera ? "Live camera (required)" : "File selection"}
              </span>

              {rules.isLiveCamera ? (
                karaokeChallenge ? (
                  <KaraokeCameraRecorder
                    key={`karaoke-${competitionId}`}
                    config={karaokeChallenge}
                    competitionId={competitionId}
                    disabled={!canRecordMedia}
                    onRecorded={(file, meta) => {
                      setVideoFile(file)
                      setLiveMeta(meta)
                      setVerification(null)
                      setError(null)
                    }}
                    onClear={clearMedia}
                  />
                ) : (
                  <LiveCameraRecorder
                    key={`live-${competitionId}`}
                    category={category}
                    competitionId={competitionId}
                    maxRecordingSeconds={
                      competition?.maxVideoSeconds ?? undefined
                    }
                    disabled={!canRecordMedia}
                    onRecorded={(file, meta) => {
                      setVideoFile(file)
                      setLiveMeta(meta)
                      setVerification(null)
                      setError(null)
                    }}
                    onClear={clearMedia}
                  />
                )
              ) : (
                <VerifiedFileUpload
                  key={`file-${competitionId}`}
                  category={category}
                  maxVideoSeconds={competition?.maxVideoSeconds}
                  disabled={!canRecordMedia}
                  onVerified={(file, result, probe) => {
                    setVideoFile(file)
                    setVerification(result)
                    setFileProbe({
                      fileName: probe.fileName,
                      sha256: probe.sha256,
                      hardwareMarkers: probe.hardwareMarkers,
                      deviceType: probe.deviceType,
                    })
                    setLiveMeta(null)
                    setError(null)
                  }}
                  onClear={clearMedia}
                />
              )}
            </div>
          )}

          {isBusy && (
            <div className="space-y-2 rounded-xl border border-border bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[#00e5ff]" />
                {step === "uploading"
                  ? `Uploading… ${progress}%`
                  : "Preparing for AI judging…"}
              </div>
              {step === "uploading" && (
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#00e5ff] to-[#ff6b00] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={isBusy || !canSubmit}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff6b00] via-[#ffcc00] to-[#22c55e] px-6 py-4 text-xs font-black uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload video
              </>
            )}
          </button>
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Prizes require bank details later — add them anytime in{" "}
        <Link href="/profile" className="text-[#4ade80] underline">
          Personal Area
        </Link>
        .
      </p>
    </div>
  )
}
