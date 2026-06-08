"use client"

import Image from "next/image"
import Link from "next/link"
import { Banknote, Flame, Sparkles, Trophy, Zap } from "lucide-react"
import {
  HERO_COLLAGE_TILES,
  HERO_VICTORY_IMAGE,
} from "@/lib/homepage-hero-visuals"
import { MoneyRain } from "./money-rain"
import { PersonalAreaLink } from "@/components/profile/personal-area-link"

export function HomepageHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      <div className="absolute right-5 top-24 z-40 md:right-8 md:top-28">
        <PersonalAreaLink variant="hero" />
      </div>
      {/* Saturated base — no flat black */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 120%, #ff6b00 0%, transparent 45%),
            radial-gradient(ellipse 70% 50% at 10% 20%, rgba(236,72,153,0.45) 0%, transparent 50%),
            radial-gradient(ellipse 60% 45% at 90% 30%, rgba(0,229,255,0.4) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(250,204,21,0.25) 0%, transparent 55%),
            linear-gradient(145deg, #1a0533 0%, #0c1a3d 35%, #1a0a00 70%, #030303 100%)
          `,
        }}
      />

      {/* Scattered sport collage */}
      <div className="absolute inset-0">
        {HERO_COLLAGE_TILES.map((tile) => (
          <div
            key={tile.id}
            className="absolute"
            style={{
              top: tile.top,
              left: tile.left,
              width: tile.width,
              zIndex: tile.zIndex,
            }}
          >
            <div
              className="hero-collage-tile"
              style={{
                transform: `rotate(${tile.rotate}deg) scale(${tile.scale ?? 1})`,
              }}
            >
            <div
              className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 border-white/25 ${tile.ring} ring-4 ${tile.glow}`}
            >
              <Image
                src={tile.src}
                alt={tile.label}
                fill
                className="object-cover"
                sizes="200px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-[9px] font-black uppercase tracking-widest text-foreground drop-shadow-md">
                {tile.label}
              </span>
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cash rain across the whole hero */}
      <div className="pointer-events-none absolute inset-0 z-[18]">
        <MoneyRain />
      </div>

      {/* Center victory + cash explosion */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="hero-victory-burst relative flex h-[min(48vw,300px)] w-[min(48vw,300px)] items-center justify-center">
          {/* Radial hype rings */}
          <div className="absolute inset-[-40%] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.35)_0%,rgba(255,107,0,0.2)_35%,transparent_70%)] animate-pulse-glow" />
          <div className="absolute inset-[-20%] rounded-full border-2 border-dashed border-[#ffcc00]/40 animate-[spin_24s_linear_infinite]" />
          <div className="absolute inset-[-8%] rounded-full bg-gradient-to-br from-[#ff6b00]/30 via-[#ff00ff]/20 to-[#00e5ff]/30 blur-xl" />

          {/* Winner spotlight */}
          <div className="relative z-10 h-[58%] w-[58%] overflow-hidden rounded-full border-4 border-[#ffcc00] shadow-[0_0_0_6px_rgba(255,107,0,0.4),0_0_60px_rgba(255,215,0,0.7),0_0_120px_rgba(34,197,94,0.4)]">
            <Image
              src={HERO_VICTORY_IMAGE}
              alt="Athlete celebrating a huge victory"
              fill
              priority
              className="object-cover object-top"
              sizes="280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#ff6b00]/30 via-transparent to-[#ffcc00]/10 mix-blend-overlay" />
          </div>

          {/* Floating prize badges */}
          <span className="hero-float-badge absolute -right-2 top-2 flex items-center gap-1 rounded-full bg-[#22c55e] px-2.5 py-1 text-[10px] font-black uppercase text-black shadow-[0_0_20px_#22c55e]">
            <Banknote className="h-3 w-3" />
            Paid
          </span>
          <span className="hero-float-badge absolute -left-3 bottom-4 flex items-center gap-1 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[10px] font-black uppercase text-black shadow-[0_0_20px_#ff6b00] animation-delay-300">
            <Sparkles className="h-3 w-3" />
            Winner
          </span>
        </div>
      </div>

      {/* Vignette + bottom read legibility */}
      <div className="absolute inset-0 z-[15] bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,transparent_0%,rgba(3,3,3,0.55)_100%)]" />
      <div className="absolute inset-0 z-[15] bg-gradient-to-t from-[#030303] via-[#030303]/75 to-transparent" />
      <div className="absolute inset-0 z-[15] bg-gradient-to-r from-[#030303]/90 via-transparent to-[#030303]/50" />

      {/* Copy + CTAs */}
      <div className="relative z-30 flex min-h-[92vh] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
        <p className="mb-4 flex w-fit items-center gap-2 rounded-full border border-[#ffcc00]/40 bg-[#ff6b00]/20 px-4 py-1.5 text-sm font-black uppercase tracking-[0.25em] text-[#ffcc00] backdrop-blur-md">
          <Zap className="h-4 w-4 fill-[#ffcc00]" />
          Win cash from your hobbies
        </p>
        <h1 className="magazine-title max-w-4xl text-5xl text-foreground sm:text-7xl md:text-8xl lg:text-[7rem]">
          <span className="text-neon-glow text-[#ff6b00]">Hobby</span>
          <span className="bg-gradient-to-r from-white via-[#ffcc00] to-white bg-clip-text text-transparent">
            X
          </span>
          <br />
          <span className="text-foreground/95">Turn passion</span>
          <br />
          <span className="bg-gradient-to-r from-[#22c55e] via-[#ffcc00] to-[#00e5ff] bg-clip-text text-transparent">
            Into payday
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg font-semibold text-foreground/85 md:text-xl">
          Football, hoops, runs, dives, vocals, bikes—and more. Compete, get
          scored by AI, and watch the prize pool rain down.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-r from-[#ffcc00] via-[#ff6b00] to-[#ff9500] px-8 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_50px_rgba(255,204,0,0.55)] transition-transform hover:scale-105"
          >
            <Flame className="h-5 w-5" />
            Chase the bag
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-[#22c55e]/60 bg-[#22c55e]/15 px-8 py-4 text-sm font-black uppercase tracking-widest text-[#bbf7d0] backdrop-blur-md transition-colors hover:border-[#4ade80] hover:bg-[#22c55e]/25"
          >
            <Trophy className="h-5 w-5" />
            See who&apos;s paid
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 h-px bg-gradient-to-r from-[#22c55e] via-[#ffcc00] to-[#00e5ff] shadow-[0_0_24px_#ffcc00]" />
    </section>
  )
}
