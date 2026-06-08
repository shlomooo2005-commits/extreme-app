import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 50%, #111 100%)",
          fontSize: 72,
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
