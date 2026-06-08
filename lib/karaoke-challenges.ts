/**
 * Karaoke challenge configs — keyed by `karaokeChallengeId` on competitions.
 */

export interface KaraokeLyricCue {
  startSeconds: number
  text: string
}

export interface KaraokeChallengeConfig {
  id: string
  competitionId: string
  durationSeconds: number
  /** Royalty-free demo instrumental (chorus-style bed for sing-along UX) */
  instrumentalUrl: string
  instrumentalStartOffsetSeconds: number
  lyricsSnippet: string
  lyricCues: KaraokeLyricCue[]
  songTitle: string
  artistName: string
}

export const KARAOKE_CHALLENGES: Record<string, KaraokeChallengeConfig> = {
  tehom: {
    id: "tehom",
    competitionId: "music-tehom-karaoke",
    durationSeconds: 15,
    instrumentalUrl:
      "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3",
    instrumentalStartOffsetSeconds: 0,
    songTitle: "תהום",
    artistName: "עומר אדם",
    lyricsSnippet:
      "ורציתי לצעוק אל העולם, שבינינו הכל כבר נעלם, איך נשארנו לבד בתוך תהום...",
    lyricCues: [
      { startSeconds: 0, text: "ורציתי לצעוק אל העולם," },
      { startSeconds: 5, text: "שבינינו הכל כבר נעלם," },
      { startSeconds: 10, text: "איך נשארנו לבד בתוך תהום..." },
    ],
  },
}

export function getKaraokeChallenge(
  challengeId: string | undefined
): KaraokeChallengeConfig | null {
  if (!challengeId) return null
  return KARAOKE_CHALLENGES[challengeId] ?? null
}

export function getKaraokeChallengeForCompetition(
  competitionId: string,
  karaokeChallengeId?: string
): KaraokeChallengeConfig | null {
  const byId = getKaraokeChallenge(karaokeChallengeId)
  if (byId && byId.competitionId === competitionId) return byId
  return (
    Object.values(KARAOKE_CHALLENGES).find((c) => c.competitionId === competitionId) ??
    null
  )
}

export function getActiveLyricCueIndex(
  cues: KaraokeLyricCue[],
  elapsedSeconds: number
): number {
  let index = 0
  for (let i = 0; i < cues.length; i++) {
    if (elapsedSeconds >= cues[i].startSeconds) index = i
  }
  return index
}
