"use client"

import Link from "next/link"
import { Sparkles, Trophy } from "lucide-react"
import { ZoneCard } from "./zone-card"
import { HomepageHero } from "./home/homepage-hero"
import { getCategories, getGlobalStats } from "@/lib/competitions"

export function CategoryBoard() {
  const categories = getCategories()
  const stats = getGlobalStats()
  const [featured, ...rest] = categories

  return (
    <div className="relative min-h-screen bg-background">
      <HomepageHero />

      {/* Stats strip — multicolor glass, not legacy orange-only */}
      <section className="relative z-20 -mt-8 mx-5 max-w-6xl md:mx-auto md:px-8">
        <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl md:gap-3">
          {[
            {
              value: stats.activeCompetitionCount,
              label: "Live events",
              accent: "from-[#22c55e] to-[#4ade80]",
            },
            {
              value: categories.length,
              label: "HobbyX zones",
              accent: "from-[#8b5cf6] to-[#ec4899]",
            },
            {
              value: `$${(stats.totalPrizePoolUsd / 1000).toFixed(1)}K`,
              label: "Prize pool",
              accent: "from-[#facc15] to-[#ff6b00]",
            },
          ].map(({ value, label, accent }) => (
            <div
              key={label}
              className={`rounded-xl bg-gradient-to-br ${accent} p-px shadow-lg`}
            >
              <div className="rounded-[11px] bg-card/95 px-4 py-6 text-center backdrop-blur-md md:py-8">
                <p className="font-mono text-3xl font-black text-foreground md:text-4xl">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Zone grid — bright thematic cards */}
      <main
        id="zones"
        className="relative scroll-mt-24 px-5 py-16 md:mx-auto md:max-w-7xl md:px-8 md:py-24"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.25), transparent 60%)",
          }}
        />
        <div className="relative mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="skew-label mb-2 inline-flex items-center gap-2 bg-gradient-to-r from-[#ec4899] via-[#8b5cf6] to-[#06b6d4] px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              HobbyX lineup
            </p>
            <h2 className="magazine-title bg-gradient-to-r from-slate-900 via-[#ea580c] to-[#0284c7] bg-clip-text text-4xl text-transparent md:text-5xl">
              Pick your zone
            </h2>
          </div>
          <p className="hobbyx-label-sub hidden max-w-xs text-right text-sm md:block">
            Eight themed battlegrounds. Compete, get scored, get paid.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {featured && (
            <ZoneCard
              category={featured}
              href={`/category/${featured.slug}`}
              featured
            />
          )}
          {rest.map((category) => (
            <ZoneCard
              key={category.slug}
              category={category}
              href={`/category/${category.slug}`}
            />
          ))}
        </div>

        <div className="relative mt-16 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1e1b4b]/80 via-[#0f172a]/90 to-[#134e4a]/80 p-8 backdrop-blur-xl md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ec4899]/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#06b6d4]/25 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="magazine-title text-3xl text-foreground md:text-4xl">
                Your hobby. Your bag.
              </h3>
              <p className="mt-2 font-medium text-foreground/70">
                Live camera or verified upload — AI judges every entry on HobbyX.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#22c55e]/50 bg-[#22c55e]/15 px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-[#bbf7d0] hover:bg-[#22c55e]/25"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                href="/submit"
                className="rounded-xl bg-gradient-to-r from-[#ffcc00] via-[#ff6b00] to-[#ec4899] px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-black shadow-[0_0_40px_rgba(255,107,0,0.45)] hover:scale-[1.02]"
              >
                Start challenge
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
