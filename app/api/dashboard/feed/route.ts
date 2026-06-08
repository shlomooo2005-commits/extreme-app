import { NextResponse } from "next/server"
import {
  buildDashboardVideoFeed,
  fetchPublicDashboardVideos,
} from "@/lib/dashboard-feed"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const interestsParam = searchParams.get("interests") ?? ""
    const preferredInterests = interestsParam
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)

    const videos = await fetchPublicDashboardVideos()
    const feed = buildDashboardVideoFeed(videos, preferredInterests)

    return NextResponse.json(feed)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load dashboard feed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
