"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { LogOut, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { getActiveCompetitions } from "@/lib/competitions"
import { supabase } from "@/lib/supabaseClient"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { useUserProfile } from "@/hooks/use-user-profile"
import { DashboardFeed } from "@/components/dashboard/dashboard-feed"
import { DashboardUploadModal } from "@/components/dashboard/dashboard-upload-modal"
import { syncLocalSubmissionsToPublicFeed } from "@/lib/sync-local-submissions"

export function DashboardView() {
  const router = useRouter()
  const { user } = useSupabaseSession()
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [feedRefreshKey, setFeedRefreshKey] = useState(0)

  const uploadableCompetitions = useMemo(
    () =>
      getActiveCompetitions().filter(
        (competition) => competition.submissionType === "VERIFIED_UPLOAD",
      ),
    [],
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  const handleUploadClose = () => {
    setUploadOpen(false)
    setFeedRefreshKey((value) => value + 1)
  }

  useEffect(() => {
    if (!user) return
    void syncLocalSubmissionsToPublicFeed(user.id).then((synced) => {
      if (synced > 0) {
        setFeedRefreshKey((value) => value + 1)
      }
    })
  }, [user?.id])

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="hobbyx-label-sub text-xs uppercase tracking-[0.25em]">Public feed</p>
            <h1 className="hobbyx-label-title mt-2 text-2xl sm:text-3xl">Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Watch and like competition videos from every athlete, organized by sport.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setUploadOpen(true)}
                  disabled={uploadableCompetitions.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  Upload video
                </button>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground"
              >
                Sign in to upload & like
              </Link>
            )}
          </div>
        </div>

        <DashboardFeed
          user={user}
          profile={profile}
          profileLoading={profileLoading}
          profileError={profileError}
          refreshKey={feedRefreshKey}
        />

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Live-camera competitions require in-app recording.{" "}
          <Link href="/submit" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Go to submit page
          </Link>
        </p>
      </div>

      {user && (
        <DashboardUploadModal
          open={uploadOpen}
          competitions={uploadableCompetitions}
          user={user}
          onClose={handleUploadClose}
          onPublished={() => setFeedRefreshKey((value) => value + 1)}
        />
      )}
    </>
  )
}
