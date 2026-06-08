import { supabase } from "@/lib/supabaseClient"

export interface ClipVoteStats {
  clipId: string
  voteCount: number
}

export interface ToggleVoteResult {
  liked: boolean
  voteCount: number
}

export async function ensureClipVoteStats(clipIds: string[]): Promise<void> {
  const unique = [...new Set(clipIds.filter(Boolean))]
  if (unique.length === 0) return

  await Promise.all(
    unique.map(async (clipId) => {
      const { error } = await supabase.rpc("ensure_clip_vote_stats", {
        p_clip_id: clipId,
      })
      if (error) {
        throw new Error(error.message)
      }
    }),
  )
}

export async function fetchClipVoteStats(
  clipIds: string[],
): Promise<Record<string, number>> {
  const unique = [...new Set(clipIds.filter(Boolean))]
  if (unique.length === 0) return {}

  const { data, error } = await supabase
    .from("feed_clip_vote_stats")
    .select("clip_id, vote_count")
    .in("clip_id", unique)

  if (error) {
    throw new Error(error.message)
  }

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.clip_id] = Number(row.vote_count) || 0
  }
  return counts
}

export async function fetchUserVotedClipIds(
  userId: string,
  clipIds: string[],
): Promise<Set<string>> {
  const unique = [...new Set(clipIds.filter(Boolean))]
  if (unique.length === 0) return new Set()

  const { data, error } = await supabase
    .from("feed_clip_votes")
    .select("clip_id")
    .eq("user_id", userId)
    .in("clip_id", unique)

  if (error) {
    throw new Error(error.message)
  }

  return new Set((data ?? []).map((row) => row.clip_id))
}

export async function toggleFeedClipVote(
  clipId: string,
): Promise<ToggleVoteResult> {
  const { data, error } = await supabase.rpc("toggle_feed_clip_vote", {
    p_clip_id: clipId,
  })

  if (error) {
    throw new Error(error.message)
  }

  const payload = data as { liked?: boolean; vote_count?: number } | null
  return {
    liked: Boolean(payload?.liked),
    voteCount: Number(payload?.vote_count) || 0,
  }
}
