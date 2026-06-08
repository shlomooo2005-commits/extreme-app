import { NextResponse } from "next/server"
import { mergeCategoryFeedClips } from "@/lib/category-feed"
import { isCategorySlug } from "@/lib/competitions"
import {
  getRankedCategoryFeed,
  voterHasLikedClips,
} from "@/lib/feed-engagement-db"
import { normalizeVoterId } from "@/lib/feed-voter"
import type { RankedFeedClip } from "@/lib/feed-ranking"
import {
  isSubmissionsDbConfigured,
  listPublicFeedSubmissions,
} from "@/lib/submissions-db"

function toPublicClip(clip: RankedFeedClip) {
  const { feedScore, distributionPhase, feedHidden, impressions, ...publicClip } =
    clip
  return publicClip
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") ?? ""
  const voterId = normalizeVoterId(searchParams.get("voterId"))

  if (!isCategorySlug(category)) {
    return NextResponse.json(
      { error: "Valid category query parameter is required." },
      { status: 400 }
    )
  }

  try {
    const { clips: dbClips, createdAtByClipId: dbCreatedAt } =
      isSubmissionsDbConfigured()
        ? await listPublicFeedSubmissions(category)
        : { clips: [], createdAtByClipId: new Map<string, number>() }

    const merged = mergeCategoryFeedClips(category, dbClips)
    const createdAtByClipId = new Map(dbCreatedAt)

    merged.forEach((clip, index) => {
      if (!createdAtByClipId.has(clip.id)) {
        createdAtByClipId.set(clip.id, Date.now() - index * 60_000)
      }
    })

    const ranked = await getRankedCategoryFeed(
      category,
      merged,
      createdAtByClipId
    )

    let likedClipIds: string[] = []
    if (voterId && isSubmissionsDbConfigured() && ranked.length > 0) {
      const liked = await voterHasLikedClips(
        voterId,
        ranked.map((c) => c.id)
      )
      likedClipIds = [...liked]
    }

    return NextResponse.json({
      category,
      clips: ranked.map(toPublicClip),
      likedClipIds,
      sources: {
        database: dbClips.length,
        total: ranked.length,
        merged: merged.length,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load category feed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
