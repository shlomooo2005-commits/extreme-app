import Link from "next/link"

export default function CategoryNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center md:px-8">
      <h1 className="mb-2 text-3xl font-bold uppercase text-foreground">
        Category not found
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        That category doesn&apos;t exist. Browse all 8 competition zones from
        the homepage.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
      >
        View all categories
      </Link>
    </main>
  )
}
