import type { MetadataRoute } from "next"
import { SITE_NAME, SITE_SHORT_DESCRIPTION } from "@/lib/site-config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_SHORT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#030303",
    theme_color: "#ff6b00",
  }
}
