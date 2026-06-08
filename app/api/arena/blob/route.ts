import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import {
  BLOB_VIDEO_CONTENT_TYPES,
  BLOB_VIDEO_MAX_BYTES,
  isBlobStorageConfigured,
} from "@/lib/blob-storage"
import { isCategorySlug } from "@/lib/competitions"

export async function POST(request: Request): Promise<NextResponse> {
  if (!isBlobStorageConfigured()) {
    return NextResponse.json(
      {
        error:
          "Blob storage is not configured. Add Vercel Blob to this project.",
      },
      { status: 503 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!pathname.startsWith("arena/")) {
          throw new Error("Invalid upload path.")
        }

        let categorySlug: string | undefined
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as { categorySlug?: string }
            categorySlug = parsed.categorySlug
          } catch {
            throw new Error("Invalid upload metadata.")
          }
        }

        if (!categorySlug || !isCategorySlug(categorySlug)) {
          throw new Error("A valid category is required for Arena uploads.")
        }

        if (!pathname.startsWith(`arena/${categorySlug}/`)) {
          throw new Error("Upload path does not match category.")
        }

        return {
          allowedContentTypes: [...BLOB_VIDEO_CONTENT_TYPES],
          maximumSizeInBytes: BLOB_VIDEO_MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ categorySlug }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.info("[arena blob] uploaded", blob.pathname)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    console.error("[arena blob]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 400 }
    )
  }
}
