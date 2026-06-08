/**
 * Client-side feed like state (localStorage until backend votes exist).
 * Only verified users (name + phone on file) may toggle likes.
 */

const STORAGE_KEY = "hobbyx-feed-likes-v1"

export type FeedLikesState = Record<string, boolean>

export function loadFeedLikes(): FeedLikesState {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as FeedLikesState
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function saveFeedLikes(state: FeedLikesState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function getClipLikeCount(clipId: string, seedLikes: number): number {
  const liked = loadFeedLikes()[clipId] === true
  return seedLikes + (liked ? 1 : 0)
}

export function isClipLikedByUser(clipId: string): boolean {
  return loadFeedLikes()[clipId] === true
}

export function toggleClipLike(clipId: string): FeedLikesState {
  const current = loadFeedLikes()
  const next = { ...current }
  if (next[clipId]) {
    delete next[clipId]
  } else {
    next[clipId] = true
  }
  saveFeedLikes(next)
  return next
}

export function buildClipId(competitionId: string, participantId: string): string {
  return `${competitionId}:${participantId}`
}
