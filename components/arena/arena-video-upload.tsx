"use client"

import { useCallback, useRef, useState } from "react"
import { Film, Loader2, Upload, X } from "lucide-react"
import type { CategorySlug } from "@/lib/competitions"
import { uploadArenaVideoToBlob } from "@/lib/upload-arena-blob"

interface ArenaVideoUploadProps {
  categorySlug: CategorySlug
  videoUrl: string | null
  disabled?: boolean
  onUploaded: (url: string) => void
  onClear: () => void
}

export function ArenaVideoUpload({
  categorySlug,
  videoUrl,
  disabled,
  onUploaded,
  onClear,
}: ArenaVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File | null) => {
      setError(null)
      if (!file) return

      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      setUploading(true)
      setProgress(0)

      try {
        const url = await uploadArenaVideoToBlob(
          file,
          categorySlug,
          setProgress
        )
        onUploaded(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Video upload failed.")
        setLocalPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return null
        })
      } finally {
        setUploading(false)
        setProgress(null)
      }
    },
    [categorySlug, onUploaded]
  )

  const clear = () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(null)
    setError(null)
    setProgress(null)
    onClear()
    if (inputRef.current) inputRef.current.value = ""
  }

  const previewSrc = localPreview ?? videoUrl

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-[#ff9500]/30 bg-background/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffcc00]">
          <Film className="h-4 w-4" />
          Pitch video (optional)
        </div>
        {(videoUrl || localPreview) && !uploading && (
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      {previewSrc ? (
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <video
            src={previewSrc}
            controls
            playsInline
            className="max-h-48 w-full object-contain"
          />
          {videoUrl && !uploading && (
            <p className="truncate border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
              Saved to cloud storage
            </p>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card py-8 text-sm text-muted-foreground transition-colors hover:border-[#ff9500]/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#ff9500]" />
              <span>Uploading… {progress ?? 0}%</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[#ff9500]" />
              <span>MP4, WebM, or MOV · max 100 MB</span>
            </>
          )}
        </button>
      )}

      {uploading && previewSrc && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffcc00] transition-all"
            style={{ width: `${progress ?? 0}%` }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
