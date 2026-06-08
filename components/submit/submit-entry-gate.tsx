"use client"

import { useUserAccount } from "@/hooks/use-user-account"

interface SubmitEntryGateProps {
  children: React.ReactNode
}

/** Loading shell only — personal details gating lives inside CompetitionUpload. */
export function SubmitEntryGate({ children }: SubmitEntryGateProps) {
  const { ready } = useUserAccount()

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff6b00] border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
