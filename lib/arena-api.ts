import type { ArenaSuggestion } from "@/lib/arena"
import type { CategorySlug } from "@/lib/competitions"

export interface ArenaBoardResponse {
  suggestions: ArenaSuggestion[]
  votedIds: string[]
  serverTime: string
}

const POLL_MS = 5000

export function getArenaPollIntervalMs(): number {
  return POLL_MS
}

export async function fetchArenaBoard(
  voterId: string
): Promise<ArenaBoardResponse> {
  const params = new URLSearchParams({ voterId })
  const res = await fetch(`/api/arena?${params}`, { cache: "no-store" })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to load arena."
    )
  }
  return data as ArenaBoardResponse
}

export async function submitArenaSuggestion(
  text: string,
  categorySlug: CategorySlug,
  videoUrl?: string | null
): Promise<ArenaSuggestion> {
  const res = await fetch("/api/arena", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, categorySlug, videoUrl: videoUrl ?? null }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to submit idea."
    )
  }
  return (data as { suggestion: ArenaSuggestion }).suggestion
}

export async function voteArenaSuggestion(
  suggestionId: string,
  voterId: string
): Promise<{ votes: number }> {
  const res = await fetch("/api/arena/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ suggestionId, voterId }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Failed to vote."
    )
  }
  return { votes: (data as { votes: number }).votes }
}
