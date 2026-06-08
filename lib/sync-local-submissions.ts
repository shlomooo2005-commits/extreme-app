import { getSubmissionsForUser } from "@/lib/user-submissions-store"
import { publishVideoSubmission } from "@/lib/supabase-video-submissions"

/** Backfill Personal Area local uploads into the public Supabase feed. */
export async function syncLocalSubmissionsToPublicFeed(
  userId: string,
): Promise<number> {
  const records = getSubmissionsForUser(userId)
  let synced = 0

  for (const record of records) {
    try {
      await publishVideoSubmission({
        payload: record.payload,
        userId: record.userId,
      })
      synced += 1
    } catch {
      // Already published or Supabase unavailable — skip.
    }
  }

  return synced
}
