import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  isValidInternationalPhone,
  normalizePhone,
} from "@/lib/phone-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawPhone = typeof body.phone === "string" ? body.phone : ""
    const phone = normalizePhone(rawPhone)

    if (!isValidInternationalPhone(phone)) {
      return NextResponse.json(
        {
          error:
            "Enter a valid international phone number with country code (e.g. +972501234567).",
        },
        { status: 400 },
      )
    }

    const supabase = createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithOtp({ phone })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send verification code."
    const status = message.includes("not configured") ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
