import { NextResponse } from "next/server"
import {
  isSubmissionsDbConfigured,
  runSubmissionFingerprintScan,
} from "@/lib/submissions-db"

/** Background video fingerprint scan (external / GoPro uploads). */
export async function POST(request: Request) {
  if (!isSubmissionsDbConfigured()) {
    return NextResponse.json(
      { error: "Submissions database is not configured." },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const submissionId =
      typeof body.submissionId === "string" ? body.submissionId.trim() : ""

    if (!submissionId) {
      return NextResponse.json(
        { error: "submissionId is required." },
        { status: 400 }
      )
    }

    const result = await runSubmissionFingerprintScan(submissionId)
    if (!result) {
      return NextResponse.json(
        { error: "Submission not found or not eligible for fingerprint scan." },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true, result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Fingerprint scan failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
