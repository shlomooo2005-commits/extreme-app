import type { CategorySlug } from "@/lib/competitions"
import { getCategoryHeroImage } from "@/lib/category-images"

export type CategoryThemeId =
  | "music"
  | "surfing"
  | "cycling"
  | "diving"
  | "extreme"
  | "soccer"
  | "basketball"
  | "random"
  | "calisthenics"

/** Per-zone visual identity — bright light-blue base + sport accents */
export interface CategoryVisual {
  themeId: CategoryThemeId
  themeClass: string
  heroImageSrc: string | null
  neonAccent: string
  accentSecondary: string
  glowRgb: string
  themeLabel: string
  cardOverlay: string
  darkPageBackground: string
  pageAmbient: string
  sportGradient: string
}

const lightPage = (accentRgb: string, mid = "#e3f2fd", deep = "#dbeafe") =>
  `radial-gradient(ellipse 90% 55% at 50% -12%, ${accentRgb} 0%, transparent 52%), linear-gradient(180deg, #e8f4fc 0%, ${mid} 48%, ${deep} 100%)`

const lightCardOverlay = (r: number, g: number, b: number) =>
  `linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(${r},${g},${b},0.14) 55%, rgba(224,242,254,0.94) 100%)`

const lightSportGradient = (r: number, g: number, b: number) =>
  `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(${r},${g},${b},0.22) 50%, rgba(186,230,253,0.35) 100%)`

