import { Homepage } from "@/components/home/homepage"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "HobbyX",
  description: "HobbyX — compete, win, get paid.",
  path: "/",
})

export default function Page() {
  return <Homepage />
}
