"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "./site-header"
import { SiteFooter } from "./site-footer"

interface SiteShellProps {
  children: React.ReactNode
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname()
  const isCategoryFeed = pathname.startsWith("/category/")
  const isBareHome =
    pathname === "/" || pathname === "/arena" || isCategoryFeed

  if (isBareHome) {
    return <>{children}</>
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
