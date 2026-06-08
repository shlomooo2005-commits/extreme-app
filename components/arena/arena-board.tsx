"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, ThumbsUp } from "lucide-react"
import { getCategories, type CategorySlug } from "@/lib/competitions"
import { getCategoryLabel } from "@/lib/arena"
import type { ArenaFilter } from "@/lib/arena"
import { useArenaBoard } from "@/hooks/use-arena-board"
import { ArenaVideoUpload } from "./arena-video-upload"

export function ArenaBoard() {
  const categories = getCategories()
  const {
    ready,
    error,
    filter,
    setFilter,
    displayed,
    leaderId,
    votedIds,
    isSubmitting,
    votingId,
    addSuggestion,
    upvote,
  } = useArenaBoard()

  const [idea, setIdea] = useState("")
  const [category, setCategory] = useState<CategorySlug>("mountain-biking")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setVideoUrl(null)
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!idea.trim()) {
      setSubmitError("Please enter your challenge idea.")
      return
    }
    const ok = await addSuggestion(idea, category, videoUrl)
    if (ok) {
      setIdea("")
      setVideoUrl(null)
      setSubmitError(null)
    }
  }

  const filters: { id: ArenaFilter; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.slug as ArenaFilter, label: c.shortName })),
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-10 md:py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#ff9500]">
            HobbyX Arena / זירת האתגרים
          </p>
          <h1 className="text-2xl font-bold leading-snug md:text-3xl">
            <span dir="rtl" className="block">
              ?מה לדעתך תהיה התחרות הבאה
            </span>
            <span className="mt-2 block text-foreground/90">
              What do you think the next challenge should be?
            </span>
          </h1>
          <p
            dir="rtl"
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground"
          >
            הרעיון שיקבל את מירב ההצבעות יהפוך באופן אוטומטית לתחרות הרשמית הבאה.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
            The idea with the most votes will automatically become the next
            official competition.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-3 rounded-2xl border border-border bg-card p-5"
        >
          <label htmlFor="arena-idea" className="sr-only">
            Challenge idea
          </label>
          <textarea
            id="arena-idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            placeholder="Describe your challenge idea…"
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-[#ff9500]/50 focus:outline-none disabled:opacity-50"
          />
          <ArenaVideoUpload
            categorySlug={category}
            videoUrl={videoUrl}
            disabled={isSubmitting}
            onUploaded={setVideoUrl}
            onClear={() => setVideoUrl(null)}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategorySlug)}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-[#ff9500]/50 focus:outline-none disabled:opacity-50"
              aria-label="Category"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ffcc00] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit idea"}
            </button>
          </div>
          {submitError && (
            <p className="text-sm text-red-400">{submitError}</p>
          )}
        </form>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === f.id
                  ? "border-[#ff9500] bg-[#ff9500]/20 text-[#ffcc00]"
                  : "border-border bg-card text-muted-foreground hover:border-white/30 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!ready ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ff9500] border-t-transparent" />
          </div>
        ) : displayed.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No ideas in this category yet. Be the first to submit one!
          </p>
        ) : (
          <ul className="space-y-3">
            {displayed.map((s) => {
              const isLeader = s.id === leaderId
              const hasVoted = votedIds.has(s.id)
              const isVoting = votingId === s.id
              return (
                <li
                  key={s.id}
                  className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                    isLeader
                      ? "border-[#ff9500]/60 bg-gradient-to-br from-[#ff6b00]/15 to-card shadow-[0_0_32px_rgba(255,107,0,0.15)]"
                      : "border-border bg-card"
                  }`}
                >
                  {isLeader && (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#ff9500]/50 bg-[#ff9500]/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#ffcc00]">
                      <span aria-hidden>🔥</span>
                      <span dir="rtl">האתגר הבא!</span>
                      <span className="text-foreground/70">/</span>
                      <span>Leading!</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="mb-2 inline-block rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {getCategoryLabel(s.categorySlug)}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                        {s.text}
                      </p>
                      {s.videoUrl && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-black">
                          <video
                            src={s.videoUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="max-h-40 w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <button
                        type="button"
                        disabled={hasVoted || isVoting}
                        onClick={() => void upvote(s.id)}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                          hasVoted
                            ? "border-[#22c55e]/40 bg-[#22c55e]/15 text-[#4ade80]"
                            : "border-border bg-background text-foreground hover:border-[#ff9500]/50 hover:bg-[#ff9500]/10 hover:text-[#ffcc00] disabled:opacity-50"
                        }`}
                        aria-label={`Upvote, ${s.votes} votes`}
                      >
                        <ThumbsUp
                          className={`h-5 w-5 ${hasVoted ? "fill-current" : ""} ${isVoting ? "animate-pulse" : ""}`}
                        />
                      </button>
                      <span className="font-mono text-lg font-bold tabular-nums text-[#ffcc00]">
                        {s.votes}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
