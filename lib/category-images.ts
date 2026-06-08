/**
 * Single source of truth for category photos.
 * Homepage cards, zone heroes, and category pages must use these helpers — not hardcoded URLs in components.
 */

/** גלישה — surfer on a wave (Unsplash: 9nwdImeBZRk) */
export const SURFING_CARD =
  "https://images.unsplash.com/photo-1748711582007-4049739e1ca5?auto=format&fit=crop&w=1200&h=800&q=90"
export const SURFING_HERO =
  "https://images.unsplash.com/photo-1748711582007-4049739e1ca5?auto=format&fit=crop&w=2400&h=1600&q=90"

/** אופני הרים — mountain biker on wooded trail (Unsplash: 7bgq0SlxBw0) */
export const MOUNTAIN_BIKING_CARD =
  "https://images.unsplash.com/photo-1760892472639-82ae26956da2?auto=format&fit=crop&w=1200&h=800&q=90"
export const MOUNTAIN_BIKING_HERO =
  "https://images.unsplash.com/photo-1760892472639-82ae26956da2?auto=format&fit=crop&w=2400&h=1600&q=90"

/** אקסטרים — extreme fire motif (local SVG) */
export const EXTREME_CARD = "/categories/extreme-flame.svg"
export const EXTREME_HERO = "/categories/extreme-flame.svg"

/** Homepage display copy — titles + Hebrew labels for main accordion */
export const CATEGORY_HOME_LABELS = {
  surfing: { titleHe: "גלישה" },
  "mountain-biking": { titleHe: "אופני הרים" },
  extreme: { titleHe: "אקסטרים" },
  random: { titleHe: "רנדומלי" },
  music: { titleHe: "מוזיקה" },
} as const

export function getCategoryTitleHe(slug: string): string | undefined {
  if (slug in CATEGORY_HOME_LABELS) {
    return CATEGORY_HOME_LABELS[slug as keyof typeof CATEGORY_HOME_LABELS]
      .titleHe
  }
  return undefined
}

const OTHER_CARD_IMAGES = {
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&h=800&q=90",
  basketball:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&h=800&q=90",
  calisthenics:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&h=800&q=90",
  music:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&h=800&q=90",
} as const

export const CATEGORY_CARD_IMAGES = {
  surfing: SURFING_CARD,
  "mountain-biking": MOUNTAIN_BIKING_CARD,
  extreme: EXTREME_CARD,
  ...OTHER_CARD_IMAGES,
} as const

export type CategoryWithImage = keyof typeof CATEGORY_CARD_IMAGES

const OTHER_HERO_IMAGES = {
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&h=1080&q=90",
  basketball:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&h=1080&q=90",
  calisthenics:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&h=1080&q=90",
  music:
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1920&h=1080&q=90",
} as const

export const CATEGORY_HERO_IMAGES = {
  surfing: SURFING_HERO,
  "mountain-biking": MOUNTAIN_BIKING_HERO,
  extreme: EXTREME_HERO,
  ...OTHER_HERO_IMAGES,
} as const

export function categoryHasImage(slug: string): slug is CategoryWithImage {
  return slug !== "random" && slug in CATEGORY_CARD_IMAGES
}

/** Card / accordion background — call at render time from UI components */
export function getCategoryCardImage(slug: string): string | null {
  if (!categoryHasImage(slug)) return null
  return CATEGORY_CARD_IMAGES[slug]
}

/** Category page hero — call at render time from UI components */
export function getCategoryHeroImage(slug: string): string | null {
  if (!categoryHasImage(slug)) return null
  return CATEGORY_HERO_IMAGES[slug as CategoryWithImage]
}

/** Everything the homepage accordion / zone grid needs from this module */
export function getCategoryHomeCard(slug: string) {
  return {
    cardImage: getCategoryCardImage(slug),
    titleHe: getCategoryTitleHe(slug),
  }
}
