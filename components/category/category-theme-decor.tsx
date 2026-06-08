import type { CategorySlug } from "@/lib/competitions"
import { getCategoryVisual } from "@/lib/category-visuals"

type DecorVariant = "hero" | "card" | "page"

interface CategoryThemeDecorProps {
  slug: CategorySlug
  variant?: DecorVariant
}

/** Original SVG silhouettes & CSS FX — no copyrighted athlete photos in decor layer */
export function CategoryThemeDecor({
  slug,
  variant = "hero",
}: CategoryThemeDecorProps) {
  const { themeId, themeClass } = getCategoryVisual(slug)

  return (
    <div
      className={`category-theme-decor ${themeClass} category-theme-decor--${variant} pointer-events-none absolute inset-0 overflow-hidden`}
      aria-hidden
    >
      {themeId === "music" && <MusicDecor />}
      {themeId === "surfing" && <SurfingDecor />}
      {themeId === "cycling" && <CyclingDecor />}
      {themeId === "diving" && <DivingDecor />}
      {themeId === "extreme" && <ExtremeFireDecor />}
      {themeId === "soccer" && <SoccerDecor />}
      {themeId === "basketball" && <BasketballDecor />}
      {themeId === "random" && <SplatterDecor />}
      {themeId === "calisthenics" && <CalisthenicsDecor />}
    </div>
  )
}

function MusicDecor() {
  return (
    <>
      <div className="theme-spray theme-spray-1 bg-[#ff2d95]" />
      <div className="theme-spray theme-spray-2 bg-[#7c3aed]" />
      <div className="theme-spray theme-spray-3 bg-[#0ea5e9]" />
      <div className="theme-spray theme-spray-4 bg-[#facc15]" />
      <div className="theme-spray theme-spray-5 bg-[#22c55e]" />
    </>
  )
}

function SurfingDecor() {
  return (
    <>
      <div className="theme-wave theme-wave-1" />
      <div className="theme-wave theme-wave-2" />
      <div className="theme-wave theme-wave-3" />
      <div className="theme-foam" />
    </>
  )
}

function CyclingDecor() {
  return (
    <>
      <div className="theme-trail-stripe theme-trail-1" />
      <div className="theme-trail-stripe theme-trail-2" />
      <div className="theme-urban-grid" />
    </>
  )
}

function ExtremeFireDecor() {
  return (
    <>
      <div className="theme-ember theme-ember-1" />
      <div className="theme-ember theme-ember-2" />
      <div className="theme-ember theme-ember-3" />
      <div className="theme-ember theme-ember-4" />
      <div className="theme-fire-glow" />
      <svg
        className="theme-flame-icon theme-flame-icon-1"
        viewBox="0 0 64 96"
        fill="none"
        aria-hidden
      >
        <path
          d="M32 88 C18 72 10 52 14 34 C16 24 24 12 32 4 C40 12 48 24 50 34 C54 52 46 72 32 88Z"
          fill="url(#flameGrad1)"
        />
        <path
          d="M32 80 C24 68 20 52 24 38 C26 30 30 20 32 14 C34 20 38 30 40 38 C44 52 40 68 32 80Z"
          fill="#FDE047"
          opacity="0.85"
        />
        <defs>
          <linearGradient id="flameGrad1" x1="32" y1="88" x2="32" y2="4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7F1D1D" />
            <stop offset="0.45" stopColor="#EA580C" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        className="theme-flame-icon theme-flame-icon-2"
        viewBox="0 0 48 72"
        fill="none"
        aria-hidden
      >
        <path
          d="M24 66 C14 54 8 40 12 26 C14 18 20 10 24 6 C28 10 34 18 36 26 C40 40 34 54 24 66Z"
          fill="#F97316"
          opacity="0.55"
        />
      </svg>
    </>
  )
}

function DivingDecor() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <span key={i} className={`theme-bubble theme-bubble-${(i % 6) + 1}`} />
      ))}
      <svg
        className="theme-fish theme-fish-1"
        viewBox="0 0 40 20"
        fill="currentColor"
      >
        <ellipse cx="12" cy="10" rx="10" ry="6" />
        <path d="M22 10 L38 4 L38 16 Z" />
      </svg>
      <svg
        className="theme-fish theme-fish-2"
        viewBox="0 0 40 20"
        fill="currentColor"
      >
        <ellipse cx="12" cy="10" rx="10" ry="6" />
        <path d="M22 10 L38 4 L38 16 Z" />
      </svg>
      <svg
        className="theme-diver-silhouette"
        viewBox="0 0 48 80"
        fill="currentColor"
      >
        <circle cx="24" cy="10" r="8" />
        <path d="M24 18 L24 45 M14 28 L34 28 M24 45 L14 72 M24 45 L34 65" stroke="currentColor" strokeWidth="4" fill="none" />
      </svg>
    </>
  )
}

function SoccerDecor() {
  return (
    <>
      <div className="theme-grass-field" />
      <svg
        className="theme-ball-silhouette theme-soccer-ball"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M24 4 L24 44 M4 24 L44 24 M10 10 L38 38 M38 10 L10 38" />
      </svg>
      <svg
        className="theme-player-silhouette theme-soccer-player"
        viewBox="0 0 80 120"
        fill="currentColor"
      >
        <circle cx="40" cy="14" r="12" />
        <path d="M40 26 L40 70 M22 42 L58 42 M40 70 L22 110 M40 70 L58 105" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" />
      </svg>
    </>
  )
}

function BasketballDecor() {
  return (
    <>
      <div className="theme-court-lines" />
      <div className="theme-hoop-glow" />
      <svg
        className="theme-ball-silhouette theme-basketball-ball"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="24" cy="24" r="20" />
        <path d="M4 24 Q24 4 44 24 Q24 44 4 24" />
        <path d="M24 4 Q44 24 24 44 Q4 24 24 4" />
      </svg>
      <svg
        className="theme-player-silhouette theme-basketball-player"
        viewBox="0 0 90 130"
        fill="currentColor"
      >
        <circle cx="45" cy="16" r="14" />
        <path d="M45 30 L45 75 M25 50 L70 45 M45 75 L30 120 M45 75 L65 115" stroke="currentColor" strokeWidth="11" strokeLinecap="round" fill="none" />
      </svg>
    </>
  )
}

function SplatterDecor() {
  return (
    <>
      <div className="theme-splash theme-splash-1 bg-[#ec4899]" />
      <div className="theme-splash theme-splash-2 bg-[#8b5cf6]" />
      <div className="theme-splash theme-splash-3 bg-[#06b6d4]" />
      <div className="theme-splash theme-splash-4 bg-[#facc15]" />
      <div className="theme-splash theme-splash-5 bg-[#f97316]" />
      <div className="theme-splash theme-splash-6 bg-[#22c55e]" />
    </>
  )
}

function CalisthenicsDecor() {
  return (
  <svg
    className="theme-calisthenics-athlete"
    viewBox="0 0 120 140"
    fill="currentColor"
  >
    <rect x="52" y="8" width="16" height="55" rx="4" />
    <circle cx="60" cy="12" r="10" />
    <rect x="20" y="28" width="80" height="8" rx="2" />
    <path d="M52 63 L52 95 L35 130 M52 95 L75 130" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
  </svg>
  )
}
