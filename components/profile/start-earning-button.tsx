"use client"

import Link from "next/link"
import { useUserAccount } from "@/hooks/use-user-account"

interface StartEarningButtonProps {
  className?: string
  size?: "md" | "lg"
}

export function StartEarningButton({
  className = "",
  size = "lg",
}: StartEarningButtonProps) {
  const { ready, isOnboarded } = useUserAccount()
  const href = !ready || !isOnboarded ? "/profile" : "/"

  const pad = size === "lg" ? "px-8 py-5" : "px-6 py-4"
  const text = size === "lg" ? "text-sm md:text-base" : "text-xs md:text-sm"

  return (
    <Link
      href={href}
      className={`earn-glow-button group relative inline-flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff6b00] via-[#ffcc00] to-[#22c55e] ${pad} text-center font-black uppercase tracking-wide text-black transition-transform hover:scale-[1.02] ${text} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        <span className="text-xl" aria-hidden>
          🔥
        </span>
        <span>Click Here to Start Earning</span>
      </span>
      <span dir="rtl" className="relative z-10 text-sm font-bold normal-case tracking-normal">
        לחץ עליי ותוכל להרוויח
      </span>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
        }}
      />
    </Link>
  )
}
