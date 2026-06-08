import type { CategoryVisual } from "@/lib/category-visuals"

/** Neon gradient placeholder when hero/card image fails to load */
export function CategoryImageFallback({ visual }: { visual: CategoryVisual }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, rgba(${visual.glowRgb}, 0.35), transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(${visual.glowRgb}, 0.2), transparent 45%),
          linear-gradient(135deg, #e8f4fc 0%, #dbeafe 50%, #e0f2fe 100%)
        `,
      }}
      aria-hidden
    />
  )
}
