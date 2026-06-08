"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronRight } from "lucide-react"
import {
  getActiveCompetitionsByCategory,
  getCategories,
  type Category,
} from "@/lib/competitions"
import { getCategoryTitleHe } from "@/lib/category-images"
import { getCategoryVisual } from "@/lib/category-visuals"
import { formatUsd } from "@/lib/leaderboard-winners"
import {
  formatActiveCompetitionsSubLabel,
  formatActiveCompetitionsSubLabelEn,
} from "@/lib/category-labels"
import { getSubmissionTypeLabel } from "@/lib/submission-rules"
import { HomeCategoryCard } from "./home-category-card"

function CategoryAccordionItem({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const competitions = getActiveCompetitionsByCategory(category.slug)
  const visual = getCategoryVisual(category.slug)
  const titleHe =
    getCategoryTitleHe(category.slug) ??
    ("nameHe" in category ? category.nameHe : undefined)

  return (
    <div className="space-y-0">
      <HomeCategoryCard
        slug={category.slug}
        className={
          open
            ? "category-premium-card--open rounded-b-none border-b-0 ring-2 ring-[var(--category-neon)]/40"
            : ""
        }
      >
        <div className="flex w-full items-center justify-between gap-3 px-5 py-4 pl-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <p className="hobbyx-label-sub mb-1 text-[10px] uppercase tracking-[0.2em]">
              {visual.themeLabel}
            </p>
            <span className="hobbyx-label-title block truncate text-base md:text-lg">
              {category.name}
              {titleHe ? (
                <span>
                  {" "}
                  / <span dir="rtl">{titleHe}</span>
                </span>
              ) : null}
            </span>
            <span className="hobbyx-label-sub mt-1 block text-sm" dir="rtl">
              {formatActiveCompetitionsSubLabel(competitions.length)}
            </span>
            <span className="hobbyx-label-sub mt-0.5 block text-[11px] opacity-90">
              {formatActiveCompetitionsSubLabelEn(competitions.length)}
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/category/${category.slug}`}
              className="hidden rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground/80 backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-foreground sm:inline-block"
            >
              Zone
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Collapse" : "Expand"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/70 text-lg font-light text-foreground/70 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              {open ? "−" : "+"}
            </button>
          </div>
        </div>
      </HomeCategoryCard>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className="space-y-3 rounded-b-xl border border-t-0 px-4 pb-4 pt-3"
            style={{
              borderColor: `rgba(${visual.glowRgb}, 0.25)`,
              background: `linear-gradient(180deg, rgba(${visual.glowRgb}, 0.08) 0%, #e0f2fe 100%)`,
              boxShadow: `inset 4px 0 0 0 ${visual.neonAccent}`,
            }}
          >
            {competitions.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">No active competitions.</p>
            ) : (
              competitions.map((comp) => (
                <div
                  key={comp.id}
                  className="rounded-xl border border-border bg-background/80 p-4 backdrop-blur-sm transition-colors hover:border-border"
                  style={{
                    boxShadow: `0 0 0 1px rgba(${visual.glowRgb}, 0.06)`,
                  }}
                >
                  <p className="hobbyx-label-title text-base">{comp.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/65">
                    {comp.description}
                  </p>
                  <p className="mt-2 text-xs text-foreground/45">
                    Prize pool: {formatUsd(comp.prizePoolUsd)} ·{" "}
                    {getSubmissionTypeLabel(comp.submissionType)}
                  </p>
                  <Link
                    href={`/submit?category=${category.slug}&competition=${comp.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90"
                    style={{ color: visual.neonAccent }}
                  >
                    Enter competition
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
            <Link
              href={`/category/${category.slug}`}
              className="flex items-center justify-center gap-1 rounded-lg border border-border py-2.5 text-xs font-bold uppercase tracking-wider text-foreground/70 transition-colors hover:border-white/25 hover:text-foreground"
              style={{
                borderColor: `rgba(${visual.glowRgb}, 0.2)`,
              }}
            >
              View full {category.shortName} zone
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategoryAccordion() {
  const categories = getCategories()

  return (
    <section className="w-full max-w-sm space-y-3" aria-label="HobbyX categories">
      {categories.map((category) => (
        <CategoryAccordionItem key={category.slug} category={category} />
      ))}
    </section>
  )
}
