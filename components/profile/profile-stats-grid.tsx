import {
  Award,
  BarChart3,
  Medal,
  Target,
  Upload,
  Video,
} from "lucide-react"
import type { ProfileStats } from "@/lib/user-profile"

interface ProfileStatsGridProps {
  stats: ProfileStats
}

export function ProfileStatsGrid({ stats }: ProfileStatsGridProps) {
  const items = [
    {
      icon: Upload,
      label: "Total submissions",
      value: String(stats.totalSubmissions),
      highlight: true,
    },
    {
      icon: BarChart3,
      label: "Average AI score",
      value: stats.averageAiScore > 0 ? stats.averageAiScore.toFixed(1) : "—",
      highlight: true,
    },
    {
      icon: Medal,
      label: "Podium finishes",
      value: String(stats.podiumFinishes),
      highlight: false,
    },
    {
      icon: Award,
      label: "1st place wins",
      value: String(stats.firstPlaceWins),
      highlight: false,
    },
    {
      icon: Target,
      label: "Best AI score",
      value: stats.bestAiScore > 0 ? stats.bestAiScore.toFixed(1) : "—",
      highlight: false,
    },
    {
      icon: Video,
      label: "Categories competed",
      value: String(stats.categoriesCompeted),
      highlight: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 md:gap-4">
      {items.map(({ icon: Icon, label, value, highlight }) => (
        <div
          key={label}
          className={`rounded-xl border px-4 py-4 ${
            highlight
              ? "border-primary/30 bg-primary/10"
              : "border-border/50 bg-secondary/40"
          }`}
        >
          <Icon
            className={`mb-2 h-5 w-5 ${highlight ? "text-primary" : "text-muted-foreground"}`}
          />
          <p className="font-mono text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}
