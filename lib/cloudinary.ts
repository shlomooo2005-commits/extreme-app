import crypto from "node:crypto"

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local"
    )
  }

  return { cloudName, apiKey, apiSecret }
}

/** @see https://cloudinary.com/documentation/upload_images#generating_authentication_signatures */
export function signUploadParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const signatureString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&")

  return crypto
    .createHash("sha1")
    .update(signatureString + apiSecret)
    .digest("hex")
}

export const SUBMISSIONS_FOLDER = "hobbyx-submissions"
