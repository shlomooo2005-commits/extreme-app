import { notFound } from "next/navigation"
import { CategoryCompetitions } from "@/components/category-competitions"
import { createPageMetadata } from "@/lib/site-config"
import {
  getCategories,
  getCategoryBySlug,
  resolveCategorySlug,
} from "@/lib/competitions"

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategoryBySlug(slug)

  if (!category) {
    return createPageMetadata({
      title: "Category not found",
      path: `/category/${slug}`,
    })
  }

  return createPageMetadata({
    title: `${category.name} Competitions`,
    description: `Active ${category.name} competitions on HobbyX — ${category.tagline}`,
    path: `/category/${slug}`,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const resolvedSlug = resolveCategorySlug(slug)
  if (!resolvedSlug) {
    notFound()
  }

  const category = getCategoryBySlug(resolvedSlug)
  if (!category) {
    notFound()
  }

  return <CategoryCompetitions category={category} />
}
