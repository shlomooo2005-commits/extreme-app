/**
 * Competition catalog — edit CATEGORIES and COMPETITIONS to add, remove, or update
 * entries. UI reads from these helpers only; no competition copy lives in components.
 */

import { getCategoryCardImage } from "@/lib/category-images"

export const CATEGORIES = [
  {
    slug: "surfing",
    name: "Surfing",
    shortName: "Surfing",
    tagline: "Waves, barrels & aerials",
    accentColor: "#0891B2",
  },
  {
    slug: "mountain-biking",
    name: "Mountain Biking",
    shortName: "MTB",
    tagline: "Trails, jumps & technical lines",
    accentColor: "#D97706",
  },
  {
    slug: "random",
    name: "Random",
    nameHe: "רנדומלי",
    shortName: "Random",
    tagline: "Wildcard surprises — anything goes",
    accentColor: "#A855F7",
  },
  {
    slug: "extreme",
    name: "Extreme",
    nameHe: "אקסטרים",
    shortName: "Extreme",
    tagline: "Extreme heat · depth & adrenaline",
    accentColor: "#FF5500",
  },
  {
    slug: "football",
    name: "Football (Soccer)",
    shortName: "Football",
    tagline: "Skills, goals & match moments",
    accentColor: "#16A34A",
  },
  {
    slug: "basketball",
    name: "Basketball",
    shortName: "Basketball",
    tagline: "Handles, hops & highlight plays",
    accentColor: "#EA580C",
  },
  {
    slug: "calisthenics",
    name: "Street Workout / Calisthenics",
    shortName: "Calisthenics",
    tagline: "Strength, skills & freestyle",
    accentColor: "#DC2626",
  },
  {
    slug: "music",
    name: "Music / Singing",
    nameHe: "מוזיקה",
    shortName: "Music",
    tagline: "Karaoke, covers & crowd-loved vocals",
    accentColor: "#E11D48",
  },
] as const

/** Resolved at read time from lib/category-images.ts (not stored on category rows). */
export function getCategoryImageSrc(slug: CategorySlug): string | null {
  return getCategoryCardImage(slug)
}

export type CategorySlug = (typeof CATEGORIES)[number]["slug"]

export type CompetitionStatus = "active" | "upcoming" | "closed"

export type CompetitionDifficulty = "beginner" | "intermediate" | "expert"

/** How athletes must submit video for this competition */
export type SubmissionType = "LIVE_CAMERA_ONLY" | "VERIFIED_UPLOAD"

/** How the active contest winner is determined (per competition instance). */
export type CompetitionJudgedBy = "likes" | "AI"

export interface Competition {
  id: string
  categorySlug: CategorySlug
  title: string
  description: string
  status: CompetitionStatus
  submissionType: SubmissionType
  startDate: string
  endDate: string
  prizePoolUsd: number
  /** When set, shown instead of USD formatting (e.g. "₪500") */
  prizeDisplay?: string
  /** Countdown badge on competition cards (e.g. "נותרו שבועיים") */
  countdownBadge?: string
  /** Max clip length in seconds (e.g. 15 for MTB feed clips) */
  maxVideoSeconds?: number
  /** Winner selection: crowd likes (default) or AI evaluation */
  judgedBy: CompetitionJudgedBy
  /** When set, submit flow uses karaoke recorder + lib/karaoke-challenges */
  karaokeChallengeId?: string
  entrantCount: number
  difficulty: CompetitionDifficulty
}

const MTB_SHARED_RULES = `⏱️ חוק ברזל: משך הסרטון עד 15 שניות מקסימום (כדי שיהיה קל ומהיר לגלול בפיד).
👍 שיפוט: 100% לפי לייקים של גולשים ומיקום בטבלה.
🔒 הצבעה: רק משתמשים רשומים שאימתו שם וטלפון.
📤 העלאה: מותר מהגלריה / GoPro.
🚫 אסור: חיתוכים, עריכות או פילטרים בתוך הקליפ.`

