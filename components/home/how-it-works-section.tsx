"use client"

import { useState } from "react"

const LINES = [
  "HobbyX turns your hobbies into paid competitions — you film your performance, upload it, and AI judges score you fairly.",
  "Choose a category: surfing, mountain biking, random, extreme, football, basketball, calisthenics, or music.",
  "Each category has Season 4 events with real prize pools displayed on the leaderboard.",
  "Football, basketball, calisthenics, and music use live in-app recording; other sports use verified action-camera files.",
  "AI scores skill, style, difficulty, and authenticity — every breakdown is transparent.",
  "Set up your Personal Area with your name and phone, then add bank or PayPal in payout settings.",
  "Expand a category on the home screen to preview live competitions before you compete.",
  "The Leaderboard shows the winning video and exact earnings for each domain’s top athlete.",
  "Rankings update as new entries are judged — climb the board to earn more.",
  "Start in Personal Area, pick a category, and enter when you are ready to compete.",
]

export function HowItWorksSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="w-full max-w-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-4 text-foreground transition-colors hover:bg-secondary"
      >
        <span className="font-medium">How it works</span>
        <span dir="rtl" className="text-foreground/80">
          כיצד זה עובד?
        </span>
        <span className="text-muted-foreground">{open ? "−" : "+"}</span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-2 space-y-3 rounded-xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/70">
            {LINES.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
