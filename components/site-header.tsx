"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, Trophy, Upload, X } from "lucide-react"
import { HobbyXLogo } from "./hobbyx-logo"
import { PersonalAreaLink } from "./profile/personal-area-link"
import { CategoryNav } from "./category-nav"
import { isCategorySlug } from "@/lib/competitions"
import type { CategorySlug } from "@/lib/competitions"

function getActiveSlugFromPath(pathname: string): CategorySlug | "home" | "leaderboard" {
  if (pathname.startsWith("/leaderboard")) return "leaderboard"
  const match = pathname.match(/^\/category\/([^/]+)/)
  const slug = match?.[1]
  if (slug && isCategorySlug(slug)) return slug
  return pathname === "/" ? "home" : "home"
}

export function SiteHeader() {
  const pathname = usePathname()
  const activeSlug = getActiveSlugFromPath(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="px-5 py-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div onClick={() => setMobileOpen(false)}>
            <HobbyXLogo href="/" size="md" className="shrink-0" />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-gradient-to-r from-[#8b5cf6]/20 via-[#06b6d4]/20 to-[#22c55e]/20 px-4 py-2 xl:flex">
              <span className="text-sm font-black uppercase tracking-widest text-foreground">
                HobbyX S4
              </span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
            </div>
            <Link
              href="/leaderboard"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeSlug === "leaderboard"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-sm bg-[#ff6b00] px-4 py-2 text-sm font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-transform hover:scale-105"
            >
              <Upload className="h-4 w-4" />
              Submit
            </Link>
            <PersonalAreaLink variant="compact" />
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-4 hidden lg:block">
          <CategoryNav activeSlug={activeSlug} />
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 px-5 py-4 lg:hidden">
          <CategoryNav
            activeSlug={activeSlug}
            onNavigate={() => setMobileOpen(false)}
          />
          <Link
            href="/leaderboard"
            onClick={() => setMobileOpen(false)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground"
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>
          <Link
            href="/submit"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
          >
            <Upload className="h-4 w-4" />
            Submit video
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground"
          >
            Personal Area / אזור אישי
          </Link>
        </div>
      )}
    </header>
  )
}
