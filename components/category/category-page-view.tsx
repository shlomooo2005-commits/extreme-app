"use client"

import { useEffect, useState } from "react"
import { loadUserAccount } from "@/lib/user-account"
import Link from "next/link"
import { X } from "lucide-react"
import type { Category } from "@/lib/competitions"
import { getActiveCompetitionsByCategory } from "@/lib/competitions"
import type { CategoryFeedClip } from "@/lib/category-feed"
import { getCategoryVisual } from "@/lib/category-visuals"
import { CompetitionCard } from "@/components/competition-card"
import { CategoryThemeDecor } from "./category-theme-decor"
import { CategoryVideoFeed } from "./category-video-feed"

interface CategoryPageViewProps {
  category: Category
}

export function CategoryPageView({ category }: CategoryPageViewProps) {
  const [competitionsOpen, setCompetitionsOpen] = useState(false)
  const [clips, setClips] = useState<CategoryFeedClip[]>([])
  const [feedLoading, setFeedLoading] = useState(true)
  const [likedClipIds, setLikedClipIds] = useState<string[]>([])
  const visual = getCategoryVisual(category.slug)
  const competitions = getActiveCompetitionsByCategory(category.slug)

  useEffect(() => {
    let cancelled = false
    setFeedLoading(true)

    const account = loadUserAccount()
    const voterQuery = account?.id
      ? `&voterId=${encodeURIComponent(account.id)}`
      : ""
    fetch(
      `/api/submissions/feed?category=${encodeURIComponent(category.slug)}${voterQuery}`
    )
      .then((res) => res.json())
      .then(
        (data: { clips?: CategoryFeedClip[]; likedClipIds?: string[] }) => {
        if (cancelled) return
        if (Array.isArray(data.likedClipIds)) {
          setLikedClipIds(data.likedClipIds)
        }
        if (Array.isArray(data.clips)) {
          setClips(data.clips)
        }
      }
      )
      .catch(() => {
        if (!cancelled) setClips([])
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [category.slug])

  return (
    <div
      className={`category-theme-root ${visual.themeClass} relative min-h-[100dvh]`}
      style={{ background: visual.darkPageBackground }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: visual.pageAmbient }}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-25">
        <CategoryThemeDecor slug={category.slug} variant="page" />
      </div>
      <div className="relative z-[2]">
        <CategoryVideoFeed
          category={category}
          clips={clips}
          likedClipIds={likedClipIds}
          accentColor={visual.neonAccent}
          loading={feedLoading}
          onOpenCompetitions={() => setCompetitionsOpen(true)}
        />
      </div>

      {competitionsOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-label="Active competitions"
        >
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => setCompetitionsOpen(false)}
          />
          <div className="relative max-h-[85dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-4 pb-10 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="hobbyx-label-sub text-[10px] uppercase tracking-[0.25em]">
                  {category.name}
                </p>
                <h2 className="hobbyx-label-title text-lg">
                  Active competitions
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCompetitionsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-foreground"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {competitions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {competitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    competition={competition}
                    neonAccent={visual.neonAccent}
                    accentSecondary={visual.accentSecondary}
                    glowRgb={visual.glowRgb}
                    heroImageSrc={visual.heroImageSrc ?? undefined}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                New challenges are being added to this zone.
              </p>
            )}

            <Link
              href="/"
              className="mt-6 block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              All zones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
