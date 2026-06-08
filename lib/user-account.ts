/**
 * Client-side athlete account (localStorage until backend auth exists).
 */

export type PayoutMethod = "bank" | "paypal"

export interface PayoutSettings {
  method: PayoutMethod
  bankAccountHolder?: string
  bankName?: string
  bankAccountNumber?: string
  bankRoutingOrIban?: string
  paypalEmail?: string
  updatedAt: string
}

export interface UserAccount {
  id: string
  fullName: string
  email: string
  phone: string
  profilePictureDataUrl?: string
  onboardedAt: string
  payout: PayoutSettings | null
}

export const USER_ACCOUNT_STORAGE_KEY = "hobbyx-user-account"

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 9 && digits.length <= 15
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function loadUserAccount(): UserAccount | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(USER_ACCOUNT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserAccount
    if (!parsed.fullName || !parsed.onboardedAt || !parsed.phone) return null
    return {
      ...parsed,
      email: parsed.email ?? "",
    }
  } catch {
    return null
  }
}

export function saveUserAccount(account: UserAccount): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_ACCOUNT_STORAGE_KEY, JSON.stringify(account))
}

export function createAccountId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function hasCompletePersonalDetails(
  account: UserAccount | null
): account is UserAccount {
  if (!account?.onboardedAt) return false
  return (
    Boolean(account.fullName.trim()) &&
    Boolean(account.email.trim()) &&
    isValidEmail(account.email) &&
    Boolean(account.phone.trim()) &&
    isValidPhone(account.phone)
  )
}

/** @deprecated Use hasCompletePersonalDetails */
export function isAccountOnboarded(
  account: UserAccount | null
): account is UserAccount {
  return hasCompletePersonalDetails(account)
}
