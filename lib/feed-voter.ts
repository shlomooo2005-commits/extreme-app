export function normalizeVoterId(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  return value.trim().slice(0, 128)
}
