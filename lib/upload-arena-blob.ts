import { upload } from "@vercel/blob/client"
import {
  BLOB_VIDEO_CONTENT_TYPES,
  BLOB_VIDEO_MAX_BYTES,
} from "@/lib/blob-storage"
import type { CategorySlug } from "@/lib/competitions"

const ACCEPTED_EXTENSIONS = /\.(mp4|webm|mov)$/i

export function validateArenaVideoFile(file: File): string | null {
  if (
    !BLOB_VIDEO_CONTENT_TYPES.includes(
      file.type as (typeof BLOB_VIDEO_CONTENT_TYPES)[number]
    ) &&
    !ACCEPTED_EXTENSIONS.test(file.name)
  ) {
    return "Please upload MP4, WebM, or MOV video only."
  }
  if (file.size > BLOB_VIDEO_MAX_BYTES) {
    return "Video must be 100 MB or smaller."
  }
  return null
}

export async function uploadArenaVideoToBlob(
  file: File,
  categorySlug: CategorySlug,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validationError = validateArenaVideoFile(file)
  if (validationError) throw new Error(validationError)

  const pathname = `arena/${categorySlug}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/arena/blob",
    clientPayload: JSON.stringify({ categorySlug }),
    onUploadProgress: (event) => {
      if (onProgress && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    },
  })

  return blob.url
}
