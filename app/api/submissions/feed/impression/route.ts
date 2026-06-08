import { NextResponse } from "next/server"
import { recordFeedImpressions } from "@/lib/feed-engagement-db"
import { isSubmissionsDbConfigured } from "@/lib/submissions-db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const raw = body.clipIds ?? body.clipId
    const clipIds = (
      Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : []
    )
      .filter((id): id is string => typeof id === "string" && id.length > 0)
      .slice(0, 20)

    if (clipIds.length === 0) {
      return NextResponse.json(
        { error: "clipId or clipIds is required." },
        { status: 400 }
      )
    }

    if (isSubmissionsDbConfigured()) {
      await recordFeedImpressions(clipIds)
    }

    return NextResponse.json({ ok: true, recorded: clipIds.length })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record impressions"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
