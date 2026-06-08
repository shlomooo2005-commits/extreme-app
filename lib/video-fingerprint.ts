/**
 * Simulated server-side video fingerprint / anti-plagiarism engine.
 * Flags duplicates and likely social-platform scrapes before feed publication.
 */

import type { SubmissionSecurityStatus } from "@/lib/submission-security"

export type MatchedPlatform = "youtube" | "tiktok" | "instagram"

export interface FingerprintScanInput {
  submissionId: string
  sha256: string | null
  fileName?: string | null
  hardwareMarkers?: string[]
  videoPublicId?: string
}

export interface FingerprintScanResult {
  status: SubmissionSecurityStatus
  flags: string[]
  matchedPlatform?: MatchedPlatform
  confidence: number
  summary: string
}

const PLATFORM_FILENAME_PATTERNS: { platform: MatchedPlatform; pattern: RegExp }[] =
  [
    { platform: "youtube", pattern: /youtube|yt\.be|shorts|ytdl/i },
    { platform: "tiktok", pattern: /tiktok|tt[-_]?clip|musically/i },
    { platform: "instagram", pattern: /instagram|insta[-_]?reel|reels|ig[-_]?video/i },
  ]

const SCRAPE_METADATA_MARKERS = [
  "youtube",
  "tiktok",
  "instagram",
  "reels",
  "shorts",
  "downloader",
  "social",
  "repost",
]

/** Demo hashes that always flag (staging / QA) */
const DEMO_FLAGGED_HASHES = new Set([
  "0000000000000000000000000000000000000000000000000000000000000001",
])

export function runVideoFingerprintScan(
  input: FingerprintScanInput,
  options?: { duplicateSha256InDb?: boolean }
): FingerprintScanResult {
  const flags: string[] = []
  let matchedPlatform: MatchedPlatform | undefined
  let confidence = 0

  const fileName = input.fileName ?? ""
  const markers = (input.hardwareMarkers ?? []).map((m) => m.toLowerCase())
  const haystack = `${fileName} ${markers.join(" ")}`.toLowerCase()

  if (!input.sha256) {
    flags.push("missing_content_hash")
    confidence += 40
  } else if (DEMO_FLAGGED_HASHES.has(input.sha256.toLowerCase())) {
    flags.push("demo_blocklist_hash")
    confidence = 100
  }

  if (options?.duplicateSha256InDb) {
    flags.push("duplicate_hash_existing_submission")
    confidence = Math.max(confidence, 95)
  }

  for (const { platform, pattern } of PLATFORM_FILENAME_PATTERNS) {
    if (pattern.test(fileName) || pattern.test(haystack)) {
      flags.push(`platform_filename_${platform}`)
      matchedPlatform = platform
      confidence = Math.max(confidence, 88)
    }
  }

  for (const marker of SCRAPE_METADATA_MARKERS) {
    if (haystack.includes(marker)) {
      flags.push(`metadata_scrape_marker_${marker}`)
      confidence = Math.max(confidence, 75)
      if (!matchedPlatform && marker === "youtube") matchedPlatform = "youtube"
      if (!matchedPlatform && marker === "tiktok") matchedPlatform = "tiktok"
      if (!matchedPlatform && marker === "instagram") matchedPlatform = "instagram"
    }
  }

  const heavyReencode =
    markers.some((m) =>
      ["ffmpeg", "libavformat", "handbrake"].includes(m)
    ) && markers.some((m) => SCRAPE_METADATA_MARKERS.some((s) => m.includes(s)))

  if (heavyReencode) {
    flags.push("reencode_plus_social_metadata")
    confidence = Math.max(confidence, 92)
  }

  const flagged = confidence >= 70 || flags.includes("duplicate_hash_existing_submission")

  if (flagged) {
    return {
      status: "flagged_duplicate",
      flags,
      matchedPlatform,
      confidence,
      summary: matchedPlatform
        ? `Fingerprint match: likely scraped from ${matchedPlatform}.`
        : "Fingerprint match: duplicate or scraped content detected.",
    }
  }

  return {
    status: "active",
    flags: flags.length ? flags : ["fingerprint_clean"],
    confidence: Math.max(confidence, 12),
    summary: "Video fingerprint scan passed — cleared for public feed.",
  }
}