export const CATEGORY_VISUALS: Record<CategorySlug, CategoryVisual> = {
  "mountain-biking": {
    themeId: "cycling",
    themeClass: "category-theme--cycling",
    themeLabel: "Trail & dirt",
    heroImageSrc: getCategoryHeroImage("mountain-biking"),
    neonAccent: "#16A34A",
    accentSecondary: "#EA580C",
    glowRgb: "22, 163, 74",
    cardOverlay: lightCardOverlay(34, 197, 94),
    darkPageBackground: lightPage("rgba(34,197,94,0.2)", "#e8f8ef", "#dbeafe"),
    pageAmbient:
      "radial-gradient(circle at 20% 30%, rgba(34,197,94,0.15), transparent 45%), radial-gradient(circle at 80% 70%, rgba(234,88,12,0.1), transparent 40%)",
    sportGradient: lightSportGradient(34, 197, 94),
  },
  surfing: {
    themeId: "surfing",
    themeClass: "category-theme--surfing",
    themeLabel: "Surf & waves",
    heroImageSrc: getCategoryHeroImage("surfing"),
    neonAccent: "#0891B2",
    accentSecondary: "#0284C7",
    glowRgb: "8, 145, 178",
    cardOverlay: lightCardOverlay(6, 182, 212),
    darkPageBackground: lightPage("rgba(6,182,212,0.22)", "#e0f7fa", "#dbeafe"),
    pageAmbient:
      "radial-gradient(circle at 30% 20%, rgba(6,182,212,0.18), transparent 50%), radial-gradient(circle at 70% 80%, rgba(14,165,233,0.12), transparent 45%)",
    sportGradient: lightSportGradient(6, 182, 212),
  },
  random: {
    themeId: "random",
    themeClass: "category-theme--random",
    themeLabel: "Wildcard zone",
    heroImageSrc: null,
    neonAccent: "#A855F7",
    accentSecondary: "#0891B2",
    glowRgb: "168, 85, 247",
    cardOverlay: lightCardOverlay(168, 85, 247),
    darkPageBackground: lightPage("rgba(168,85,247,0.18)", "#f3e8ff", "#e0f2fe"),
    pageAmbient:
      "radial-gradient(circle at 25% 35%, rgba(168,85,247,0.14), transparent 48%), radial-gradient(circle at 75% 65%, rgba(6,182,212,0.1), transparent 42%)",
    sportGradient: lightSportGradient(168, 85, 247),
  },
  extreme: {
    themeId: "extreme",
    themeClass: "category-theme--extreme",
    themeLabel: "Extreme · fire",
    heroImageSrc: getCategoryHeroImage("extreme"),
    neonAccent: "#EA580C",
    accentSecondary: "#DC2626",
    glowRgb: "234, 88, 12",
    cardOverlay: lightCardOverlay(234, 88, 12),
    darkPageBackground: lightPage("rgba(249,115,22,0.2)", "#fff7ed", "#e0f2fe"),
    pageAmbient:
      "radial-gradient(circle at 50% 30%, rgba(249,115,22,0.16), transparent 55%), radial-gradient(circle at 20% 80%, rgba(220,38,38,0.08), transparent 42%)",
    sportGradient: lightSportGradient(234, 88, 12),
  },
  football: {
    themeId: "soccer",
    themeClass: "category-theme--soccer",
    themeLabel: "Soccer pitch",
    heroImageSrc: getCategoryHeroImage("football"),
    neonAccent: "#DC2626",
    accentSecondary: "#EA580C",
    glowRgb: "220, 38, 38",
    cardOverlay: lightCardOverlay(34, 197, 94),
    darkPageBackground: lightPage("rgba(34,197,94,0.18)", "#ecfdf5", "#dbeafe"),
    pageAmbient:
      "radial-gradient(circle at 35% 30%, rgba(34,197,94,0.12), transparent 48%), radial-gradient(circle at 80% 70%, rgba(234,88,12,0.1), transparent 42%)",
    sportGradient: lightSportGradient(34, 197, 94),
  },
  basketball: {
    themeId: "basketball",
    themeClass: "category-theme--basketball",
    themeLabel: "Hardwood",
    heroImageSrc: getCategoryHeroImage("basketball"),
    neonAccent: "#EA580C",
    accentSecondary: "#DC2626",
    glowRgb: "234, 88, 12",
    cardOverlay: lightCardOverlay(251, 146, 60),
    darkPageBackground: lightPage("rgba(251,146,60,0.18)", "#fff7ed", "#dbeafe"),
    pageAmbient:
      "radial-gradient(circle at 40% 25%, rgba(251,146,60,0.14), transparent 50%), radial-gradient(circle at 85% 75%, rgba(239,68,68,0.08), transparent 45%)",
    sportGradient: lightSportGradient(251, 146, 60),
  },
  calisthenics: {
    themeId: "calisthenics",
    themeClass: "category-theme--calisthenics",
    themeLabel: "Street power",
    heroImageSrc: getCategoryHeroImage("calisthenics"),
    neonAccent: "#CA8A04",
    accentSecondary: "#EAB308",
    glowRgb: "202, 138, 4",
    cardOverlay: lightCardOverlay(234, 179, 8),
    darkPageBackground: lightPage("rgba(234,179,8,0.16)", "#fefce8", "#e0f2fe"),
    pageAmbient:
      "radial-gradient(circle at 30% 40%, rgba(234,179,8,0.12), transparent 48%), radial-gradient(circle at 75% 60%, rgba(202,138,4,0.08), transparent 42%)",
    sportGradient: lightSportGradient(234, 179, 8),
  },
  music: {
    themeId: "music",
    themeClass: "category-theme--music",
    themeLabel: "Music & karaoke",
    heroImageSrc: getCategoryHeroImage("music"),
    neonAccent: "#DB2777",
    accentSecondary: "#E11D48",
    glowRgb: "219, 39, 119",
    cardOverlay: lightCardOverlay(236, 72, 153),
    darkPageBackground: lightPage("rgba(236,72,153,0.18)", "#fdf2f8", "#e0f2fe"),
    pageAmbient:
      "radial-gradient(circle at 25% 30%, rgba(236,72,153,0.14), transparent 50%), radial-gradient(circle at 80% 70%, rgba(225,29,72,0.1), transparent 45%)",
    sportGradient: lightSportGradient(236, 72, 153),
  },
}

export function getCategoryVisual(slug: CategorySlug): CategoryVisual {
  return CATEGORY_VISUALS[slug]
}
