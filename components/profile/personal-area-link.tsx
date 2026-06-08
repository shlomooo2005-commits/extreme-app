"use client"

import Image from "next/image"
import Link from "next/link"
import { User } from "lucide-react"
import { getInitials } from "@/lib/user-account"
import { useSupabaseSession } from "@/hooks/use-supabase-session"
import { useUserAccount } from "@/hooks/use-user-account"

interface PersonalAreaLinkProps {
  variant?: "hero" | "compact"
  className?: string
}

export function PersonalAreaLink({
  variant = "hero",
  className = "",
}: PersonalAreaLinkProps) {
  const { isAuthenticated, loading: sessionLoading } = useSupabaseSession()
  const { account, ready } = useUserAccount()
  const initials = account ? getInitials(account.fullName) : null
  const href = isAuthenticated ? "/dashboard" : "/login?next=/dashboard"

  const isHero = variant === "hero"

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-xl transition-all hover:scale-[1.02] hover:border-[#ffcc00]/60 hover:bg-card hover:shadow-[0_0_28px_rgba(255,204,0,0.25)] ${isHero ? "px-4 py-2.5" : "px-3 py-2"} ${className}`}
      aria-label={
        isAuthenticated
          ? "Dashboard — Personal Area"
          : "Sign in — Personal Area"
      }
    >
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ffcc00] font-black text-black ring-2 ring-border ${isHero ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs"}`}
      >
        {ready && account?.profilePictureDataUrl ? (
          <Image
            src={account.profilePictureDataUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : initials ? (
          initials
        ) : (
          <User className={isHero ? "h-5 w-5" : "h-4 w-4"} />
        )}
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={`font-black uppercase tracking-wide text-foreground ${isHero ? "text-xs" : "text-[10px]"}`}
        >
          {sessionLoading ? "Personal Area" : isAuthenticated ? "Dashboard" : "Sign in"}
        </span>
        <span
          dir="rtl"
          className={`font-bold text-[#ffcc00] ${isHero ? "text-sm" : "text-xs"}`}
        >
          אזור אישי
        </span>
      </span>
    </Link>
  )
}
