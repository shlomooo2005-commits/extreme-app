/** Vercel Blob — Arena pitch videos & shared upload policy */

export const BLOB_VIDEO_MAX_BYTES = 100 * 1024 * 1024

export const BLOB_VIDEO_CONTENT_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const

export function isBlobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/** Only accept URLs from our Vercel Blob store (prevents arbitrary link injection). */
export function isAllowedBlobVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") return false
    return (
      parsed.hostname.endsWith(".public.blob.vercel-storage.com") ||
      parsed.hostname.endsWith(".blob.vercel-storage.com")
    )
  } catch {
    return false
  }
}

export function validateBlobVideoUrl(
  value: unknown
): { videoUrl: string } | { videoUrl: null } | { error: string } {
  if (value === undefined || value === null || value === "") {
    return { videoUrl: null }
  }
  if (typeof value !== "string") {
    return { error: "Invalid video URL." }
  }
  const trimmed = value.trim()
  if (!trimmed) return { videoUrl: null }
  if (!isAllowedBlobVideoUrl(trimmed)) {
    return { error: "Video must be uploaded through HobbyX Arena storage." }
  }
  return { videoUrl: trimmed }
}
