"use client"

import { useCallback, useRef, useState } from "react"
import {
  CheckCircle2,
  CloudUpload,
  Loader2,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react"
import {
  buildClientFileProbe,
  DEVICE_TYPES,
  getVideoDuration,
  type DeviceTypeId,
} from "@/lib/video-verification"
import type { ServerVerificationResult } from "@/lib/video-verification-server"
import { MAX_FILE_BYTES } from "@/lib/upload-policy"
import type { CategorySlug } from "@/lib/competitions"

interface VerifiedFileUploadProps {
  category: CategorySlug
  maxVideoSeconds?: number
  disabled?: boolean
  onVerified: (
    file: File,
    verification: ServerVerificationResult,
    probe: import("@/lib/video-verification").ClientFileProbe
  ) => void
  onClear: () => void
}

export function VerifiedFileUpload({
  category,
  maxVideoSeconds,
  disabled,
  onVerified,
  onClear,
}: VerifiedFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deviceType, setDeviceType] = useState<DeviceTypeId>("gopro")
  const [capturedAt, setCapturedAt] = useState(() =>
    new Date().toISOString().slice(0, 16)
  )
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] =
    useState<ServerVerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runVerification = useCallback(
    async (selected: File) => {
      setVerifying(true)
      setError(null)
      setVerification(null)

      try {
        const probe = await buildClientFileProbe(
          selected,
          deviceType,
          new Date(capturedAt).toISOString()
        )

        const res = await fetch("/api/submissions/verify-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, probe }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error ?? "Verification request failed")
        }

        const result = data.verification as ServerVerificationResult
        setVerification(result)

        if (result.verified) {
          onVerified(selected, result, probe)
        } else {
          setError(
            "File did not pass authenticity checks. Use an original camera export (GoPro/DJI) without re-encoding."
          )
          onClear()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed")
        onClear()
      } finally {
        setVerifying(false)
      }
    },
    [category, deviceType, capturedAt, onVerified, onClear]
  )

  const onFileChange = async (selected: File | null) => {
    setError(null)
    setVerification(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    if (!selected) {
      setFile(null)
      onClear()
      return
    }

    if (
      !selected.type.startsWith("video/") &&
      !selected.name.match(/\.(mp4|mov|m4v)$/i)
    ) {
      setError("Upload MP4 or MOV from your action camera.")
      return
    }

    if (selected.size > MAX_FILE_BYTES) {
      setError("Video must be 100 MB or smaller.")
      return
    }

    if (maxVideoSeconds != null) {
      const duration = await getVideoDuration(selected)
      if (duration == null) {
        setError("Could not read video duration. Try another export.")
        return
      }
      if (duration > maxVideoSeconds) {
        setError(
          `Video must be ${maxVideoSeconds} seconds or shorter (yours is ${Math.ceil(duration)}s).`
        )
        return
      }
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    await runVerification(selected)
  }

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setVerification(null)
    setError(null)
    onClear()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-foreground">
        <strong>Verified file upload.</strong> Submit original GoPro / action-cam
        exports. We hash the file and verify container metadata & hardware
        signatures to screen re-encodes and synthetic media before AI judging.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="deviceType"
            className="hobbyx-setting-label"
          >
            Recording device
          </label>
          <select
            id="deviceType"
            value={deviceType}
            onChange={(e) => {
              setDeviceType(e.target.value as DeviceTypeId)
              if (file) void runVerification(file)
            }}
            disabled={disabled || verifying}
            className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
          >
            {DEVICE_TYPES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="capturedAt"
            className="hobbyx-setting-label"
          >
            Capture date & time
          </label>
          <input
            id="capturedAt"
            type="datetime-local"
            value={capturedAt}
            onChange={(e) => setCapturedAt(e.target.value)}
            disabled={disabled || verifying}
            className="w-full rounded-xl border border-border/50 bg-secondary px-4 py-3 text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
          />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mp4,.mov,.m4v"
        className="hidden"
        disabled={disabled || verifying}
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        disabled={disabled || verifying}
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/30 px-6 py-12 transition-colors hover:border-cyan-500/50 hover:bg-secondary/50 disabled:opacity-60"
      >
        {verifying ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="font-medium text-foreground">
              Verifying metadata & hardware signature…
            </span>
          </>
        ) : file ? (
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
              Select original camera file
            </span>
            <span className="text-sm text-muted-foreground">
              MP4 / MOV · max 100 MB · GoPro, DJI, etc.
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

      {verification && (
        <div
          className={`rounded-xl border p-4 ${
            verification.verified
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <div className="mb-3 flex items-center gap-2 font-bold text-foreground">
            {verification.verified ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Verification {verification.verified ? "passed" : "failed"} ·{" "}
            {verification.trustLevel} trust ({verification.score}%)
          </div>
          <ul className="space-y-1.5">
            {verification.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                )}
                {check.message}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            {verification.aiScreeningNote}
          </p>
        </div>
      )}

      {file && verification?.verified && (
        <button
          type="button"
          onClick={clearFile}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Remove file and verify again
        </button>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
