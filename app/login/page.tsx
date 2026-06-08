import Link from "next/link"
import { Suspense } from "react"
import { PhoneLoginForm } from "@/components/login/phone-login-form"
import { HobbyXLogo } from "@/components/hobbyx-logo"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "Sign in",
  description: "Sign in to HobbyX with your phone number and SMS verification.",
  path: "/login",
})

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="mb-8">
        <HobbyXLogo href="/" size="lg" />
      </div>

      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-card/80" />}>
        <PhoneLoginForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  )
}
