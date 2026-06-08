import { NextResponse } from "next/server"
import {
  ArenaDbError,
  createArenaSuggestion,
  isArenaDbConfigured,
  listArenaSuggestions,
  validateArenaInput,
  validateArenaVideoInput,
  validateVoterId,
} from "@/lib/arena-db"

export async function GET(request: Request) {
  if (!isArenaDbConfigured()) {
    return NextResponse.json(
      {
        error:
          "Arena database is not configured. Connect Vercel Postgres to this project.",
      },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const voterId = validateVoterId(searchParams.get("voterId") ?? undefined)
    const data = await listArenaSuggestions(voterId ?? undefined)

    return NextResponse.json({
      suggestions: data.suggestions,
      votedIds: data.votedIds,
      serverTime: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[arena GET]", err)
    const status = err instanceof ArenaDbError ? err.status : 500
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load arena." },
      { status }
    )
  }
}

export async function POST(request: Request) {
  if (!isArenaDbConfigured()) {
    return NextResponse.json(
      { error: "Arena database is not configured." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const parsed = validateArenaInput(body.text, body.categorySlug)
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const videoParsed = validateArenaVideoInput(body.videoUrl)
    if ("error" in videoParsed) {
      return NextResponse.json({ error: videoParsed.error }, { status: 400 })
    }

    const suggestion = await createArenaSuggestion(
      parsed.text,
      parsed.categorySlug,
      videoParsed.videoUrl
    )

    return NextResponse.json({ suggestion }, { status: 201 })
  } catch (err) {
    console.error("[arena POST]", err)
    const status = err instanceof ArenaDbError ? err.status : 500
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit idea." },
      { status }
    )
  }
}
