import { Suspense } from "react"
import { ProfileDashboard } from "@/components/profile/profile-dashboard"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "Personal Area",
  description:
    "HobbyX personal area — onboarding, payout settings, and your competition profile. אזור אישי.",
  path: "/profile",
})

function ProfileFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6b00] border-t-transparent" />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileDashboard />
    </Suspense>
  )
}
