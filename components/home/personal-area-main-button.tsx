"use client"

import Link from "next/link"

export function PersonalAreaMainButton() {
  return (
    <Link
      href="/profile"
      className="personal-area-hub relative block w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-400/25 bg-gradient-to-br from-[#1a1a24] via-[#141428] to-[#1e1035] px-8 py-6 text-center shadow-[0_8px_40px_rgba(99,102,241,0.2),0_0_0_1px_rgba(255,255,255,0.06)_inset] transition-all duration-300 hover:border-violet-400/40 hover:shadow-[0_12px_48px_rgba(139,92,246,0.28)] active:scale-[0.99]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(139,92,246,0.35), transparent 55%)",
        }}
      />
      <span className="relative block text-lg font-bold tracking-tight text-foreground">
        Personal Area
      </span>
      <span
        dir="rtl"
        className="relative mt-1 block text-lg font-bold tracking-tight text-violet-200/95"
      >
        אזור אישי
      </span>
      <span className="relative mt-2 block text-xs font-medium uppercase tracking-[0.2em] text-foreground/45">
        Profile · Payouts · Entries
      </span>
    </Link>
  )
}
