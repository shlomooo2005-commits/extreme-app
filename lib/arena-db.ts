import { neon } from "@neondatabase/serverless"
import { randomUUID } from "node:crypto"
import type { ArenaSuggestion } from "@/lib/arena"
import { getArenaSeedRows } from "@/lib/arena-seed"
import { validateBlobVideoUrl } from "@/lib/blob-storage"
import { isCategorySlug, type CategorySlug } from "@/lib/competitions"

export class ArenaDbError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message)
    this.name = "ArenaDbError"
  }
}

function getDatabaseUrl(): string | undefined {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL
}

export function isArenaDbConfigured(): boolean {
  return Boolean(getDatabaseUrl())
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) {
    throw new ArenaDbError(
      "Database not configured. Add Neon/Vercel Postgres and set POSTGRES_URL.",
      503
    )
  }
  return neon(url)
}

let schemaReady: Promise<void> | null = null

export function ensureArenaSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql()
      await sql`
        CREATE TABLE IF NOT EXISTS arena_suggestions (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          category_slug TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `
      await sql`
        CREATE TABLE IF NOT EXISTS arena_votes (
          suggestion_id TEXT NOT NULL REFERENCES arena_suggestions(id) ON DELETE CASCADE,
          voter_id TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (suggestion_id, voter_id)
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS arena_suggestions_category_idx
        ON arena_suggestions (category_slug)
      `
      await sql`
        CREATE INDEX IF NOT EXISTS arena_votes_voter_idx
        ON arena_votes (voter_id)
      `
      await sql`
        ALTER TABLE arena_suggestions
        ADD COLUMN IF NOT EXISTS video_url TEXT
      `
    })().catch((err) => {
      schemaReady = null
      throw err
    })
  }

  return schemaReady
}

async function seedArenaIfEmpty(): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT COUNT(*)::int AS count FROM arena_suggestions`
  const count = (rows[0] as { count: number }).count
  if (count > 0) return

  const seeds = getArenaSeedRows()
  for (const seed of seeds) {
    await sql`
      INSERT INTO arena_suggestions (id, text, category_slug, created_at)
      VALUES (${seed.id}, ${seed.text}, ${seed.categorySlug}, ${seed.createdAt})
      ON CONFLICT (id) DO NOTHING
    `
    for (let i = 0; i < seed.voteCount; i++) {
      await sql`
        INSERT INTO arena_votes (suggestion_id, voter_id)
        VALUES (${seed.id}, ${`seed-voter-${seed.id}-${i}`})
        ON CONFLICT DO NOTHING
      `
    }
  }
}

function mapRow(row: {
  id: string
  text: string
  category_slug: string
  created_at: Date | string
  video_url: string | null
  votes: string | number
}): ArenaSuggestion {
  return {
    id: row.id,
    text: row.text,
    categorySlug: row.category_slug as CategorySlug,
    votes: Number(row.votes),
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    videoUrl: row.video_url,
  }
}

export async function listArenaSuggestions(
  voterId?: string
): Promise<{ suggestions: ArenaSuggestion[]; votedIds: string[] }> {
  await ensureArenaSchema()
  await seedArenaIfEmpty()

  const sql = getSql()
  const rows = await sql`
    SELECT
      s.id,
      s.text,
      s.category_slug,
      s.created_at,
      s.video_url,
      COUNT(v.suggestion_id)::text AS votes
    FROM arena_suggestions s
    LEFT JOIN arena_votes v ON v.suggestion_id = s.id
    GROUP BY s.id, s.text, s.category_slug, s.created_at, s.video_url
    ORDER BY COUNT(v.suggestion_id) DESC, s.created_at DESC
  `

  const suggestions = (rows as Parameters<typeof mapRow>[0][]).map(mapRow)

  let votedIds: string[] = []
  if (voterId) {
    const voted = await sql`
      SELECT suggestion_id FROM arena_votes WHERE voter_id = ${voterId}
    `
    votedIds = (voted as { suggestion_id: string }[]).map((r) => r.suggestion_id)
  }

  return { suggestions, votedIds }
}

export async function createArenaSuggestion(
  text: string,
  categorySlug: CategorySlug,
  videoUrl: string | null = null
): Promise<ArenaSuggestion> {
  await ensureArenaSchema()

  const sql = getSql()
  const id = `arena-${randomUUID()}`
  const rows = await sql`
    INSERT INTO arena_suggestions (id, text, category_slug, video_url)
    VALUES (${id}, ${text}, ${categorySlug}, ${videoUrl})
    RETURNING id, text, category_slug, created_at, video_url
  `

  const row = rows[0] as {
    id: string
    text: string
    category_slug: string
    created_at: Date
    video_url: string | null
  }
  return {
    id: row.id,
    text: row.text,
    categorySlug: row.category_slug as CategorySlug,
    votes: 0,
    createdAt: new Date(row.created_at).toISOString(),
    videoUrl: row.video_url,
  }
}

export function validateArenaVideoInput(
  videoUrl: unknown
): { videoUrl: string | null } | { error: string } {
  return validateBlobVideoUrl(videoUrl)
}

export async function addArenaVote(
  suggestionId: string,
  voterId: string
): Promise<{ ok: true; votes: number } | { ok: false; reason: "already_voted" | "not_found" }> {
  await ensureArenaSchema()

  const sql = getSql()
  const exists = await sql`
    SELECT id FROM arena_suggestions WHERE id = ${suggestionId} LIMIT 1
  `
  if ((exists as { id: string }[]).length === 0) {
    return { ok: false, reason: "not_found" }
  }

  const inserted = await sql`
    INSERT INTO arena_votes (suggestion_id, voter_id)
    VALUES (${suggestionId}, ${voterId})
    ON CONFLICT (suggestion_id, voter_id) DO NOTHING
    RETURNING suggestion_id
  `

  if ((inserted as unknown[]).length === 0) {
    return { ok: false, reason: "already_voted" }
  }

  const counted = await sql`
    SELECT COUNT(*)::text AS votes
    FROM arena_votes
    WHERE suggestion_id = ${suggestionId}
  `

  return {
    ok: true,
    votes: Number((counted[0] as { votes: string }).votes ?? 0),
  }
}

export function validateArenaInput(
  text: unknown,
  categorySlug: unknown
): { text: string; categorySlug: CategorySlug } | { error: string } {
  if (typeof text !== "string" || !text.trim()) {
    return { error: "Challenge idea text is required." }
  }
  const trimmed = text.trim()
  if (trimmed.length > 500) {
    return { error: "Challenge idea must be 500 characters or fewer." }
  }
  if (typeof categorySlug !== "string" || !isCategorySlug(categorySlug)) {
    return { error: "A valid category is required." }
  }
  return { text: trimmed, categorySlug }
}

export function validateVoterId(voterId: unknown): string | null {
  if (typeof voterId !== "string") return null
  const trimmed = voterId.trim()
  if (trimmed.length < 8 || trimmed.length > 128) return null
  return trimmed
}
