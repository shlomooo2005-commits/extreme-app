import type { CategorySlug } from "@/lib/competitions"

export const SPORT_INTERESTS = [
  {
    slug: "dirt-jump-biking",
    label: "Dirt Jump Biking",
    categorySlug: "mountain-biking",
  },
  {
    slug: "mountain-biking",
    label: "Mountain Biking",
    categorySlug: "mountain-biking",
  },
  {
    slug: "freediving",
    label: "Freediving",
    categorySlug: "extreme",
  },
  {
    slug: "extreme",
    label: "Extreme",
    categorySlug: "extreme",
  },
  {
    slug: "stand-up-paddleboarding",
    label: "Stand-up Paddleboarding",
    categorySlug: "surfing",
  },
  {
    slug: "surfing",
    label: "Surfing",
    categorySlug: "surfing",
  },
  {
    slug: "football",
    label: "Football",
    categorySlug: "football",
  },
  {
    slug: "basketball",
    label: "Basketball",
    categorySlug: "basketball",
  },
  {
    slug: "calisthenics",
    label: "Calisthenics",
    categorySlug: "calisthenics",
  },
  {
    slug: "music",
    label: "Music / Singing",
    categorySlug: "music",
  },
  {
    slug: "random",
    label: "Random",
    categorySlug: "random",
  },
] as const

export type SportInterestSlug = (typeof SPORT_INTERESTS)[number]["slug"]

const INTEREST_BY_SLUG = new Map(
  SPORT_INTERESTS.map((interest) => [interest.slug, interest]),
)

const DEFAULT_SECTION_LABELS: Partial<Record<CategorySlug, string>> = {
  "mountain-biking": "Dirt Jump Biking",
  extreme: "Freediving",
  surfing: "Stand-up Paddleboarding",
  football: "Football",
  basketball: "Basketball",
  calisthenics: "Calisthenics",
  music: "Music / Singing",
  random: "Random",
}

export function isSportInterestSlug(value: string): value is SportInterestSlug {
  return INTEREST_BY_SLUG.has(value as SportInterestSlug)
}

export function resolveInterestCategorySlugs(
  interests: string[],
): CategorySlug[] {
  const slugs = new Set<CategorySlug>()

  for (const interest of interests) {
    if (!isSportInterestSlug(interest)) continue
    slugs.add(INTEREST_BY_SLUG.get(interest)!.categorySlug)
  }

  return [...slugs]
}

export function getCategorySectionLabel(
  categorySlug: CategorySlug,
  preferredInterests: string[] = [],
): string {
  for (const interestSlug of preferredInterests) {
    if (!isSportInterestSlug(interestSlug)) continue
    const interest = INTEREST_BY_SLUG.get(interestSlug)
    if (interest?.categorySlug === categorySlug) {
      return interest.label
    }
  }

  return DEFAULT_SECTION_LABELS[categorySlug] ?? categorySlug
}

export function getInterestLabels(preferredInterests: string[]): string[] {
  return preferredInterests
    .filter(isSportInterestSlug)
    .map((slug) => INTEREST_BY_SLUG.get(slug)!.label)
}
