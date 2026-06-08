"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { Camera, CheckCircle2, Loader2 } from "lucide-react"
import {
  isValidEmail,
  isValidPhone,
  type UserAccount,
} from "@/lib/user-account"
import { BilingualLabel } from "./bilingual-label"

const MAX_PHOTO_BYTES = 2 * 1024 * 1024

export type ProfileOnboardingData = {
  fullName: string
  email: string
  phone: string
  profilePictureDataUrl?: string
}

export type PersonalDetailsData = ProfileOnboardingData

interface PersonalDetailsFormProps {
  initialAccount?: UserAccount | null
  onSave: (data: PersonalDetailsData) => void
  variant?: "onboarding" | "step"
  submitLabel?: string
}

export function PersonalDetailsForm({
  initialAccount,
  onSave,
  variant = "step",
  submitLabel = "Save personal details",
}: PersonalDetailsFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(initialAccount?.fullName ?? "")
  const [email, setEmail] = useState(initialAccount?.email ?? "")
  const [phone, setPhone] = useState(initialAccount?.phone ?? "")
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialAccount?.profilePictureDataUrl ?? null
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const handlePhoto = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.")
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("Profile picture must be under 2 MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSavedFlash(false)

    if (!fullName.trim()) {
      setError("Full name is required / שם מלא נדרש")
      return
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid email address / הזן כתובת אימייל תקינה")
      return
    }
    if (!isValidPhone(phone)) {
      setError("Enter a valid phone number (9–15 digits) / מספר טלפון לא תקין")
      return
    }

    setSubmitting(true)
    try {
      onSave({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profilePictureDataUrl: photoPreview ?? undefined,
      })
      setSavedFlash(true)
    } finally {
      setSubmitting(false)
    }
  }

  const isStep = variant === "step"

  return (
    <div className={isStep ? "" : "mx-auto max-w-lg"}>
      {!isStep && (
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#ff9500]">
            HobbyX · Welcome
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Create your profile
          </h1>
          <p dir="rtl" className="mt-2 text-lg font-semibold text-foreground/70">
            יצירת פרופיל אישי
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-[#8b5cf6]/25 bg-card/90 p-4 backdrop-blur-md sm:space-y-5 sm:p-5 md:p-6"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.12), 0 0 32px rgba(139,92,246,0.08)",
        }}
      >
        {isStep && (
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Required before any upload. We link every video to this identity.
          </p>
        )}

        <div>
          <BilingualLabel en="Full Name" he="שם מלא" required htmlFor="fullName" />
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#00e5ff] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/25 sm:text-base"
            placeholder="Jordan Davis"
          />
        </div>

        <div>
          <BilingualLabel
            en="Email"
            he="אימייל"
            required
            htmlFor="email"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#00e5ff] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/25 sm:text-base"
            placeholder="you@email.com"
          />
        </div>

        <div>
          <BilingualLabel
            en="Phone Number"
            he="מספר טלפון"
            required
            htmlFor="phone"
          />
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#00e5ff] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/25 sm:text-base"
            placeholder="+1 555 000 0000"
          />
        </div>

        {!isStep && (
          <div>
            <BilingualLabel
              en="Profile Picture"
              he="תמונת פרופיל"
              htmlFor="photo"
            />
            <p className="mb-3 text-xs text-foreground/45">Optional / אופציונלי</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background hover:border-[#ff6b00]/50"
              >
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
              <input
                ref={fileRef}
                id="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-foreground/45">
                JPG or PNG, max 2 MB.
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {savedFlash && (
          <p className="flex items-center gap-2 text-sm font-medium text-[#4ade80]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Personal details saved / נשמר בהצלחה
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00e5ff] via-[#8b5cf6] to-[#ff6b00] py-3.5 text-xs font-black uppercase tracking-widest text-black disabled:opacity-60 sm:py-4 sm:text-sm"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            submitLabel
          )}
        </button>
      </form>
    </div>
  )
}
