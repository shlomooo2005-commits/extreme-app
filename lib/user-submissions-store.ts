/**
 * Client-side submission registry keyed by user account id.
 * Persists until a server-side submissions table is wired.
 */

import type { AISubmissionPayload } from "@/lib/submission"

export const USER_SUBMISSIONS_STORAGE_KEY = "hobbyx-user-submissions"

export interface StoredUserSubmission {
  userId: string
  fullName: string
  email: string
  phone: string
  payload: AISubmissionPayload
  savedAt: string
}

export function loadAllUserSubmissions(): StoredUserSubmission[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(USER_SUBMISSIONS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredUserSubmission[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getSubmissionsForUser(userId: string): StoredUserSubmission[] {
  return loadAllUserSubmissions()
    .filter((s) => s.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
}

export function saveUserSubmission(record: StoredUserSubmission): void {
  if (typeof window === "undefined") return
  const existing = loadAllUserSubmissions().filter(
    (s) => s.payload.submissionId !== record.payload.submissionId
  )
  existing.push(record)
  localStorage.setItem(USER_SUBMISSIONS_STORAGE_KEY, JSON.stringify(existing))
}
