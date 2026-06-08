import Image from "next/image"
import Link from "next/link"
import {
  formatUsd,
  getWinnersByCategory,
} from "@/lib/leaderboard-winners"
import { countryCodeToFlag } from "@/lib/leaderboard"

export function WinnersLeaderboard() {
  const winners = getWinnersByCategory()

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-5 sm:py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Home
        </Link>

        <h1 className="text-xl font-semibold sm:text-2xl">Leaderboard</h1>
        <p dir="rtl" className="mt-1 text-lg text-foreground/90 sm:text-xl">
          טבלת המובילים
        </p>

        {winners.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No ranked winners yet. Submit your entry and climb the board when
            competitions fill up.
          </p>
        ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-8">
          {winners.map(
            ({
              categorySlug,
              categoryName,
              competition,
              winner,
              prizeEarnedUsd,
            }) => (
              <article
                key={categorySlug}
                className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <h2 className="text-base font-medium leading-snug sm:text-lg">
                  {categoryName}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {competition.title}
                </p>

                <div className="relative mt-4 aspect-video h-48 w-full overflow-hidden rounded-lg bg-black sm:h-56 md:h-64">
                  <Image
                    src={winner.videoThumbnailUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 512px"
                  />
                </div>

                <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className="shrink-0 text-xl leading-none sm:text-2xl"
                    role="img"
                    aria-label={winner.countryName}
                  >
                    {countryCodeToFlag(winner.countryCode)}
                  </span>
                  <p className="min-w-0 break-words text-base font-medium leading-snug sm:text-lg">
                    {winner.athleteName}
                  </p>
                </div>
                <p className="mt-2 text-base font-semibold tabular-nums text-[#4ade80] sm:text-lg">
                  {formatUsd(prizeEarnedUsd)} earned
                </p>
              </article>
            )
          )}
        </div>
        )}
      </div>
    </div>
  )
}
