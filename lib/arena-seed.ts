import type { CategorySlug } from "@/lib/competitions"

export interface ArenaSeedRow {
  id: string
  text: string
  categorySlug: CategorySlug
  voteCount: number
  createdAt: string
}

/** No placeholder arena ideas — board starts empty until users submit. */
export function getArenaSeedRows(): ArenaSeedRow[] {
  return []
}
