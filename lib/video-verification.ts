/**
 * Client-side file probing & hashing before server verification.
 */

export const DEVICE_TYPES = [
  { id: "gopro", label: "GoPro" },
  { id: "dji", label: "DJI / Osmo Action" },
  { id: "garmin", label: "Garmin / VIRB" },
  { id: "insta360", label: "Insta360" },
  { id: "sony_action", label: "Sony Action Cam" },
  { id: "smartphone", label: "Smartphone (not recommended)" },
  { id: "other", label: "Other action camera" },
] as const

export type DeviceTypeId = (typeof DEVICE_TYPES)[number]["id"]

export interface ClientFileProbe {
  fileName: string
  fileSize: number
  mimeType: string
  lastModified: number
  sha256: string
  deviceType: DeviceTypeId
  capturedAtClaim: string
  containerBrand: string | null
  majorBrand: string | null
  compatibleBrands: string[]
  hardwareMarkers: string[]
  durationSeconds: number | null
}

const GOPRO_FILENAME = /^(GH|GX|GP|H\d)[0-9]/i
const DJI_FILENAME = /^DJI_/i
const INSTA_FILENAME = /^INSTA/i

const MARKER_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /GoPro/i, label: "GoPro" },
  { pattern: /DJI/i, label: "DJI" },
  { pattern: /Garmin/i, label: "Garmin" },
  { pattern: /Insta360/i, label: "Insta360" },
  { pattern: /Sony/i, label: "Sony" },
  { pattern: /Apple/i, label: "Apple" },
  { pattern: /android/i, label: "Android" },
  { pattern: /ffmpeg/i, label: "FFmpeg" },
  { pattern: /Lavf/i, label: "Libavformat" },
  { pattern: /HandBrake/i, label: "HandBrake" },
]

const REENCODE_MARKERS = ["FFmpeg", "Libavformat", "HandBrake"]

export async function computeFileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function readAscii(bytes: Uint8Array, start: number, length: number): string {
  let s = ""
  for (let i = start; i < start + length && i < bytes.length; i++) {
    const c = bytes[i]
    if (c >= 32 && c <= 126) s += String.fromCharCode(c)
    else s += "."
  }
  return s
}

export function probeVideoContainer(bytes: Uint8Array): {
  majorBrand: string | null
  compatibleBrands: string[]
  hardwareMarkers: string[]
} {
  let majorBrand: string | null = null
  const compatibleBrands: string[] = []
  const hardwareMarkers = new Set<string>()

  if (bytes.length >= 8) {
    majorBrand = readAscii(bytes, 4, 4).replace(/\./g, "").trim() || null
  }

  const scanLength = Math.min(bytes.length, 512 * 1024)
  const scan = bytes.subarray(0, scanLength)
  const text = new TextDecoder("latin1").decode(scan)

  for (const { pattern, label } of MARKER_PATTERNS) {
    if (pattern.test(text)) hardwareMarkers.add(label)
  }

  const brandMatches = text.match(/ftyp([a-zA-Z0-9]{4})/g)
  if (brandMatches) {
    for (const m of brandMatches) {
      const b = m.replace("ftyp", "")
      if (b && !compatibleBrands.includes(b)) compatibleBrands.push(b)
    }
  }

  return {
    majorBrand,
    compatibleBrands,
    hardwareMarkers: [...hardwareMarkers],
  }
}

export function probeFilename(fileName: string): string[] {
  const hints: string[] = []
  if (GOPRO_FILENAME.test(fileName)) hints.push("GoPro filename pattern")
  if (DJI_FILENAME.test(fileName)) hints.push("DJI filename pattern")
  if (INSTA_FILENAME.test(fileName)) hints.push("Insta360 filename pattern")
  return hints
}

export function getVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(video.duration) ? video.duration : null)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    video.src = url
  })
}

export async function buildClientFileProbe(
  file: File,
  deviceType: DeviceTypeId,
  capturedAtClaim: string
): Promise<ClientFileProbe> {
  const [sha256, durationSeconds] = await Promise.all([
    computeFileSha256(file),
    getVideoDuration(file),
  ])

  const slice = file.slice(0, 512 * 1024)
  const buffer = await slice.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const container = probeVideoContainer(bytes)
  const filenameHints = probeFilename(file.name)

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    lastModified: file.lastModified,
    sha256,
    deviceType,
    capturedAtClaim,
    containerBrand: container.majorBrand,
    majorBrand: container.majorBrand,
    compatibleBrands: container.compatibleBrands,
    hardwareMarkers: [
      ...container.hardwareMarkers,
      ...filenameHints,
    ],
    durationSeconds,
  }
}

export function hasReencodeSignals(probe: ClientFileProbe): boolean {
  return probe.hardwareMarkers.some((m) => REENCODE_MARKERS.includes(m))
}
