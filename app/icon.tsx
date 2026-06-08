import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 900,
          color: "#0a0a0a",
          letterSpacing: "-0.05em",
        }}
      >
        HX
      </div>
    ),
    { ...size }
  )
}
