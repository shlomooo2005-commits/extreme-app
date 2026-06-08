"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import {
  SPORT_INTERESTS,
  type SportInterestSlug,
} from "@/lib/sport-interests"
import { updatePreferredSportInterests } from "@/lib/supabase-profiles"

interface SportInterestsPickerProps {
  userId: string
  initialInterests: string[]
  onSaved: (interests: SportInterestSlug[]) => void
}

export function SportInterestsPicker({
  userId,
  initialInterests,
  onSaved,
}: SportInterestsPickerProps) {
  const [selected, setSelected] = useState<SportInterestSlug[]>(
    initialInterests.filter(
      (slug): slug is SportInterestSlug =>
        SPORT_INTERESTS.some((interest) => interest.slug === slug),
    ),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const toggle = (slug: SportInterestSlug) => {
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    )
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const profile = await updatePreferredSportInterests(userId, selected)
      onSaved(profile.preferred_sport_interests)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save interests.")
    } finally {
      setSaving(false)
    }
  }

  const normalizedInitial = initialInterests.filter(
    (slug): slug is SportInterestSlug =>
      SPORT_INTERESTS.some((interest) => interest.slug === slug),
  )
  const hasChanges =
    selected.length !== normalizedInitial.length ||
    selected.some((slug) => !normalizedInitial.includes(slug))

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose the sports you care about. Your dashboard feed will be organized
        into sections like Dirt Jump Biking, Freediving, and more.
      </p>

      <div className="flex flex-wrap gap-2">
        {SPORT_INTERESTS.map((interest) => {
          const active = selected.includes(interest.slug)
          return (
            <button
              key={interest.slug}
              type="button"
              onClick={() => toggle(interest.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5" aria-hidden />}
              {interest.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {saved && !error && (
        <p
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
          role="status"
        >
          Interests saved. Your feed will update on the dashboard.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || !hasChanges}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save interests"
        )}
      </button>
    </div>
  )
}
