"use client"

import { useState } from "react"
import { Loader2, Lock, Phone, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Step = "phone" | "verify"

function normalizePhone(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, "")
  if (trimmed.startsWith("+")) return trimmed
  if (trimmed.startsWith("0")) return `+972${trimmed.slice(1)}`
  return `+${trimmed}`
}

export function Auth() {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const sendSms = async () => {
    setError(null)
    setMessage(null)
    const normalized = normalizePhone(phone)
    if (normalized.length < 10) {
      setError("Enter a valid phone number (include country code, e.g. +972…).")
      return
    }

    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalized,
    })
    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setPhone(normalized)
    setMessage("SMS code sent. Check your phone and enter the code below.")
    setStep("verify")
  }

  const completeRegistration = async () => {
    setError(null)
    setMessage(null)

    if (!token.trim()) {
      setError("Enter the verification code from your SMS.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: token.trim(),
      type: "sms",
    })

    if (verifyError) {
      setLoading(false)
      setError(verifyError.message)
      return
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (passwordError) {
      setError(passwordError.message)
      return
    }

    setMessage("Registration complete. You are signed in.")
    setToken("")
    setPassword("")
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
      <div className="mb-6 text-center">
        <p className="hobbyx-label-sub text-xs uppercase tracking-[0.25em]">
          HobbyX account
        </p>
        <h1 className="hobbyx-label-title mt-2 text-2xl">Sign in with SMS</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "phone"
            ? "We will text you a one-time code."
            : "Enter the code and choose a password."}
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
          </label>
          <button
            type="button"
            onClick={() => void sendSms()}
            disabled={loading || !phone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send SMS"
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
              SMS code
            </span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </label>

          <label className="block space-y-2">
            <span className="hobbyx-setting-label flex items-center gap-2">
              <Lock className="h-4 w-4" aria-hidden />
              New password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </label>

          <button
            type="button"
            onClick={() => void completeRegistration()}
            disabled={loading || !token.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#8b5cf6] px-4 py-3 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Complete Registration"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("phone")
              setToken("")
              setPassword("")
              setError(null)
              setMessage(null)
            }}
            disabled={loading}
            className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
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
