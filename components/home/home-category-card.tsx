"use client"

import Image from "next/image"
import { useState } from "react"
import type { CategorySlug } from "@/lib/competitions"
import {
  EXTREME_CARD,
  getCategoryCardImage,
  MOUNTAIN_BIKING_CARD,
  SURFING_CARD,
} from "@/lib/category-images"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CategoryImageFallback } from "@/components/category/category-image-fallback"

interface HomeCategoryCardProps {
  slug: CategorySlug
  className?: string
  children: React.ReactNode
}

function resolveHomeCardImage(slug: CategorySlug): string | null {
  if (slug === "surfing") return SURFING_CARD
  if (slug === "mountain-biking") return MOUNTAIN_BIKING_CARD
  if (slug === "extreme") return EXTREME_CARD
  if (slug === "random") return null
  return getCategoryCardImage(slug)
}

/** Homepage category shell — slots 1–2 use SURFING_CARD / MOUNTAIN_BIKING_CARD directly. */
export function HomeCategoryCard({
  slug,
  className,
  children,
}: HomeCategoryCardProps) {
  const visual = getCategoryVisual(slug)
  const cardImage = resolveHomeCardImage(slug)
  const [imgFailed, setImgFailed] = useState(false)

  const shellClass = [
    "category-premium-card group relative w-full min-h-[112px] overflow-hidden rounded-xl border text-left text-foreground transition-all duration-300",
    "border-border hover:border-white/25 active:scale-[0.99]",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={shellClass}
      style={{
        boxShadow: `0 4px 24px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(${visual.glowRgb}, 0.08)`,
        ["--category-glow-rgb" as string]: visual.glowRgb,
        ["--category-neon" as string]: visual.neonAccent,
      }}
    >
      {cardImage && !imgFailed ? (
        <div className="absolute inset-0 z-0">
          <Image
            key={cardImage}
            src={cardImage}
            alt=""
            fill
            priority={slug === "surfing" || slug === "mountain-biking"}
            className="object-cover scale-105 transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 480px) 100vw, 400px"
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : cardImage && imgFailed ? (
        <CategoryImageFallback visual={visual} />
      ) : (
        <div className="absolute inset-0 z-0 bg-card" aria-hidden />
      )}

      {cardImage && !imgFailed && (
        <>
          <div
            className="absolute inset-0 z-[1]"
            style={{ background: visual.cardOverlay }}
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-r from-background/92 via-background/70 to-background/45"
            aria-hidden
          />
        </>
      )}

      <div
        className="absolute left-0 top-0 bottom-0 z-[2] w-1.5 rounded-l-xl"
        style={{
          background: `linear-gradient(180deg, ${visual.neonAccent}, ${visual.accentSecondary})`,
          boxShadow: `0 0 20px ${visual.neonAccent}`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-6 -top-6 z-[2] h-28 w-28 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50"
        style={{ backgroundColor: visual.neonAccent }}
        aria-hidden
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
