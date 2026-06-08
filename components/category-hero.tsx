"use client"

import Image from "next/image"
import { useState } from "react"
import type { Category } from "@/lib/competitions"
import { getCategoryHeroImage } from "@/lib/category-images"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CategoryThemeDecor } from "./category/category-theme-decor"
import { CategoryImageFallback } from "./category/category-image-fallback"

interface CategoryHeroProps {
  category: Category
  children: React.ReactNode
  size?: "full" | "compact"
}

export function CategoryHero({
  category,
  children,
  size = "full",
}: CategoryHeroProps) {
  const visual = getCategoryVisual(category.slug)
  const minH =
    size === "full"
      ? "min-h-[48vh] sm:min-h-[58vh] md:min-h-[65vh]"
      : "min-h-[36vh] sm:min-h-[42vh]"
  const [imgFailed, setImgFailed] = useState(false)
  const heroSrc = getCategoryHeroImage(category.slug)

  return (
    <section
      className={`category-theme-root ${visual.themeClass} relative w-full overflow-hidden ${minH} flex items-end`}
      style={{ background: visual.darkPageBackground }}
    >
      {heroSrc && !imgFailed ? (
        <Image
          key={heroSrc}
          src={heroSrc}
          alt=""
          fill
          priority
          className="object-cover scale-105 opacity-90"
          sizes="100vw"
          onError={() => setImgFailed(true)}
        />
      ) : heroSrc && imgFailed ? (
        <CategoryImageFallback visual={visual} />
      ) : null}
      {heroSrc && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: visual.sportGradient }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/45 to-transparent" />
        </>
      )}
      <CategoryThemeDecor slug={category.slug} variant="hero" />
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{
          background: `linear-gradient(90deg, ${visual.accentSecondary}, ${visual.neonAccent}, ${visual.accentSecondary})`,
          boxShadow: `0 0 28px ${visual.neonAccent}`,
        }}
      />

      <div className="relative z-10 w-full px-4 pb-8 pt-20 sm:px-5 sm:pb-10 sm:pt-24 md:px-8 md:pb-14">
        {children}
      </div>
    </section>
  )
}
