import type { SubmissionSource } from "@/lib/submission-security"
import { SOURCE_BADGE } from "@/lib/submission-security"
import { ShieldCheck, HardDriveUpload } from "lucide-react"

interface SubmissionSourceBadgeProps {
  source: SubmissionSource
  compact?: boolean
  className?: string
}

export function SubmissionSourceBadge({
  source,
  compact = false,
  className = "",
}: SubmissionSourceBadgeProps) {
  const badge = SOURCE_BADGE[source]
  const Icon = source === "app_camera" ? ShieldCheck : HardDriveUpload

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-black uppercase tracking-wide ${badge.className} ${compact ? "text-[9px]" : "text-[10px]"} ${className}`}
      title={`${badge.labelEn} · ${badge.labelHe}`}
    >
      <Icon className={compact ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} aria-hidden />
      <span>{badge.labelEn}</span>
      {!compact && (
        <span dir="rtl" className="font-semibold normal-case text-foreground/80">
          {badge.labelHe}
        </span>
      )}
    </span>
  )
}
