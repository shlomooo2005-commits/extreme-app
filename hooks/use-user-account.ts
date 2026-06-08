"use client"

import { useCallback, useEffect, useState } from "react"
import {
  createAccountId,
  hasCompletePersonalDetails,
  loadUserAccount,
  saveUserAccount,
  type PayoutSettings,
  type UserAccount,
} from "@/lib/user-account"

export function useUserAccount() {
  const [account, setAccount] = useState<UserAccount | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setAccount(loadUserAccount())
    setReady(true)
  }, [])

  const persist = useCallback((next: UserAccount) => {
    saveUserAccount(next)
    setAccount(next)
  }, [])

  const savePersonalDetails = useCallback(
    (data: {
      fullName: string
      email: string
      phone: string
      profilePictureDataUrl?: string
    }) => {
      const existing = loadUserAccount()
      const next: UserAccount = {
        id: existing?.id ?? createAccountId(),
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        profilePictureDataUrl:
          data.profilePictureDataUrl ?? existing?.profilePictureDataUrl,
        onboardedAt: existing?.onboardedAt ?? new Date().toISOString(),
        payout: existing?.payout ?? null,
      }
      persist(next)
      return next
    },
    [persist]
  )

  const completeOnboarding = savePersonalDetails

  const updatePayout = useCallback(
    (payout: PayoutSettings) => {
      const current = loadUserAccount()
      if (!current) return null
      const next: UserAccount = {
        ...current,
        payout: { ...payout, updatedAt: new Date().toISOString() },
      }
      persist(next)
      return next
    },
    [persist]
  )

  const updateProfile = useCallback(
    (patch: Partial<
      Pick<UserAccount, "fullName" | "email" | "phone" | "profilePictureDataUrl">
    >) => {
      const current = loadUserAccount()
      if (!current) return null
      const next: UserAccount = { ...current, ...patch }
      persist(next)
      return next
    },
    [persist]
  )

  return {
    account,
    ready,
    isOnboarded: hasCompletePersonalDetails(account),
    hasPersonalDetails: hasCompletePersonalDetails(account),
    savePersonalDetails,
    completeOnboarding,
    updatePayout,
    updateProfile,
  }
}
