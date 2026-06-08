"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles } from "lucide-react"
import type { DashboardCategorySection } from "@/lib/dashboard-feed"
import { getCategoryBySlug } from "@/lib/competitions"
import { getCategoryCardImage } from "@/lib/category-images"
import { CompetitionFeedCard } from "@/components/dashboard/competition-feed-card"

interface CompetitionCategoryRowProps {
  section: DashboardCategorySection
}

export function CompetitionCategoryRow({ section }: CompetitionCategoryRowProps) {
  const category = getCategoryBySlug(section.categorySlug)
  const accent = category?.accentColor ?? "#ff6b00"
  const thumbnail = getCategoryCardImage(section.categorySlug)
  const sectionKey = section.interestSlug ?? section.categorySlug

  return (
    <section className="space-y-4" aria-labelledby={`category-${sectionKey}`}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border shadow-md sm:h-16 sm:w-16"
            style={{ boxShadow: `0 0 0 2px ${accent}33` }}
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accent}22 0%, ${accent}55 100%)`,
                }}
              >
                <Sparkles className="h-5 w-5 text-foreground/50" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h2
              id={`category-${sectionKey}`}
              className="hobbyx-label-title text-lg sm:text-xl"
            >
              {section.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {section.competitions.length} active competition
              {section.competitions.length === 1 ? "" : "s"}
              {section.interestSlug && (
                <span className="text-foreground/40"> · {category?.name}</span>
              )}
            </p>
          </div>
        </div>

        <Link
          href={`/category/${section.categorySlug}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0284c7] transition-opacity hover:opacity-80"
          style={{ color: accent }}
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {section.competitions.map((competition) => (
          <CompetitionFeedCard key={competition.id} competition={competition} compact />
        ))}
      </div>
    </section>
  )
}
