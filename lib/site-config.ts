import type { Metadata } from "next"

export const SITE_NAME = "HobbyX"
export const SITE_SHORT_DESCRIPTION =
  "AI-judged competition platform for action sports, ball sports, calisthenics, and vocal challenges."
export const SITE_DESCRIPTION =
  "Compete on HobbyX across mountain biking, surfing, extreme, football, basketball, calisthenics, and vocal challenges. Upload your run, get AI scores, and climb the leaderboard."

/** Resolve canonical site URL for metadata and OG tags */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  }
  return "http://localhost:3000"
}

export function pageTitle(segment?: string): string {
  return segment ? `${segment} | ${SITE_NAME}` : `${SITE_NAME} — Compete & Conquer`
}

export function createPageMetadata(options: {
  title?: string
  description?: string
  path?: string
}): Metadata {
  const { title, description = SITE_SHORT_DESCRIPTION, path = "" } = options
  const url = `${getSiteUrl()}${path}`
  const ogTitle = title ? pageTitle(title) : `${SITE_NAME} — Compete & Conquer`

  return {
    title: title ?? `${SITE_NAME} — Compete & Conquer`,
    description,
    metadataBase: new URL(getSiteUrl()),
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: {
    default: `${SITE_NAME} — Compete & Conquer`,
    template: `%s | ${SITE_NAME}`,
  },
}
