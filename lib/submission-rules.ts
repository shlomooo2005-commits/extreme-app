import type { Competition, SubmissionType } from "@/lib/competitions"
import type { CaptureMethod } from "@/lib/upload-policy"

export function isLiveCameraSubmission(type: SubmissionType): boolean {
  return type === "LIVE_CAMERA_ONLY"
}

export function isVerifiedUploadSubmission(type: SubmissionType): boolean {
  return type === "VERIFIED_UPLOAD"
}

export function captureMethodFromSubmissionType(
  type: SubmissionType
): CaptureMethod {
  return type === "LIVE_CAMERA_ONLY" ? "live_camera" : "verified_file"
}

export function getSubmissionTypeLabel(type: SubmissionType): string {
  return type === "LIVE_CAMERA_ONLY"
    ? "Live camera only (anti-cheat)"
    : "Verified file upload"
}

export function getUploadPolicyLabelForType(type: SubmissionType): string {
  if (type === "LIVE_CAMERA_ONLY") {
    return "This competition requires live in-app recording. Gallery and file uploads are blocked."
  }
  return "Upload an original prerecorded video (GoPro, phone export, etc.). Metadata verification runs before judging."
}

export function getSubmissionRules(competition: Competition) {
  const submissionType = competition.submissionType
  return {
    submissionType,
    captureMethod: captureMethodFromSubmissionType(submissionType),
    isLiveCamera: isLiveCameraSubmission(submissionType),
    isVerifiedUpload: isVerifiedUploadSubmission(submissionType),
    policyLabel: getUploadPolicyLabelForType(submissionType),
    typeLabel: getSubmissionTypeLabel(submissionType),
  }
}
