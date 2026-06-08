import { Suspense } from "react"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "Dashboard",
  description: "Your HobbyX dashboard — active video competitions and entry uploads.",
  path: "/dashboard",
})

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <DashboardView />
      </Suspense>
    </main>
  )
}
