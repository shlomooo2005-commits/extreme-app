import { NextResponse } from "next/server"
import { getCloudinaryConfig } from "@/lib/cloudinary"
import { isCategorySlug } from "@/lib/competitions"
import type { ClientFileProbe } from "@/lib/video-verification"
import {
  shouldBypassStrictVideoVerification,
  verifyFileMetadata,
} from "@/lib/video-verification-server"
import { requiresVerifiedFile } from "@/lib/upload-policy"

export async function POST(request: Request) {
  try {
    const { apiSecret } = getCloudinaryConfig()
    const body = await request.json()
    const category = body.category
    const probe = body.probe as ClientFileProbe

    if (!isCategorySlug(category)) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 }
      )
    }

    if (!requiresVerifiedFile(category)) {
      return NextResponse.json(
        { error: "This category requires live in-app recording, not file upload." },
        { status: 400 }
      )
    }

    if (!probe?.sha256 || !probe?.fileName) {
      return NextResponse.json(
        { error: "Invalid file probe payload." },
        { status: 400 }
      )
    }

    const bypassStrictChecks = shouldBypassStrictVideoVerification(
      request.headers.get("host")
    )
    const verification = verifyFileMetadata(category, probe, apiSecret, {
      bypassStrictChecks,
    })

    return NextResponse.json({ verification })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
