"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  Camera,
  Loader2,
  RotateCcw,
  SwitchCamera,
  X,
} from "lucide-react"
import {
  MAX_LIVE_RECORDING_SECONDS,
  MIN_LIVE_RECORDING_SECONDS,
} from "@/lib/upload-policy"
import type { CategorySlug } from "@/lib/competitions"

type TimerOption = 0 | 5 | 10

const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 0, label: "ללא טיימר" },
  { value: 5, label: "5 שניות" },
  { value: 10, label: "10 שניות" },
]

interface LiveCameraRecorderProps {
  category: CategorySlug
  competitionId?: string
  maxRecordingSeconds?: number
  disabled?: boolean
  onRecorded: (file: File, meta: { recordedAt: string; durationSeconds: number }) => void
  onClear: () => void
}

export function LiveCameraRecorder({
  category,
  competitionId,
  maxRecordingSeconds = MAX_LIVE_RECORDING_SECONDS,
  disabled,
  onRecorded,
  onClear,
}: LiveCameraRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timerOption, setTimerOption] = useState<TimerOption>(0)
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    category === "music"
      ? "user"
      : "environment"
  )
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [mounted, setMounted] = useState(false)
  const skipFlipRestartRef = useRef(true)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    stopStream()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraReady(true)
    } catch {
      setError(
        "לא ניתן לגשת למצלמה. אשרו הרשאות מצלמה ומיקרופון בהגדרות הדפדפן."
      )
      setCameraReady(false)
    }
  }, [facingMode, stopStream])

  const closeFullscreen = useCallback(() => {
    if (isRecording) return
    setCountdown(null)
    setIsFullscreenOpen(false)
    stopStream()
  }, [isRecording, stopStream])

  const openFullscreen = useCallback(async () => {
    if (disabled) return
    setOpening(true)
    setIsFullscreenOpen(true)
    await startCamera()
    setOpening(false)
  }, [disabled, startCamera])

  useEffect(() => {
    setMounted(true)
    return () => stopStream()
  }, [stopStream])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!isFullscreenOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isFullscreenOpen])

  useEffect(() => {
    if (!isFullscreenOpen) {
      skipFlipRestartRef.current = true
      return
    }
    if (skipFlipRestartRef.current) {
      skipFlipRestartRef.current = false
      return
    }
    void startCamera()
  }, [facingMode, isFullscreenOpen, startCamera])

  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        elapsedRef.current = next
        if (next >= maxRecordingSeconds) {
          recorderRef.current?.stop()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRecording, maxRecordingSeconds])

  const beginRecording = useCallback(() => {
    if (!streamRef.current) return
    chunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4"

    const recorder = new MediaRecorder(streamRef.current, { mimeType })
    recorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const ext = mimeType.includes("webm") ? "webm" : "mp4"
      const recordedAt = new Date().toISOString()
      const file = new File(
        [blob],
        `hobbyx-live-${competitionId ?? category}-${Date.now()}.${ext}`,
        { type: mimeType }
      )
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setRecordedFile(file)
      setIsRecording(false)
      setIsFullscreenOpen(false)
      stopStream()
      onRecorded(file, {
        recordedAt,
        durationSeconds: elapsedRef.current,
      })
    }
    recorder.start(500)
    setElapsed(0)
    elapsedRef.current = 0
    setIsRecording(true)
  }, [
    category,
    competitionId,
    maxRecordingSeconds,
    onRecorded,
    stopStream,
  ])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setCountdown(null)
      beginRecording()
      return
    }
    const t = window.setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => window.clearTimeout(t)
  }, [countdown, beginRecording])

  const handleShutterPress = () => {
    if (!cameraReady || isRecording || countdown !== null) return
    if (timerOption === 0) {
      beginRecording()
    } else {
      setCountdown(timerOption)
    }
  }

  const stopRecording = () => {
    if (elapsed < MIN_LIVE_RECORDING_SECONDS) {
      setError(`הקליטו לפחות ${MIN_LIVE_RECORDING_SECONDS} שניות.`)
      return
    }
    recorderRef.current?.stop()
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setRecordedFile(null)
    setElapsed(0)
    setError(null)
    setCountdown(null)
    onClear()
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  const fullscreenModal =
    isFullscreenOpen && mounted ? (
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="מצלמת הקלטה"
      >
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          style={
            facingMode === "user" ? { transform: "scaleX(-1)" } : undefined
          }
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/75" />

        <header className="relative z-10 flex items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={closeFullscreen}
            disabled={isRecording}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md disabled:opacity-40"
            aria-label="סגור"
          >
            <X className="h-6 w-6" />
          </button>
          {isRecording && (
            <div className="flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 font-mono text-sm font-bold text-white shadow-lg">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
              {formatTime(elapsed)} / {formatTime(maxRecordingSeconds)}
            </div>
          )}
          <button
            type="button"
            disabled={isRecording || countdown !== null}
            onClick={() =>
              setFacingMode((f) => (f === "user" ? "environment" : "user"))
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md disabled:opacity-40"
            aria-label="החלף מצלמה"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        </header>

        {countdown !== null && countdown > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/35">
            <span
              key={countdown}
              className="live-camera-countdown text-[min(28vw,9rem)] font-black tabular-nums text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]"
            >
              {countdown}
            </span>
          </div>
        )}

        {(opening || (!cameraReady && !error)) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
            <Loader2 className="h-12 w-12 animate-spin text-white/80" />
          </div>
        )}

        {error && isFullscreenOpen && (
          <p
            className="relative z-20 mx-4 mt-2 rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-3 text-center text-sm text-red-200"
            dir="rtl"
          >
            {error}
          </p>
        )}

        <footer className="relative z-10 mt-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          {!isRecording && countdown === null && (
            <div className="mb-5 flex flex-col items-center gap-2">
              <label
                htmlFor="record-timer"
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55"
              >
                טיימר לפני הקלטה
              </label>
              <select
                id="record-timer"
                value={timerOption}
                onChange={(e) =>
                  setTimerOption(Number(e.target.value) as TimerOption)
                }
                disabled={!cameraReady || opening}
                className="min-w-[200px] rounded-full border border-white/20 bg-black/50 px-5 py-2.5 text-center text-sm font-semibold text-white backdrop-blur-md focus:border-[#ff6b00] focus:outline-none disabled:opacity-50"
              >
                {TIMER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#14141f]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[4px] border-white bg-transparent shadow-[0_0_24px_rgba(0,0,0,0.45)]"
                aria-label="עצור הקלטה"
              >
                <span className="h-8 w-8 rounded-md bg-red-500" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!cameraReady || opening || countdown !== null}
                onClick={handleShutterPress}
                className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-[4px] border-white bg-transparent shadow-[0_0_28px_rgba(0,0,0,0.5)] transition-transform active:scale-95 disabled:opacity-45"
                aria-label="התחל הקלטה"
              >
                <span className="h-[58px] w-[58px] rounded-full bg-red-500 shadow-inner" />
              </button>
            )}
            <p className="text-center text-xs font-medium text-white/65">
              {isRecording
                ? "הקש להפסקה"
                : `עד ${maxRecordingSeconds} שניות · הקלטה חיה בלבד`}
            </p>
          </div>
        </footer>
      </div>
    ) : null

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-white/85"
        dir="rtl"
      >
        <strong className="text-white">הקלטה חיה בלבד.</strong> יש לצלם בזמן אמת
        דרך המצלמה — ללא העלאה מהגלריה.
      </div>

      {!previewUrl && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => void openFullscreen()}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-[#1a1a28] to-[#0a0a14] px-6 py-10 transition-all hover:border-[#ff6b00]/50 hover:shadow-[0_0_32px_rgba(255,107,0,0.15)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl ring-2 ring-white/20">
            <Camera className="h-8 w-8 text-white" aria-hidden />
          </span>
          <span className="text-lg font-black text-white" dir="rtl">
            פתח מצלמה לצילום
          </span>
          <span className="text-xs text-white/50" dir="rtl">
            חוויית מצלמה מלאה במסך
          </span>
        </button>
      )}

      {previewUrl && recordedFile && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black aspect-video">
            <video
              src={previewUrl}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#14141f] px-4 py-3 text-sm font-bold text-white"
            dir="rtl"
          >
            <RotateCcw className="h-4 w-4" />
            צלם שוב
          </button>
        </div>
      )}

      {error && (
        <p
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          dir="rtl"
        >
          {error}
        </p>
      )}

      {mounted && fullscreenModal
        ? createPortal(fullscreenModal, document.body)
        : null}
    </div>
  )
}
