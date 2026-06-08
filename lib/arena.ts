import type { CategorySlug } from "@/lib/competitions"
import { getCategories } from "@/lib/competitions"

export interface ArenaSuggestion {
  id: string
  text: string
  categorySlug: CategorySlug
  votes: number
  createdAt: string
  /** Public Vercel Blob URL for an optional pitch / demo video */
  videoUrl?: string | null
}

export type ArenaFilter = "all" | CategorySlug

const VOTER_ID_KEY = "hobbyx-arena-voter-id"

/** Stable anonymous device id — sent with votes so one like per idea is enforced server-side */
export function getVoterDeviceId(): string {
  if (typeof window === "undefined") return "server"
  let id = localStorage.getItem(VOTER_ID_KEY)
  if (!id) {
    id = `voter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(VOTER_ID_KEY, id)
  }
  return id
}

export function sortSuggestionsByVotes(
  suggestions: ArenaSuggestion[]
): ArenaSuggestion[] {
  return [...suggestions].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function getGlobalLeaderId(suggestions: ArenaSuggestion[]): string | null {
  if (suggestions.length === 0) return null
  const sorted = sortSuggestionsByVotes(suggestions)
  const top = sorted[0]
  return top.votes > 0 ? top.id : null
}

export function filterSuggestions(
  suggestions: ArenaSuggestion[],
  filter: ArenaFilter
): ArenaSuggestion[] {
  if (filter === "all") return suggestions
  return suggestions.filter((s) => s.categorySlug === filter)
}

export function getCategoryLabel(slug: CategorySlug): string {
  return getCategories().find((c) => c.slug === slug)?.shortName ?? slug
}
