import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import {
  isSportInterestSlug,
  type SportInterestSlug,
} from "@/lib/sport-interests"

export interface UserProfileRow {
  id: string
  display_name: string | null
  preferred_sport_interests: string[]
  created_at: string
  updated_at: string
}

function normalizeInterests(raw: unknown): SportInterestSlug[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (value): value is SportInterestSlug =>
      typeof value === "string" && isSportInterestSlug(value),
  )
}

function interestsFromUserMetadata(user: User): SportInterestSlug[] {
  const fromMetadata = user.user_metadata?.preferred_sport_interests
  return normalizeInterests(fromMetadata)
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  return {
    ...data,
    preferred_sport_interests: normalizeInterests(
      data.preferred_sport_interests,
    ),
  }
}

export async function ensureUserProfile(user: User): Promise<UserProfileRow> {
  const existing = await fetchUserProfile(user.id)
  if (existing) return existing

  const preferred = interestsFromUserMetadata(user)

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      display_name:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null,
      preferred_sport_interests: preferred,
    })
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...data,
    preferred_sport_interests: normalizeInterests(
      data.preferred_sport_interests,
    ),
  }
}

export async function updatePreferredSportInterests(
  userId: string,
  interests: SportInterestSlug[],
): Promise<UserProfileRow> {
  const { data, error } = await supabase
    .from("user_profiles")
    .update({
      preferred_sport_interests: interests,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    ...data,
    preferred_sport_interests: normalizeInterests(
      data.preferred_sport_interests,
    ),
  }
}
