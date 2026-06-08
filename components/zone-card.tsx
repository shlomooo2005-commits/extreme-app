"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Category } from "@/lib/competitions"
import { getCategoryHomeCard } from "@/lib/category-images"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CategoryThemeDecor } from "./category/category-theme-decor"

interface ZoneCardProps {
  category: Category
  href: string
  featured?: boolean
}

export function ZoneCard({ category, href, featured = false }: ZoneCardProps) {
  const visual = getCategoryVisual(category.slug)
  const heroSrc = getCategoryHomeCard(category.slug).cardImage

  return (
    <Link
      href={href}
      className={`category-theme-root ${visual.themeClass} group relative block w-full overflow-hidden text-left transition-all duration-300 hover:z-10 hover:scale-[1.02] ${
        featured
          ? "aspect-[4/5] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[420px]"
          : "aspect-[4/5] sm:aspect-[3/4]"
      }`}
      style={{
        boxShadow: `0 0 0 2px ${visual.neonAccent}55, 0 12px 40px rgba(${visual.glowRgb}, 0.35)`,
        background: heroSrc ? undefined : visual.darkPageBackground,
      }}
    >
      {heroSrc ? (
        <Image
          src={heroSrc}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 50vw"
              : "(max-width: 640px) 50vw, 25vw"
          }
        />
      ) : null}
      {heroSrc ? (
        <div
          className="absolute inset-0"
          style={{ background: visual.sportGradient }}
        />
      ) : null}
      <CategoryThemeDecor slug={category.slug} variant="card" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-transparent" />

      <div
        className="absolute left-0 right-0 top-0 h-1.5"
        style={{
          background: visual.neonAccent,
          boxShadow: `0 0 16px ${visual.neonAccent}`,
        }}
      />

      <div className="absolute left-4 top-4 md:left-5 md:top-5">
        <span
          className="inline-block skew-label rounded-sm px-2 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-black md:text-xs"
          style={{ backgroundColor: visual.neonAccent }}
        >
          {visual.themeLabel}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
        <h3
          className={`hobbyx-label-title uppercase leading-none tracking-tight ${
            featured ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
          }`}
        >
          {category.name}
        </h3>
        <p className="hobbyx-label-sub mt-2 max-w-[280px] text-sm md:text-base">
          {category.tagline}
        </p>
        <div
          className="mt-4 flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all group-hover:scale-110"
          style={{
            borderColor: visual.neonAccent,
            backgroundColor: `rgba(${visual.glowRgb}, 0.25)`,
            boxShadow: `0 0 20px rgba(${visual.glowRgb}, 0.5)`,
          }}
        >
          <ArrowUpRight className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </Link>
  )
}
