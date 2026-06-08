import { NextResponse } from "next/server"
import {
  getCloudinaryConfig,
  signUploadParams,
  SUBMISSIONS_FOLDER,
} from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig()
    const body = await request.json().catch(() => ({}))
    const category =
      typeof body.category === "string" ? body.category : "general"

    const timestamp = Math.round(Date.now() / 1000)
    const folder = `${SUBMISSIONS_FOLDER}/${category}`
    const tags = `competition,${category},pending-ai-judge`

    const paramsToSign = {
      folder,
      tags,
      timestamp,
    }

    const signature = signUploadParams(paramsToSign, apiSecret)

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      tags,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign upload"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