export const COMPETITIONS: Competition[] = [
  {
    id: "mtb-ultimate-whip",
    categorySlug: "mountain-biking",
    title: "מלך הסטייל: הוייפ הכי מטורף | The Ultimate Whip",
    description: `טסים על הרמפה וזורקים את הזנב של האופניים הצידה? שלחו את הוייפ הכי מטורף שלכם באוויר (עד 15 שניות)! מי שיקבל את כמות הלייקים הגבוהה ביותר מהגולשים יקח את הפרס!
${MTB_SHARED_RULES}`,
    status: "active",
    submissionType: "VERIFIED_UPLOAD",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    entrantCount: 0,
    difficulty: "intermediate",
  },
  {
    id: "mtb-urban-stair-jumper",
    categorySlug: "mountain-biking",
    title: "אורבן אקסטרים: קפיצת מדרגות | Urban Stair Jumper",
    description: `סטריט טהור! שלחו לנו קפיצה מעל גרם מדרגות מטורף, הזוי או ארוך במיוחד בעיר. סרטון קצר וקולע של עד 15 שניות שיגרוף את מירב הלייקים מהקהל ינצח!
${MTB_SHARED_RULES}`,
    status: "active",
    submissionType: "VERIFIED_UPLOAD",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    entrantCount: 0,
    difficulty: "expert",
  },
  {
    id: "mtb-big-drop",
    categorySlug: "mountain-biking",
    title: "ללא פחד: הדרופ הכי גדול | The Big Drop",
    description: `סלעים בסינגלים או מבנים בעיר - שלחו את הדרופ הכי גבוה והכי מפחיד ששיחררתם. סרטון נקי של עד 15 שניות, תאספו לייקים, והדרופ המוביל בטבלה זוכה!
${MTB_SHARED_RULES}`,
    status: "active",
    submissionType: "VERIFIED_UPLOAD",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    entrantCount: 0,
    difficulty: "expert",
  },
  {
    id: "football-season-4-skills",
    categorySlug: "football",
    title: "אתגר הנגיחות הגדול | The Twin Headers",
    description: `תפסו חבר וצאו למגרש! חושבים שיש לכם את הטאץ' הכי טוב בראש? המשימה פשוטה: שני שחקנים מקפיצים אחד לשני אך ורק עם הראש! הזוג שמצליח להחזיק את הכדור באוויר להכי הרבה זמן – מנצח!
🚫 חוק ברזל: הצילום מתבצע אך ורק דרך המצלמה המובנית של אפליקציית HobbyX! לא יתקבלו סרטוני גו-פרו, קאטים או עריכות. הסרטון חייב להיות רציף ומלא – מהנגיחה הראשונה ועד שהכדור נוגע ברצפה.
🤖 ה-AI שלנו ינתח את הסרטונים, יוודא שלא היה מגע ביד או ברגל, וימדוד על המאית את הזמן המדויק שהכדור נשאר באוויר. הזוג שיחזיק הכי הרבה זמן יתייצב בראש הטבלה ויזכה ב-₪300!`,
    status: "active",
    submissionType: "LIVE_CAMERA_ONLY",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    judgedBy: "AI",
    entrantCount: 0,
    difficulty: "expert",
  },
  {
    id: "football-street-style-nutmeg",
    categorySlug: "football",
    title: "מלך השכונה: דאבל סקיל וגול | Street Style Showdown",
    description: `חושבים שיש לכם דריבל ברזילאי? תעבירו שני שחקנים בסטייל מטורף (בין הרגליים, סומבררו, מה שבא לכם) ותשחילו גול לשוער – הכל ב-15 שניות ברצף! מי שעושה את זה הכי מגניב ומקבל הכי הרבה לייקים מהקהל לוקח ₪500!
⏱️ חוק ברזל: סרטון רציף אחד עד 15 שניות — דאבל נוטמג (או סקיל כפול) וגול באותו קליפ.
👍 שיפוט: 100% לפי לייקים של גולשים בפיד ובטבלה.
🔒 הצבעה: רק משתמשים רשומים שאימתו שם וטלפון.
🚫 חוק ברזל: הצילום מתבצע אך ורק דרך המצלמה המובנית של אפליקציית HobbyX! לא יתקבלו סרטוני גו-פרו, קאטים או עריכות.`,
    status: "active",
    submissionType: "LIVE_CAMERA_ONLY",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 500,
    prizeDisplay: "₪500",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    entrantCount: 0,
    difficulty: "expert",
  },
  {
    id: "basketball-season-4-hoops",
    categorySlug: "basketball",
    title: "טורניר ה-AI: הישרדות שלשות",
    description: `האתגר הכי קשוח והוגן ברשת! יש לכם שבועיים בלבד להעלות סרטון אחד רציף שמראה הצלחה ב-4 השלבים הבאים לפי הסדר:
1. שלב א': קליעה בישיבה מקו העונשין 🏀
2. שלב ב': קליעה בישיבה מקו החצי (בשתי ידיים) 🎯
3. שלב ג': קליעה בישיבה מקו החצי ביד אחת בלבד! 💥
4. שלב ד' (שבירת שוויון): קליעה בישיבה מקו החצי עם הגב לסל! 👑
🚫 חוק ברזל: הצילום מתבצע אך ורק דרך המצלמה המובנית של אפליקציית HobbyX! לא יתקבלו סרטוני גו-פרו, קאטים או עריכות חיצוניות. רק סרטון אחד שלם שמתעד את כל הרצף.
🤖 אם יהיו כמה פנומנים שישלימו את כל 4 השלבים, ה-AI שלנו ינתח את סרטון הגב-לסל ויקבע מי ביצע את הקליעה בצורה הכי חלקה ונקייה (Swish) כדי לזכות ב-₪500!`,
    status: "active",
    submissionType: "LIVE_CAMERA_ONLY",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 500,
    prizeDisplay: "₪500",
    countdownBadge: "נותרו שבועיים",
    judgedBy: "AI",
    entrantCount: 0,
    difficulty: "expert",
  },
  {
    id: "basketball-creative-layup",
    categorySlug: "basketball",
    title: "הלייאפ הכי מגניב | The Creative Layup",
    description: `עזבו אתכם מסתם צעד וחצי משעמם. תביאו את הלייאפ הכי משוגע ויצירתי שלכם באוויר (עד 15 שניות)! סיבובים, שינויי ידיים, או זריקות קירקס מהלוח – הסרטון שיקבל הכי הרבה לייקים מהגולשים יזכה בפרס של ₪300!
⏱️ חוק ברזל: סרטון רציף אחד עד 15 שניות.
👍 שיפוט: 100% לפי לייקים של גולשים בפיד ובטבלה.
🔒 הצבעה: רק משתמשים רשומים שאימתו שם וטלפון.
🚫 חוק ברזל: הצילום מתבצע אך ורק דרך המצלמה המובנית של אפליקציית HobbyX! לא יתקבלו סרטוני גו-פרו, קאטים או עריכות.`,
    status: "active",
    submissionType: "LIVE_CAMERA_ONLY",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    entrantCount: 0,
    difficulty: "intermediate",
  },
  {
    id: "music-tehom-karaoke",
    categorySlug: "music",
    title: "תהום של רגש: מי מעתיק את עומר אדם? | Tehom Karaoke",
    description: `חושבים שיש לכם את הקול והרגש של עומר אדם? האפליקציה תיתן לכם 15 שניות של מנגינת קריוקי עם כתוביות של קטע השיא מהשיר "תהום"! תנו את הביצוע הכי חזק שלכם. מי שמבצע הכי טוב ומקבל את מירב הלייקים מהקהל (תחת אלגוריתם הסינון שלנו) יזכה ב-₪300!
⏱️ חוק ברזל: הקלטה חיה של 15 שניות עם מסלול הקריוקי באפליקציה.
👍 שיפוט: 100% לפי לייקים של גולשים בפיד ובטבלה.
🔒 הצבעה: רק משתמשים רשומים שאימתו שם וטלפון.
🚫 חוק ברזל: הצילום והשירה מתבצעים אך ורק דרך מצלמת האפליקציה — בלי קאטים או עריכות.`,
    status: "active",
    submissionType: "LIVE_CAMERA_ONLY",
    startDate: "2026-05-31",
    endDate: "2026-06-14",
    prizePoolUsd: 300,
    prizeDisplay: "₪300",
    countdownBadge: "נותרו שבועיים",
    maxVideoSeconds: 15,
    judgedBy: "likes",
    karaokeChallengeId: "tehom",
    entrantCount: 0,
    difficulty: "intermediate",
  },
]

