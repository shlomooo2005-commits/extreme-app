import { createHmac } from "node:crypto"
import type { ClientFileProbe } from "@/lib/video-verification"
import type { CategorySlug } from "@/lib/competitions"
import { requiresVerifiedFile } from "@/lib/upload-policy"

export interface VerificationCheck {
  id: string
  passed: boolean
  message: string
}

export type TrustLevel = "high" | "medium" | "low" | "rejected"

export interface ServerVerificationResult {
  verified: boolean
  trustLevel: TrustLevel
  score: number
  checks: VerificationCheck[]
  serverVerifiedAt: string
  signature: string
  aiScreeningNote: string
  fileHash?: string
}

const DEVICE_MARKER_EXPECTATIONS: Record<string, string[]> = {
  gopro: ["GoPro", "GoPro filename pattern", "gpmd", "GOPR"],
  dji: ["DJI", "DJI filename pattern"],
  garmin: ["Garmin"],
  insta360: ["Insta360", "Insta360 filename pattern"],
  sony_action: ["Sony"],
  smartphone: ["Apple", "Android"],
  other: [],
}

function signPayload(payload: object, secret: string): string {
  return createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex")
}

/** Dev/local only — production keeps strict GoPro/DJI hardware marker checks. */
export function shouldBypassStrictVideoVerification(
  requestHost?: string | null
): boolean {
  if (process.env.NODE_ENV === "development") return true
  if (!requestHost) return false

  const hostname = requestHost.split(":")[0].toLowerCase()
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  )
}

export function verifyFileMetadata(
  category: CategorySlug,
  probe: ClientFileProbe,
  apiSecret: string,
  options?: { bypassStrictChecks?: boolean }
): ServerVerificationResult {
  const checks: VerificationCheck[] = []
  const serverVerifiedAt = new Date().toISOString()

  if (!requiresVerifiedFile(category)) {
    return reject(checks, serverVerifiedAt, apiSecret, "Category does not allow file upload.")
  }

  checks.push({
    id: "category_policy",
    passed: true,
    message: "Category allows verified file upload.",
  })

  const validHash = /^[a-f0-9]{64}$/i.test(probe.sha256)
  checks.push({
    id: "integrity_hash",
    passed: validHash,
    message: validHash
      ? "SHA-256 file hash computed."
      : "Invalid SHA-256 hash.",
  })

  const validSize =
    probe.fileSize > 0 && probe.fileSize <= 100 * 1024 * 1024
  checks.push({
    id: "file_size",
    passed: validSize,
    message: validSize
      ? `File size ${(probe.fileSize / (1024 * 1024)).toFixed(1)} MB within limit.`
      : "File size missing or exceeds 100 MB.",
  })

  const validMime =
    /\.(mp4|mov|m4v)$/i.test(probe.fileName) ||
    probe.mimeType.startsWith("video/")
  checks.push({
    id: "video_format",
    passed: validMime,
    message: validMime
      ? "Recognized video container/type."
      : "Unrecognized video format.",
  })

  const hasContainer =
    Boolean(probe.majorBrand) || probe.compatibleBrands.length > 0
  checks.push({
    id: "container_metadata",
    passed: hasContainer,
    message: hasContainer
      ? `Container brands: ${[probe.majorBrand, ...probe.compatibleBrands].filter(Boolean).join(", ")}`
      : "Could not read MP4/MOV container metadata.",
  })

  const bypassStrict = options?.bypassStrictChecks ?? false
  let reencode = false

  if (bypassStrict) {
    checks.push({
      id: "hardware_signature",
      passed: validMime,
      message: validMime
        ? "Development/localhost: hardware marker checks bypassed."
        : "Development/localhost: file must still be a recognized video format.",
    })
    checks.push({
      id: "reencode_screening",
      passed: true,
      message: "Development/localhost: re-encode screening bypassed.",
    })
  } else {
    const expectedMarkers = DEVICE_MARKER_EXPECTATIONS[probe.deviceType] ?? []
    const markerHit = expectedMarkers.some((exp) =>
      probe.hardwareMarkers.some(
        (m) =>
          m.toLowerCase().includes(exp.toLowerCase()) ||
          exp.toLowerCase().includes(m.toLowerCase())
      )
    )
    const anyHardwareMarker = probe.hardwareMarkers.length > 0

    checks.push({
      id: "hardware_signature",
      passed:
        probe.deviceType === "smartphone"
          ? anyHardwareMarker
          : markerHit || anyHardwareMarker,
      message:
        probe.deviceType === "smartphone"
          ? "Smartphone upload — lower trust; manual review likely."
          : markerHit
            ? `Hardware markers match declared device (${probe.deviceType}).`
            : anyHardwareMarker
              ? `Found markers [${probe.hardwareMarkers.join(", ")}] but weak match to declared ${probe.deviceType}.`
              : "No camera hardware markers detected — possible re-encode or synthetic file.",
    })

    reencode = probe.hardwareMarkers.some((m) =>
      ["FFmpeg", "Libavformat", "HandBrake"].includes(m)
    )
    checks.push({
      id: "reencode_screening",
      passed: !reencode,
      message: reencode
        ? "Transcoding signatures detected (FFmpeg/HandBrake). Flagged for authenticity review."
        : "No obvious transcoding toolchain signatures in file header.",
    })
  }

  const captureRecent =
    Date.now() - new Date(probe.capturedAtClaim).getTime() <
    365 * 24 * 60 * 60 * 1000
  checks.push({
    id: "capture_timestamp",
    passed: captureRecent && !Number.isNaN(Date.parse(probe.capturedAtClaim)),
    message: captureRecent
      ? "Capture date claim is within the past year."
      : "Invalid or unrealistic capture date.",
  })

  const passedCount = checks.filter((c) => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)

  let trustLevel: TrustLevel = "rejected"
  if (score >= 85 && checks.find((c) => c.id === "hardware_signature")?.passed) {
    trustLevel = "high"
  } else if (score >= 65) {
    trustLevel = "medium"
  } else if (score >= 50) {
    trustLevel = "low"
  }

  const verified = bypassStrict
    ? validHash && validSize && validMime
    : validHash &&
      validSize &&
      validMime &&
      score >= 65 &&
      !reencode &&
      checks.find((c) => c.id === "hardware_signature")?.passed !== false

  const aiScreeningNote = bypassStrict
    ? "Development/localhost: strict hardware checks bypassed for local testing."
    : reencode
      ? "Queued for AI authenticity screening — transcoding markers present."
      : trustLevel === "high"
        ? "Passed hardware metadata checks — ready for skill AI judging."
        : "Queued with medium/low trust — additional authenticity review recommended."

  const core = {
    verified,
    trustLevel,
    score,
    checks,
    serverVerifiedAt,
    fileHash: probe.sha256,
    category,
  }

  const signature = signPayload(core, apiSecret)

  return {
    verified,
    trustLevel,
    score,
    checks,
    serverVerifiedAt,
    signature,
    aiScreeningNote,
    fileHash: probe.sha256,
  }
}

function reject(
  checks: VerificationCheck[],
  serverVerifiedAt: string,
  apiSecret: string,
  message: string
): ServerVerificationResult {
  checks.push({ id: "policy", passed: false, message })
  const core = {
    verified: false,
    trustLevel: "rejected" as const,
    score: 0,
    checks,
    serverVerifiedAt,
    fileHash: "",
    category: "",
  }
  return {
    ...core,
    signature: signPayload(core, apiSecret),
    aiScreeningNote: message,
  }
}
