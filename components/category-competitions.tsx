import type { Category } from "@/lib/competitions"
import { CategoryPageView } from "./category/category-page-view"

interface CategoryCompetitionsProps {
  category: Category
}

/** Category route: full-screen vertical feed + competitions sheet. */
export function CategoryCompetitions({ category }: CategoryCompetitionsProps) {
  return <CategoryPageView category={category} />
}
