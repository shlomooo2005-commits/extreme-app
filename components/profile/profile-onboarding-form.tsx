"use client"

import { PersonalDetailsForm } from "./personal-details-form"
import type { ProfileOnboardingData } from "./personal-details-form"

export type { ProfileOnboardingData } from "./personal-details-form"

interface ProfileOnboardingFormProps {
  onComplete: (data: ProfileOnboardingData) => void
}

export function ProfileOnboardingForm({ onComplete }: ProfileOnboardingFormProps) {
  return (
    <PersonalDetailsForm
      variant="onboarding"
      submitLabel="Save & continue"
      onSave={onComplete}
    />
  )
}
