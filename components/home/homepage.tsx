"use client"

import Link from "next/link"
import { PersonalAreaMainButton } from "./personal-area-main-button"
import { CategoryAccordion } from "./category-accordion"
import { HowItWorksSection } from "./how-it-works-section"

export function Homepage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <PersonalAreaMainButton />

        <CategoryAccordion />

        <Link
          href="/leaderboard"
          className="block w-full max-w-sm rounded-xl border border-border bg-card px-8 py-5 text-center transition-colors hover:border-primary/40 hover:bg-secondary"
        >
          <span className="block text-lg font-semibold text-foreground">
            Leaderboard
          </span>
          <span dir="rtl" className="mt-1 block text-lg font-semibold text-foreground/90">
            טבלת המובילים
          </span>
        </Link>

        <HowItWorksSection />

        <Link
          href="/arena"
          className="block w-full max-w-sm rounded-2xl border border-[#8b5cf6]/40 bg-gradient-to-b from-[#8b5cf6]/15 via-card to-secondary px-8 py-6 text-center shadow-[0_0_40px_rgba(139,92,246,0.12)] transition-all hover:border-[#a78bfa]/60 hover:shadow-[0_0_48px_rgba(139,92,246,0.2)]"
        >
          <span className="block text-lg font-semibold text-foreground">
            HobbyX Arena
          </span>
          <span dir="rtl" className="mt-1 block text-lg font-semibold text-[#7c3aed]">
            זירת האתגרים
          </span>
        </Link>
      </div>
    </main>
  )
}
