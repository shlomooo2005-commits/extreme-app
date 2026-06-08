import { NextResponse } from "next/server"
import {
  ArenaDbError,
  addArenaVote,
  isArenaDbConfigured,
  validateVoterId,
} from "@/lib/arena-db"

export async function POST(request: Request) {
  if (!isArenaDbConfigured()) {
    return NextResponse.json(
      { error: "Arena database is not configured." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const suggestionId =
      typeof body.suggestionId === "string" ? body.suggestionId.trim() : ""
    const voterId = validateVoterId(body.voterId)

    if (!suggestionId) {
      return NextResponse.json(
        { error: "suggestionId is required." },
        { status: 400 }
      )
    }
    if (!voterId) {
      return NextResponse.json(
        { error: "A valid voterId is required." },
        { status: 400 }
      )
    }

    const result = await addArenaVote(suggestionId, voterId)

    if (!result.ok) {
      const status = result.reason === "not_found" ? 404 : 409
      return NextResponse.json(
        {
          error:
            result.reason === "already_voted"
              ? "You already voted for this idea."
              : "Suggestion not found.",
          reason: result.reason,
        },
        { status }
      )
    }

    return NextResponse.json({
      suggestionId,
      votes: result.votes,
    })
  } catch (err) {
    console.error("[arena vote POST]", err)
    const status = err instanceof ArenaDbError ? err.status : 500
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record vote." },
      { status }
    )
  }
}
