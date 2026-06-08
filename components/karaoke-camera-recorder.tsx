"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Circle,
  Loader2,
  Mic,
  Music2,
  RotateCcw,
  Square,
} from "lucide-react"
import {
  getActiveLyricCueIndex,
  type KaraokeChallengeConfig,
} from "@/lib/karaoke-challenges"
import { MIN_LIVE_RECORDING_SECONDS } from "@/lib/upload-policy"

interface KaraokeCameraRecorderProps {
  config: KaraokeChallengeConfig
  competitionId: string
  disabled?: boolean
  onRecorded: (
    file: File,
    meta: { recordedAt: string; durationSeconds: number }
  ) => void
  onClear: () => void
}

export function KaraokeCameraRecorder({
  config,
  competitionId,
  disabled,
  onRecorded,
  onClear,
}: KaraokeCameraRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const backingAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const maxSeconds = config.durationSeconds

  const [status, setStatus] = useState<
    "idle" | "ready" | "recording" | "preview" | "error"
  >("idle")
  const [error, setError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [recordedFile, setRecordedFile] = useState<File | null>(null)
  const [backingReady, setBackingReady] = useState(false)

  const stopBacking = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current)
      autoStopTimerRef.current = null
    }
    const audio = backingAudioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = config.instrumentalStartOffsetSeconds
    }
    void audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
  }, [config.instrumentalStartOffsetSeconds])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    stopStream()
    stopBacking()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus("ready")
    } catch {
      setError(
        "Camera or microphone permission denied. Allow access to record your karaoke take."
      )
      setStatus("error")
    }
  }, [stopStream, stopBacking])

  useEffect(() => {
    const audio = new Audio(config.instrumentalUrl)
    audio.crossOrigin = "anonymous"
    audio.preload = "auto"
    audio.loop = false
    audio.currentTime = config.instrumentalStartOffsetSeconds
    backingAudioRef.current = audio

    const onCanPlay = () => setBackingReady(true)
    const onError = () => setBackingReady(false)
    audio.addEventListener("canplaythrough", onCanPlay)
    audio.addEventListener("error", onError)
    audio.load()

    startCamera()

    return () => {
      audio.removeEventListener("canplaythrough", onCanPlay)
      audio.removeEventListener("error", onError)
      stopBacking()
      stopStream()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.instrumentalUrl, config.instrumentalStartOffsetSeconds])

  useEffect(() => {
    if (status !== "recording") return
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1
        elapsedRef.current = next
        if (next >= maxSeconds) {
          recorderRef.current?.stop()
        }
        return next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, maxSeconds])

  const startRecording = async () => {
    const stream = streamRef.current
    const backing = backingAudioRef.current
    if (!stream || !backing) return

    setError(null)
    chunksRef.current = []

    try {
      const ctx = new AudioContext()
      await ctx.resume()
      audioCtxRef.current = ctx

      const micStream = new MediaStream(stream.getAudioTracks())
      const micSource = ctx.createMediaStreamSource(micStream)
      const backingSource = ctx.createMediaElementSource(backing)

      const micGain = ctx.createGain()
      const backingGain = ctx.createGain()
      micGain.gain.value = 1
      backingGain.gain.value = 0.7

      const mixDest = ctx.createMediaStreamDestination()
      micSource.connect(micGain)
      backingSource.connect(backingGain)
      micGain.connect(mixDest)
      backingGain.connect(mixDest)
      backingGain.connect(ctx.destination)

      backing.currentTime = config.instrumentalStartOffsetSeconds
      await backing.play()

      const combined = new MediaStream([
        ...stream.getVideoTracks(),
        ...mixDest.stream.getAudioTracks(),
      ])

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4"

      const recorder = new MediaRecorder(combined, { mimeType })
      recorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stopBacking()
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const ext = mimeType.includes("webm") ? "webm" : "mp4"
        const recordedAt = new Date().toISOString()
        const file = new File(
          [blob],
          `hobbyx-karaoke-${competitionId}-${Date.now()}.${ext}`,
          { type: mimeType }
        )
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setRecordedFile(file)
        setStatus("preview")
        stopStream()
        onRecorded(file, {
          recordedAt,
          durationSeconds: elapsedRef.current,
        })
      }

      recorder.start(500)
      setElapsed(0)
      elapsedRef.current = 0
      setStatus("recording")

      autoStopTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.stop()
        }
      }, maxSeconds * 1000)
    } catch {
      stopBacking()
      setError("Could not start karaoke recording. Check audio permissions and retry.")
      setStatus("ready")
    }
  }

  const stopRecording = () => {
    if (elapsed < MIN_LIVE_RECORDING_SECONDS) {
      setError(`Sing at least ${MIN_LIVE_RECORDING_SECONDS} seconds.`)
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
    onClear()
    startCamera()
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  const activeCueIndex =
    status === "recording" || status === "ready"
      ? getActiveLyricCueIndex(config.lyricCues, elapsed)
      : 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#ff2d95]/40 bg-gradient-to-br from-[#ff2d95]/12 to-[#a855f7]/12 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-bold text-[#0c1222]">
          <Music2 className="h-4 w-4 text-[#db2777]" aria-hidden />
          <span dir="rtl">
            {config.songTitle} — {config.artistName}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {maxSeconds}s karaoke take · on-screen lyrics · instrumental bed mixed
          with your voice
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#ff2d95]/30 bg-black aspect-video">
        {status === "preview" && previewUrl ? (
          <video
            src={previewUrl}
            controls
            className="h-full w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {status !== "preview" && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pb-5 pt-12">
            <div className="space-y-2 text-center" dir="rtl">
              {config.lyricCues.map((cue, i) => (
                <p
                  key={cue.startSeconds}
                  className={`text-lg font-bold leading-snug transition-all duration-300 sm:text-xl ${
                    status === "recording" && i === activeCueIndex
                      ? "scale-105 text-white drop-shadow-[0_0_12px_rgba(255,45,149,0.8)]"
                      : i === activeCueIndex
                        ? "text-white/90"
                        : "text-white/35"
                  }`}
                >
                  {cue.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {status === "recording" && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#ff2d95] px-3 py-1 text-sm font-bold text-white">
            <Mic className="h-3.5 w-3.5" />
            KARAOKE {formatTime(elapsed)} / {formatTime(maxSeconds)}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {status === "ready" && (
          <button
            type="button"
            disabled={disabled || !backingReady}
            onClick={() => void startRecording()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff2d95] to-[#a855f7] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-95 disabled:opacity-50"
          >
            <Circle className="h-4 w-4 fill-current" />
            Start {maxSeconds}s karaoke take
          </button>
        )}

        {status === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop early
          </button>
        )}

        {status === "preview" && recordedFile && (
          <button
            type="button"
            disabled={disabled}
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Re-record
          </button>
        )}
      </div>

      {status === "idle" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading camera & karaoke track…
        </p>
      )}

      {!backingReady && status !== "error" && status !== "preview" && (
        <p className="text-xs text-amber-200/80">
          Preparing instrumental bed…
        </p>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
