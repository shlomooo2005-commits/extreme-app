"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { ChevronRight, Upload } from "lucide-react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { MyStatsUploads } from "@/components/dashboard/my-stats-uploads"
import { syncSupabaseUserToLocalAccount } from "@/lib/auth-bridge"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { useUserAccount } from "@/hooks/use-user-account"
import { useUserProfile } from "@/hooks/use-user-profile"
import { PersonalDetailsForm } from "./personal-details-form"
import { PayoutSettingsForm } from "./payout-settings-form"
import { SportInterestsPicker } from "./sport-interests-picker"

function FlowStepBadge({
  step,
  label,
  complete,
  optional,
}: {
  step: number
  label: string
  complete?: boolean
  optional?: boolean
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
          complete
            ? "bg-[#22c55e] text-black"
            : optional
              ? "border border-[#22c55e]/40 bg-[#22c55e]/15 text-[#4ade80]"
              : "bg-white/15 text-foreground/70"
        }`}
      >
        {complete ? "✓" : step}
      </span>
      <div>
        <p className="hobbyx-label-title text-xs uppercase tracking-[0.2em] sm:text-sm">
          {label}
        </p>
        {optional && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Optional · can do later
          </p>
        )}
      </div>
    </div>
  )
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next")
  const { user } = useSupabaseSession()
  const { profile, refresh: refreshProfile } = useUserProfile(user)
  const {
    account,
    ready,
    hasPersonalDetails,
    savePersonalDetails,
    updatePayout,
  } = useUserAccount()

  useEffect(() => {
    if (user) {
      syncSupabaseUserToLocalAccount(user)
    }
  }, [user])

  if (!user || !ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-[#8b5cf6]" />
      </div>
    )
  }

  if (!hasPersonalDetails || !account) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background px-4 py-10 sm:px-5 md:px-8 md:py-16">
        <div className="mx-auto max-w-lg">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Personal Area / <span dir="rtl">אזור אישי</span>
            </p>
            <h1 className="hobbyx-label-title mt-2 text-2xl sm:text-3xl">
              Your profile
            </h1>
          </header>
          <FlowStepBadge step={1} label="Personal details (required)" />
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Enter your name, email, and phone. Payout settings for prizes are
            available after you save.
          </p>
          <PersonalDetailsForm
            variant="onboarding"
            submitLabel="Save personal details"
            onSave={(data) => {
              savePersonalDetails(data)
              if (nextPath?.startsWith("/")) {
                router.push(nextPath)
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10 md:py-12">
        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Personal Area / <span dir="rtl">אזור אישי</span>
          </p>
          <h1 className="hobbyx-label-title mt-2 text-2xl sm:text-3xl">
            Your profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your identity, sport interests, and competition uploads.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#8b5cf6] hover:underline"
            >
              Go to dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
            {nextPath?.startsWith("/") && (
              <Link
                href={nextPath}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#0284c7] hover:underline"
              >
                Continue to competition entry
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </header>

        <div className="mb-10">
          <MyStatsUploads
            user={user}
            onUploadClick={() => router.push("/dashboard?upload=1")}
          />
        </div>

        <section
          id="sport-interests"
          className="mb-10 border-t border-border pt-10"
          aria-labelledby="profile-interests"
        >
          <FlowStepBadge step={1} label="Sport interests" complete={Boolean(profile?.preferred_sport_interests.length)} />
          <SportInterestsPicker
            userId={user.id}
            initialInterests={profile?.preferred_sport_interests ?? []}
            onSaved={() => void refreshProfile()}
          />
        </section>

        <section className="mb-10 border-t border-border pt-10" aria-labelledby="profile-personal">
          <FlowStepBadge step={2} label="Personal details" complete />
          <PersonalDetailsForm
            variant="step"
            initialAccount={account}
            submitLabel="Save personal details"
            onSave={(data) => savePersonalDetails(data)}
          />
        </section>

        <section
          id="bank-details"
          className="mb-10 border-t border-border pt-10"
          aria-labelledby="profile-payout"
        >
          <FlowStepBadge step={3} label="Payout settings" optional />
          <p dir="rtl" className="mb-1 text-sm font-semibold text-[#4ade80]">
            הזן פרטי בנק לקבלת פרס
          </p>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Bank account or PayPal for prize payouts. Optional until you win —
            not required to upload videos.
          </p>
          <PayoutSettingsForm
            account={account}
            onSave={(payout) => updatePayout(payout)}
          />
        </section>

        <div className="border-t border-border pt-8 text-center">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b5cf6] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black"
          >
            <Upload className="h-4 w-4" />
            Submit new entry
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ProfileDashboard() {
  return (
    <AuthGuard redirectTo="/login?next=/profile">
      <ProfileContent />
    </AuthGuard>
  )
}