export function getActiveCompetitions(): Competition[] {
  return COMPETITIONS.filter((c) => c.status === "active")
}

export type Category = (typeof CATEGORIES)[number]

export function getCategories(): Category[] {
  return [...CATEGORIES]
}

/** Legacy slugs kept for bookmarks and old links */
const LEGACY_CATEGORY_SLUG_ALIASES: Record<string, CategorySlug> = {
  freediving: "extreme",
  "vocal-singing": "music",
}

/** Retired competition IDs → current active replacement */
const LEGACY_COMPETITION_ID_ALIASES: Record<string, string> = {
  "basketball-half-court-heave": "basketball-creative-layup",
  "basketball-steal-and-score": "basketball-creative-layup",
}

export function resolveCompetitionId(id: string): string {
  return LEGACY_COMPETITION_ID_ALIASES[id] ?? id
}

export function resolveCategorySlug(slug: string): CategorySlug | null {
  const resolved = LEGACY_CATEGORY_SLUG_ALIASES[slug] ?? slug
  return isCategorySlug(resolved) ? resolved : null
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const resolved = LEGACY_CATEGORY_SLUG_ALIASES[slug] ?? slug
  return CATEGORIES.find((c) => c.slug === resolved)
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug)
}

export function getCompetitionsByCategory(
  categorySlug: CategorySlug,
  options?: { status?: CompetitionStatus }
): Competition[] {
  return COMPETITIONS.filter((c) => {
    if (c.categorySlug !== categorySlug) return false
    if (options?.status && c.status !== options.status) return false
    return true
  })
}

export function getActiveCompetitionsByCategory(
  categorySlug: CategorySlug
): Competition[] {
  return getCompetitionsByCategory(categorySlug, { status: "active" })
}

export function getCompetitionById(id: string): Competition | undefined {
  const resolved = resolveCompetitionId(id)
  return COMPETITIONS.find((c) => c.id === resolved)
}

export function getGlobalStats() {
  const active = COMPETITIONS.filter((c) => c.status === "active")
  const totalPrizePool = active.reduce((sum, c) => sum + c.prizePoolUsd, 0)
  const totalEntrants = active.reduce((sum, c) => sum + c.entrantCount, 0)

  return {
    activeCompetitionCount: active.length,
    totalPrizePoolUsd: totalPrizePool,
    totalEntrants,
  }
}

/** For upload form & API — { slug, label } pairs */
export function getCategoryOptions() {
  return CATEGORIES.map((c) => ({ slug: c.slug, label: c.name }))
}

export function getCategoryNavLabel(category: Category): string {
  return category.shortName
}
