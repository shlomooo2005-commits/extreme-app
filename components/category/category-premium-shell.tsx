"use client"

import Image from "next/image"
import { useState } from "react"
import type { CategorySlug } from "@/lib/competitions"
import { getCategoryCardImage } from "@/lib/category-images"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CategoryImageFallback } from "./category-image-fallback"

interface CategoryPremiumShellProps {
  slug: CategorySlug
  className?: string
  children: React.ReactNode
  as?: "div" | "button"
  onClick?: () => void
  "aria-expanded"?: boolean
}

export function CategoryPremiumShell({
  slug,
  className,
  children,
  as = "div",
  onClick,
  "aria-expanded": ariaExpanded,
}: CategoryPremiumShellProps) {
  const visual = getCategoryVisual(slug)
  const resolvedSrc = getCategoryCardImage(slug)
  const [imgFailed, setImgFailed] = useState(false)

  const inner = (
    <>
      {resolvedSrc && !imgFailed ? (
        <Image
          key={resolvedSrc}
          src={resolvedSrc}
          alt=""
          fill
          className="object-cover scale-105 transition-transform duration-700 group-hover:scale-110 group-active:scale-[1.03]"
          sizes="(max-width: 480px) 100vw, 400px"
          onError={() => setImgFailed(true)}
        />
      ) : resolvedSrc && imgFailed ? (
        <CategoryImageFallback visual={visual} />
      ) : (
        <div className="absolute inset-0 bg-card" aria-hidden />
      )}
      {resolvedSrc && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: visual.cardOverlay }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-background/92 via-background/70 to-background/45"
            aria-hidden
          />
        </>
      )}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
        style={{
          background: `linear-gradient(180deg, ${visual.neonAccent}, ${visual.accentSecondary})`,
          boxShadow: `0 0 20px ${visual.neonAccent}`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50 group-active:opacity-60"
        style={{ backgroundColor: visual.neonAccent }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </>
  )

  const shellClass = [
    "category-premium-card group relative w-full overflow-hidden rounded-xl border text-left text-foreground transition-all duration-300",
    "border-border hover:border-white/25 active:scale-[0.99]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const style = {
    boxShadow: `0 4px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(${visual.glowRgb}, 0.08)`,
    ["--category-glow-rgb" as string]: visual.glowRgb,
    ["--category-neon" as string]: visual.neonAccent,
  } as React.CSSProperties

  if (as === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={ariaExpanded}
        className={shellClass}
        style={style}
      >
        {inner}
      </button>
    )
  }

  return (
    <div className={shellClass} style={style}>
      {inner}
    </div>
  )
}
