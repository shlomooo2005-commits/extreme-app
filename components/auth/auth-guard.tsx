"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabaseSession } from "@/hooks/use-supabase-session"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

function AuthLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter()
  const { loading, isAuthenticated } = useSupabaseSession()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [loading, isAuthenticated, redirectTo, router])

  if (loading) return <AuthLoading />
  if (!isAuthenticated) return null

  return <>{children}</>
}
