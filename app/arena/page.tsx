import { ArenaBoard } from "@/components/arena/arena-board"
import { createPageMetadata } from "@/lib/site-config"

export const metadata = createPageMetadata({
  title: "HobbyX Arena",
  description:
    "Vote on the next HobbyX challenge. זירת האתגרים — community ideas become official competitions.",
  path: "/arena",
})

export default function ArenaPage() {
  return <ArenaBoard />
}
