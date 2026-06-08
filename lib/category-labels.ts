/** Shared copy + helpers for category titles and competition-count sublabels */

export function formatActiveCompetitionsSubLabel(count: number): string {
  if (count === 0) return "אין תחרויות פעילות"
  if (count === 1) return "תחרות פעילה אחת"
  return `${count} תחרויות פעילות`
}

export function formatActiveCompetitionsSubLabelEn(count: number): string {
  if (count === 0) return "No active competitions"
  if (count === 1) return "1 active competition"
  return `${count} active competitions`
}
