"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Phone, ShieldCheck } from "lucide-react"
import { isSupabaseClientConfigured, supabase } from "@/lib/supabaseClient"
import {
  isValidInternationalPhone,
  isValidOtpCode,
  normalizePhone,
} from "@/lib/phone-auth"

type Step = "phone" | "verify"

function showError(message: string, setError: (value: string | null) => void) {
  setError(message)
  window.alert(message)
}

export function PhoneLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next")
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const sendOtp = async () => {
    setError(null)
    setMessage(null)

    if (!isSupabaseClientConfigured()) {
      showError("Authentication is not configured. Contact support.", setError)
      return
    }

    const normalized = normalizePhone(phone)
    if (!isValidInternationalPhone(normalized)) {
      showError(
        "Enter a valid international phone number with country code (e.g. +972501234567).",
        setError,
      )
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: normalized }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      showError(data.error ?? "Failed to send verification code.", setError)
      return
    }

    setPhone(normalized)
    setMessage("Verification code sent. Check your SMS.")
    setStep("verify")
  }

  const verifyOtp = async () => {
    setError(null)
    setMessage(null)

    const code = otp.trim()
    if (!isValidOtpCode(code)) {
      showError("Enter the 6-digit code from your SMS.", setError)
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, token: code }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      showError(data.error ?? "Failed to verify code.", setError)
      return
    }

    if (data.session) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })

      if (sessionError) {
        showError(sessionError.message, setError)
        return
      }
    }

    setMessage("Signed in successfully. Redirecting…")
    const destination =
      nextPath?.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/dashboard"
    router.push(destination)
    router.refresh()
  }

  const resetToPhone = () => {
    setStep("phone")
    setOtp("")
    setError(null)
    setMessage(null)
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-8 text-center">
        <p className="hobbyx-label-sub text-xs uppercase tracking-[0.25em]">Welcome back</p>
        <h1 className="hobbyx-label-title mt-2 text-2xl sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "phone"
            ? "Enter your phone number and we will send a one-time code."
            : "Enter the 6-digit code we sent to your phone."}
        </p>
      </div>

      {step === "phone" ? (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="hobbyx-setting-label flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden />
              Phone number
            </span>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+972501234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <span className="text-xs text-muted-foreground">
              Include country code (e.g. +972 for Israel, +1 for US).
            </span>
          </label>

          <button
            type="button"
            onClick={() => void sendOtp()}
            disabled={loading || !phone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending code…
              </>
            ) : (
              "Send verification code"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg border border-border bg-secondary/80 px-3 py-2 text-sm text-foreground">
            Code sent to{" "}
            <span className="font-semibold" dir="ltr">
              {phone}
            </span>
          </p>

          <label className="block space-y-2">
            <span className="hobbyx-setting-label flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              6-digit code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </label>

          <button
            type="button"
            onClick={() => void verifyOtp()}
            disabled={loading || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b5cf6] px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Verifying…
              </>
            ) : (
              "Verify & sign in"
            )}
          </button>

          <button
            type="button"
            onClick={resetToPhone}
            disabled={loading}
            className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Use a different number
          </button>
        </div>
      )}

      {error && (
        <p
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && !error && (
        <p
          className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  )
}
