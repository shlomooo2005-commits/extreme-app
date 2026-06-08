/** Scattered collage tiles + center victory visual for the homepage hero */

const unsplash = (id: string, w = 600, h = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=85`

export const HERO_VICTORY_IMAGE = unsplash("1571019614242", 520, 640)

export type CollageTile = {
  id: string
  label: string
  src: string
  /** Tailwind-friendly placement (percent) */
  top: string
  left: string
  rotate: number
  scale?: number
  width: string
  zIndex: number
  ring: string
  glow: string
}

export const HERO_COLLAGE_TILES: CollageTile[] = [
  {
    id: "football",
    label: "Football",
    src: unsplash("1574629810360"),
    top: "6%",
    left: "2%",
    rotate: -14,
    width: "clamp(7rem, 18vw, 11rem)",
    zIndex: 4,
    ring: "ring-[#22c55e]/80",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.55)]",
  },
  {
    id: "basketball",
    label: "Basketball",
    src: unsplash("1546519638"),
    top: "4%",
    left: "72%",
    rotate: 11,
    width: "clamp(7rem, 17vw, 10.5rem)",
    zIndex: 5,
    ring: "ring-[#f97316]/80",
    glow: "shadow-[0_0_40px_rgba(249,115,22,0.55)]",
  },
  {
    id: "running",
    label: "Running",
    src: unsplash("1452626038307"),
    top: "38%",
    left: "-1%",
    rotate: 8,
    width: "clamp(6.5rem, 16vw, 10rem)",
    zIndex: 3,
    ring: "ring-[#eab308]/80",
    glow: "shadow-[0_0_36px_rgba(234,179,8,0.5)]",
  },
  {
    id: "cycling",
    label: "Cycling",
    src: unsplash("1568787543418"),
    top: "58%",
    left: "78%",
    rotate: -9,
    width: "clamp(7rem, 18vw, 11rem)",
    zIndex: 4,
    ring: "ring-[#fbbf24]/80",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.5)]",
  },
  {
    id: "extreme",
    label: "Extreme",
    src: "/categories/extreme-flame.svg",
    top: "62%",
    left: "4%",
    rotate: -6,
    width: "clamp(6.5rem, 15vw, 9.5rem)",
    zIndex: 3,
    ring: "ring-[#ff5500]/85",
    glow: "shadow-[0_0_40px_rgba(255,85,0,0.6)]",
  },
  {
    id: "singing",
    label: "Singing",
    src: unsplash("1511379938547"),
    top: "22%",
    left: "84%",
    rotate: 16,
    width: "clamp(6rem, 14vw, 9rem)",
    zIndex: 6,
    ring: "ring-[#ec4899]/80",
    glow: "shadow-[0_0_36px_rgba(236,72,153,0.55)]",
  },
  {
    id: "surf",
    label: "Water sports",
    src: unsplash("1502680390469"),
    top: "72%",
    left: "62%",
    rotate: 12,
    scale: 0.95,
    width: "clamp(6rem, 14vw, 9rem)",
    zIndex: 2,
    ring: "ring-[#06b6d4]/70",
    glow: "shadow-[0_0_32px_rgba(6,182,212,0.45)]",
  },
  {
    id: "calisthenics",
    label: "Street workout",
    src: unsplash("1517836357463"),
    top: "18%",
    left: "12%",
    rotate: 5,
    width: "clamp(5.5rem, 13vw, 8.5rem)",
    zIndex: 2,
    ring: "ring-[#ef4444]/70",
    glow: "shadow-[0_0_28px_rgba(239,68,68,0.45)]",
  },
]
