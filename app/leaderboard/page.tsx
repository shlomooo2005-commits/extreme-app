import { WinnersLeaderboard } from "@/components/leaderboard/winners-leaderboard"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "Winners Leaderboard",
  description:
    "HobbyX winners by domain — winning videos and exact prize earnings. טבלת המובילים.",
  path: "/leaderboard",
})

export default function LeaderboardPage() {
  return <WinnersLeaderboard />
}
