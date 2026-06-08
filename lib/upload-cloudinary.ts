import type { CloudinaryVideoUploadResult } from "@/lib/submission"
import type { CategorySlug } from "@/lib/competitions"

export async function uploadVideoToCloudinary(
  videoFile: File,
  category: CategorySlug,
  onProgress?: (percent: number) => void
): Promise<CloudinaryVideoUploadResult> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category }),
  })

  if (!signRes.ok) {
    const data = await signRes.json().catch(() => ({}))
    throw new Error(data.error ?? "Could not authorize upload")
  }

  const { cloudName, apiKey, timestamp, signature, folder, tags } =
    await signRes.json()

  const formData = new FormData()
  formData.append("file", videoFile)
  formData.append("api_key", apiKey)
  formData.append("timestamp", String(timestamp))
  formData.append("signature", signature)
  formData.append("folder", folder)
  formData.append("tags", tags)
  formData.append("resource_type", "video")

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
    )

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as CloudinaryVideoUploadResult)
        return
      }
      try {
        const err = JSON.parse(xhr.responseText)
        reject(new Error(err.error?.message ?? "Cloudinary upload failed"))
      } catch {
        reject(new Error("Cloudinary upload failed"))
      }
    }

    xhr.onerror = () => reject(new Error("Network error during upload"))
    xhr.send(formData)
  })
}
