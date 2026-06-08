import Link from "next/link"
import { SITE_NAME } from "@/lib/site-config"

interface HobbyXLogoProps {
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
  href?: string
  className?: string
}

const sizeMap = {
  sm: { box: "h-8 w-8 text-xs", word: "text-lg" },
  md: { box: "h-10 w-10 text-sm", word: "text-xl" },
  lg: { box: "h-12 w-12 text-base", word: "text-2xl" },
}

export function HobbyXLogo({
  size = "md",
  showWordmark = true,
  href = "/",
  className = "",
}: HobbyXLogoProps) {
  const s = sizeMap[size]

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${s.box} flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff6b00] via-[#ff9500] to-[#ffcc00] font-black tracking-tighter text-black shadow-[0_0_20px_rgba(255,107,0,0.45)]`}
        aria-hidden
      >
        HX
      </div>
      {showWordmark && (
        <span
          className={`${s.word} font-black uppercase tracking-tight text-foreground`}
        >
          Hobby
          <span className="text-[#ff6b00]">X</span>
        </span>
      )}
      <span className="sr-only">{SITE_NAME}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}
