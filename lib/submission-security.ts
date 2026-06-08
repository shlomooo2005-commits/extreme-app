import type { CaptureMethod } from "@/lib/upload-policy"

/** How the video was captured — drives badges and fingerprint policy */
export type SubmissionSource = "app_camera" | "external"

/** Publication / anti-plagiarism lifecycle */
export type SubmissionSecurityStatus =
  | "pending_fingerprint"
  | "active"
  | "flagged_duplicate"
  | "rejected"

export function resolveSubmissionSource(
  captureMethod: CaptureMethod
): SubmissionSource {
  return captureMethod === "live_camera" ? "app_camera" : "external"
}

export function requiresFingerprintScan(source: SubmissionSource): boolean {
  return source === "external"
}

export function isPublicInFeed(status: SubmissionSecurityStatus): boolean {
  return status === "active"
}

export const SOURCE_BADGE = {
  app_camera: {
    labelEn: "Verified Original",
    labelHe: "תג מקוריות מאומתת",
    className:
      "border-emerald-400/50 bg-emerald-500/15 text-emerald-200",
  },
  external: {
    labelEn: "External Source",
    labelHe: "מקור חיצוני",
    className: "border-amber-400/50 bg-amber-500/15 text-amber-200",
  },
} as const

export function initialSecurityStatus(
  source: SubmissionSource
): SubmissionSecurityStatus {
  return source === "external" ? "pending_fingerprint" : "active"
}
