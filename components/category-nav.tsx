"use client"

import Link from "next/link"
import { getCategories, getCategoryNavLabel } from "@/lib/competitions"
import type { CategorySlug } from "@/lib/competitions"

interface CategoryNavProps {
  activeSlug?: CategorySlug | "home" | "leaderboard"
  variant?: "header" | "footer"
  onNavigate?: () => void
}

export function CategoryNav({
  activeSlug,
  variant = "header",
  onNavigate,
}: CategoryNavProps) {
  const categories = getCategories()
  const isFooter = variant === "footer"

  return (
    <nav
      aria-label="Categories"
      className={
        isFooter
          ? "grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4"
          : "flex gap-1 overflow-x-auto pb-1 scrollbar-thin md:flex-wrap md:overflow-visible md:pb-0"
      }
    >
      {!isFooter && (
        <Link
          href="/"
          onClick={onNavigate}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            activeSlug === "home"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          Home
        </Link>
      )}
      {categories.map((category) => {
        const isActive = activeSlug === category.slug
        return (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            onClick={onNavigate}
            title={category.name}
            className={
              isFooter
                ? "text-sm text-muted-foreground transition-colors hover:text-primary"
                : `shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`
            }
            style={
              !isFooter && isActive
                ? { backgroundColor: category.accentColor }
                : undefined
            }
          >
            {getCategoryNavLabel(category)}
          </Link>
        )
      })}
    </nav>
  )
}
