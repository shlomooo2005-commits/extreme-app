import type { User } from "@supabase/supabase-js"
import {
  hasCompletePersonalDetails,
  loadUserAccount,
  saveUserAccount,
  type UserAccount,
} from "@/lib/user-account"

export interface UploadIdentity {
  userId: string
  fullName: string
  email: string
  phone: string
}

export function syncSupabaseUserToLocalAccount(user: User): UserAccount {
  const existing = loadUserAccount()
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : ""

  const account: UserAccount = {
    id: user.id,
    fullName: metadataName || existing?.fullName || "Athlete",
    email: user.email?.trim() || existing?.email || "",
    phone: user.phone?.trim() || existing?.phone || "",
    profilePictureDataUrl: existing?.profilePictureDataUrl,
    onboardedAt: existing?.onboardedAt ?? new Date().toISOString(),
    payout: existing?.payout ?? null,
  }

  saveUserAccount(account)
  return account
}

export function getUploadIdentity(
  user: User | null,
  account: UserAccount | null,
): UploadIdentity | null {
  if (user) {
    const synced = syncSupabaseUserToLocalAccount(user)
    return {
      userId: user.id,
      fullName: synced.fullName,
      email: synced.email || user.email || "",
      phone: user.phone?.trim() || synced.phone || "",
    }
  }

  if (account && hasCompletePersonalDetails(account)) {
    return {
      userId: account.id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
    }
  }

  return null
}

export function isUploadUnlocked(
  user: User | null,
  account: UserAccount | null,
  accountReady: boolean,
): boolean {
  if (user) return true
  return accountReady && hasCompletePersonalDetails(account)
}
