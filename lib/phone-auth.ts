/** Normalize user input to E.164-style international format (e.g. +972501234567). */
export function normalizePhone(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, "")
  if (trimmed.startsWith("+")) return trimmed
  if (trimmed.startsWith("0")) return `+972${trimmed.slice(1)}`
  return `+${trimmed}`
}

const E164_PATTERN = /^\+[1-9]\d{7,14}$/

export function isValidInternationalPhone(phone: string): boolean {
  return E164_PATTERN.test(phone)
}

export function isValidOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim())
}
