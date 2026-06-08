import { NextResponse } from "next/server"
import { toggleFeedClipLike } from "@/lib/feed-engagement-db"
import { normalizeVoterId } from "@/lib/feed-voter"
import { isSubmissionsDbConfigured } from "@/lib/submissions-db"
import { isValidPhone } from "@/lib/user-account"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const clipId = typeof body.clipId === "string" ? body.clipId.trim() : ""
    const voterId = normalizeVoterId(body.voterId)
    const voterPhone =
      typeof body.voterPhone === "string" ? body.voterPhone.trim() : ""

    if (!clipId) {
      return NextResponse.json({ error: "clipId is required." }, { status: 400 })
    }

    if (!voterId) {
      return NextResponse.json({ error: "voterId is required." }, { status: 400 })
    }

    if (!isValidPhone(voterPhone)) {
      return NextResponse.json(
        {
          error:
            "A verified phone number is required before you can like entries.",
        },
        { status: 403 }
      )
    }

    if (!isSubmissionsDbConfigured()) {
      return NextResponse.json(
        { error: "Feed voting is not available." },
        { status: 503 }
      )
    }

    const result = await toggleFeedClipLike(clipId, voterId)

    return NextResponse.json({
      clipId,
      liked: result.liked,
      likesCount: result.likesCount,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update like"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
