import { CompetitionUpload } from "@/components/competition-upload"
import { SubmitEntryGate } from "@/components/submit/submit-entry-gate"
import type { CompetitionCategorySlug } from "@/lib/submission"
import { resolveCategorySlug } from "@/lib/competitions"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "Submit Entry",
  description: "Submit your HobbyX competition entry — live camera or verified upload.",
  path: "/submit",
})

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; competition?: string }>
}) {
  const { category: categoryParam, competition: competitionId } =
    await searchParams
  const defaultCategory: CompetitionCategorySlug =
    (categoryParam && resolveCategorySlug(categoryParam)) || "mountain-biking"

  return (
    <main className="min-h-screen overflow-x-hidden bg-background px-4 py-8 sm:px-5 md:px-8 md:py-12">
      <SubmitEntryGate>
        <div className="mx-auto max-w-2xl">
          <header className="mb-8 text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#00e5ff]">
              HobbyX · Season 4
            </p>
            <h1 className="hobbyx-label-title text-2xl uppercase tracking-tight sm:text-3xl">
              Competition entry
            </h1>
            <p dir="rtl" className="hobbyx-label-sub mt-2 text-base">
              הגשת תחרות
            </p>
          </header>
          <CompetitionUpload
            defaultCategory={defaultCategory}
            defaultCompetitionId={competitionId}
          />
        </div>
      </SubmitEntryGate>
    </main>
  )
}
