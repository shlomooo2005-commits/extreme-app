"use client"

import { useEffect, useState } from "react"
import { Loader2, Upload, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { Competition } from "@/lib/competitions"
import { getUploadIdentity } from "@/lib/auth-bridge"
import { getSubmissionRules } from "@/lib/submission-rules"
import { isValidEmail } from "@/lib/user-account"
import { uploadVideoToCloudinary } from "@/lib/upload-cloudinary"
import type { ClientFileProbe } from "@/lib/video-verification"
import type { ServerVerificationResult } from "@/lib/video-verification-server"
import { VerifiedFileUpload } from "@/components/verified-file-upload"

type UploadStep = "form" | "uploading" | "preparing" | "success" | "error"

interface DashboardUploadModalProps {
  open: boolean
  competitions: Competition[]
  user: User
  onClose: () => void
  onPublished?: () => void
}

export function DashboardUploadModal({
  open,
  competitions,
  user,
  onClose,
  onPublished,
}: DashboardUploadModalProps) {
  const [competitionId, setCompetitionId] = useState(competitions[0]?.id ?? "")
  const [athleteName, setAthleteName] = useState("")
  const [email, setEmail] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [verification, setVerification] = useState<ServerVerificationResult | null>(null)
  const [fileProbe, setFileProbe] = useState<ClientFileProbe | null>(null)
  const [step, setStep] = useState<UploadStep>("form")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const competition = competitions.find((c) => c.id === competitionId)
  const rules = competition ? getSubmissionRules(competition) : null

  useEffect(() => {
    if (!open) return

    const metadataName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : ""
    setAthleteName(metadataName)
    setEmail(typeof user.email === "string" ? user.email : "")
    setCompetitionId(competitions[0]?.id ?? "")
    setVideoFile(null)
    setVerification(null)
    setFileProbe(null)
    setStep("form")
    setProgress(0)
    setError(null)
    setMessage(null)
  }, [open, user, competitions])

  const clearMedia = () => {
    setVideoFile(null)
    setVerification(null)
    setFileProbe(null)
  }

  const handleClose = () => {
    if (step === "uploading" || step === "preparing") return
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!competition || !rules) {
      setError("Select a valid competition.")
      return
    }

    if (!athleteName.trim()) {
      setError("Enter your display name.")
      return
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.")
      return
    }

    const identity = getUploadIdentity(user, null)
    if (!identity) {
      setError("Could not resolve your account. Please sign in again.")
      return
    }

    const phone = identity.phone || user.phone?.trim() || ""
    if (!phone) {
      setError("Your account is missing a verified phone number.")
      return
    }

    if (!videoFile || !verification?.verified || !fileProbe) {
      setError("Upload and verify your video before submitting.")
      return
    }

    try {
      setStep("uploading")
      setProgress(0)

      const uploadResult = await uploadVideoToCloudinary(
        videoFile,
        competition.categorySlug,
        setProgress,
      )

      setStep("preparing")

      const prepareRes = await fetch("/api/submissions/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: identity.userId,
          userEmail: email.trim() || identity.email,
          userPhone: phone,
          competitionId: competition.id,
          athleteName: athleteName.trim() || identity.fullName,
          challengeTitle: competition.title,
          category: competition.categorySlug,
          upload: uploadResult,
          captureMethod: rules.captureMethod,
          captureMeta: {
            recordedAt: verification.serverVerifiedAt,
            clientUserAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          },
          verification,
          fileProbe: {
            fileName: fileProbe.fileName,
            sha256: fileProbe.sha256,
            hardwareMarkers: fileProbe.hardwareMarkers,
            deviceType: fileProbe.deviceType,
          },
        }),
      })

      const data = await prepareRes.json().catch(() => ({}))
      if (!prepareRes.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to submit entry.",
        )
      }

      onPublished?.()

      setStep("success")
      setMessage("Your entry was submitted and published to the public feed.")
    } catch (err) {
      setStep("error")
      setError(err instanceof Error ? err.message : "Submission failed.")
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="hobbyx-label-sub text-xs uppercase tracking-[0.25em]">New entry</p>
            <h2 id="upload-modal-title" className="hobbyx-label-title mt-2 text-xl">
              Upload video
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={step === "uploading" || step === "preparing"}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "success" ? (
          <div className="space-y-4">
            <p
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
              role="status"
            >
              {message}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <label className="block space-y-2">
              <span className="hobbyx-setting-label">Competition</span>
              <select
                value={competitionId}
                onChange={(e) => {
                  setCompetitionId(e.target.value)
                  clearMedia()
                }}
                disabled={step === "uploading" || step === "preparing"}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="hobbyx-setting-label">Display name</span>
              <input
                type="text"
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                placeholder="Your name"
                disabled={step === "uploading" || step === "preparing"}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </label>

            <label className="block space-y-2">
              <span className="hobbyx-setting-label">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={step === "uploading" || step === "preparing"}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </label>

            {competition && rules && (
              <VerifiedFileUpload
                category={competition.categorySlug}
                maxVideoSeconds={competition.maxVideoSeconds}
                disabled={step === "uploading" || step === "preparing"}
                onVerified={(file, result, probe) => {
                  setVideoFile(file)
                  setVerification(result)
                  setFileProbe(probe)
                  setError(null)
                }}
                onClear={clearMedia}
              />
            )}

            {(step === "uploading" || step === "preparing") && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {step === "uploading" ? `Uploading… ${progress}%` : "Preparing submission…"}
                </p>
              </div>
            )}

            {error && (
              <p
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={
                step === "uploading" ||
                step === "preparing" ||
                !videoFile ||
                !verification?.verified
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b5cf6] px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {step === "uploading" || step === "preparing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" aria-hidden />
                  Submit entry
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
