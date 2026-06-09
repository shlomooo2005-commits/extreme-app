import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import {
  isValidInternationalPhone,
  isValidOtpCode,
  normalizePhone,
} from "@/lib/phone-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rawPhone = typeof body.phone === "string" ? body.phone : ""
    const token = typeof body.token === "string" ? body.token.trim() : ""
    const phone = normalizePhone(rawPhone)

    if (!isValidInternationalPhone(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number." },
        { status: 400 },
      )
    }

    if (!isValidOtpCode(token)) {
      return NextResponse.json(
        { error: "Enter the 6-digit code from your SMS." },
        { status: 400 },
      )
    }

    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "Verification succeeded but no session was returned." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to verify code."
    const status = message.includes("not configured") ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
