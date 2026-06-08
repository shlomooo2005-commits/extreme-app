"use client"

import Link from "next/link"
import { useCallback, useRef, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Flame,
  Loader2,
  Video,
} from "lucide-react"
import { getCompetitionById } from "@/lib/competitions"
import {
  COMPETITION_CATEGORIES,
  type AISubmissionPayload,
  type CloudinaryVideoUploadResult,
  type CompetitionCategorySlug,
} from "@/lib/submission"

const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB
const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/mov"]

type UploadStep = "form" | "uploading" | "preparing" | "success" | "error"

interface VideoUploadFormProps {
  defaultCategory?: CompetitionCategorySlug
  defaultCompetitionId?: string
}

export function VideoUploadForm({
  defaultCategory = "mountain-biking",
  defaultCompetitionId,
}: VideoUploadFormProps) {
  const linkedCompetition = defaultCompetitionId
    ? getCompetitionById(defaultCompetitionId)
    : undefined
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<UploadStep>("form")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submission, setSubmission] = useState<AISubmissionPayload | null>(null)

  const [athleteName, setAthleteName] = useState("")
  const [challengeTitle, setChallengeTitle] = useState(
    linkedCompetition?.title ?? ""
  )
  const [category, setCategory] =
    useState<CompetitionCategorySlug>(defaultCategory)

  const onFileChange = useCallback((selected: File | null) => {
    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (!selected) {
      setFile(null)
      setPreviewUrl(null)
      return
    }

    if (
      !ACCEPTED_TYPES.includes(selected.type) &&
      !selected.name.match(/\.(mp4|webm|mov)$/i)
    ) {
      setError("Please upload MP4, WebM, or MOV video only.")
      setFile(null)
      setPreviewUrl(null)
      return
    }

    if (selected.size > MAX_VIDEO_BYTES) {
      setError("Video must be 100 MB or smaller.")
      setFile(null)
      setPreviewUrl(null)
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }, [previewUrl])

  const uploadToCloudinary = async (
    videoFile: File
  ): Promise<CloudinaryVideoUploadResult> => {
    const signRes = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    })

    if (!signRes.ok) {
      const data = await signRes.json().catch(() => ({}))
      throw new Error(data.error ?? "Could not authorize upload")
    }

    const { cloudName, apiKey, timestamp, signature, folder, tags } =
      await signRes.json()

    const formData = new FormData()
    formData.append("file", videoFile)
    formData.append("api_key", apiKey)
    formData.append("timestamp", String(timestamp))
    formData.append("signature", signature)
    formData.append("folder", folder)
    formData.append("tags", tags)
    formData.append("resource_type", "video")

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
      )

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText) as CloudinaryVideoUploadResult)
          return
        }
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.error?.message ?? "Cloudinary upload failed"))
        } catch {
          reject(new Error("Cloudinary upload failed"))
        }
      }

      xhr.onerror = () => reject(new Error("Network error during upload"))
      xhr.send(formData)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError("Select a video file to upload.")
      return
    }

    if (!athleteName.trim() || !challengeTitle.trim()) {
      setError("Athlete name and challenge title are required.")
      return
    }

    try {
      setStep("uploading")
      setProgress(0)

      const uploadResult = await uploadToCloudinary(file)

      setStep("preparing")

      const prepareRes = await fetch("/api/submissions/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName,
          challengeTitle,
          category,
          upload: uploadResult,
        }),
      })

      if (!prepareRes.ok) {
        const data = await prepareRes.json().catch(() => ({}))
        throw new Error(data.error ?? "Failed to prepare submission for AI")
      }

      const { submission: payload } = await prepareRes.json()
      setSubmission(payload)
      setStep("success")

      // Queue locally until you wire a database / AI worker
      const queueKey = "hobbyx-ai-submission-queue"
      const existing = JSON.parse(localStorage.getItem(queueKey) ?? "[]")
      existing.push(payload)
      localStorage.setItem(queueKey, JSON.stringify(existing))
    } catch (err) {
      setStep("error")
      setError(err instanceof Error ? err.message : "Upload failed")
    }
  }

  if (step === "success" && submission) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-primary" />
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">
            Submission received
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your video is on Cloudinary and queued for AI judging.
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            ID: {submission.submissionId}
          </p>
        </div>

        {submission.video.secureUrl && (
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <video
              src={submission.video.secureUrl}
              controls
              className="aspect-video w-full bg-black"
            />
          </div>
        )}

        <details className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            AI judging payload (dev)
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(submission, null, 2)}
          </pre>
        </details>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="flex flex-1 items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to zones
          </Link>
          <button
            type="button"
            onClick={() => {
              setStep("form")
              setSubmission(null)
              setFile(null)
              setPreviewUrl(null)
              setProgress(0)
            }}
            className="flex flex-1 items-center justify-center rounded-xl border border-border/50 bg-secondary px-6 py-3 font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary/80"
          >
            Submit another
          </button>
        </div>
      </div>
    )
  }

  const isBusy = step === "uploading" || step === "preparing"

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <label
          htmlFor="athleteName"
          className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
        >
          Athlete name
        </label>
        <input
          id="athleteName"
          value={athleteName}
          onChange={(e) => setAthleteName(e.target.value)}
          placeholder="Your name or team"
          disabled={isBusy}
          className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category"
          className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
        >
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as CompetitionCategorySlug)
          }
          disabled={isBusy}
          className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
        >
          {COMPETITION_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="challengeTitle"
          className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
        >
          Challenge title
        </label>
        <input
          id="challengeTitle"
          value={challengeTitle}
          onChange={(e) => setChallengeTitle(e.target.value)}
          placeholder="e.g. Backflip off the dirt jump"
          disabled={isBusy}
          className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-60"
          required
        />
      </div>

      <div className="space-y-3">
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Competition video
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mov"
          className="hidden"
          disabled={isBusy}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={isBusy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/30 px-6 py-12 transition-colors hover:border-primary/50 hover:bg-secondary/50 disabled:opacity-60"
        >
          {file ? (
            <>
              <Video className="h-10 w-10 text-primary" />
              <span className="font-medium text-foreground">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB — tap to change
              </span>
            </>
          ) : (
            <>
              <CloudUpload className="h-10 w-10 text-muted-foreground" />
              <span className="font-medium text-foreground">
                Drop or select your video
              </span>
              <span className="text-sm text-muted-foreground">
                MP4, WebM, or MOV · max 100 MB
              </span>
            </>
          )}
        </button>

        {previewUrl && (
          <video
            src={previewUrl}
            controls
            className="aspect-video w-full rounded-2xl border border-border/50 bg-black"
          />
        )}
      </div>

      {isBusy && (
        <div className="space-y-2 rounded-xl border border-border/50 bg-secondary/30 p-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {step === "uploading"
              ? `Uploading to Cloudinary… ${progress}%`
              : "Preparing submission for AI judging…"}
          </div>
          {step === "uploading" && (
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isBusy || !file}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Flame className="h-5 w-5" />
            Submit for AI judging
          </>
        )}
      </button>
    </form>
  )
}
