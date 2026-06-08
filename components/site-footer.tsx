import Link from "next/link"
import { HobbyXLogo } from "./hobbyx-logo"
import { CategoryNav } from "./category-nav"
import { SITE_NAME } from "@/lib/site-config"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <HobbyXLogo href="/" size="sm" />
            <p className="mt-2 text-sm text-muted-foreground">
              8 categories · Season 4 competitions
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profile"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-border/50 bg-secondary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-foreground hover:border-primary/50"
            >
              Profile
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex w-fit items-center justify-center rounded-xl border border-border/50 bg-secondary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-foreground hover:border-primary/50"
            >
              Leaderboard
            </Link>
            <Link
              href="/submit"
              className="inline-flex w-fit items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              Submit entry
            </Link>
          </div>
        </div>
        <CategoryNav variant="footer" />
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. All competitions loaded from
          config.
        </p>
      </div>
    </footer>
  )
}
