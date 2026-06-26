import { ProductivityEvent } from "./types"

export type TimelineBucket = {
  label: string        // "08h", "08h30", "09h", ...
  focus: number        // secondes de focus dans ce créneau
  distraction: number
  idle: number
  unknown: number
}

const BUCKET_MINUTES = 30

export function buildTimeline(
  events: ProductivityEvent[],
  dayKey: string
): TimelineBucket[] {
  // 1. Filtrer les events du jour
  const dayEvents = events.filter(
    (e) => new Date(e.startedAt).toISOString().slice(0, 10) === dayKey
  )
  if (dayEvents.length === 0) return []

  // 2. Créer 48 buckets de 30min (00h00 → 23h59)
  const buckets: TimelineBucket[] = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const min = (i % 2) * 30
    return {
      label: `${hour.toString().padStart(2, "0")}h${min === 0 ? "" : "30"}`,
      focus: 0,
      distraction: 0,
      idle: 0,
      unknown: 0,
    }
  })

  // 3. Répartir chaque event dans les buckets qu'il chevauche
  const dayStartMs = new Date(dayKey + "T00:00:00").getTime()
  const bucketMs = BUCKET_MINUTES * 60 * 1000

  for (const event of dayEvents) {
    const startMs = event.startedAt
    const endMs = event.endedAt
    const startMin = new Date(event.startedAt).getHours() * 60 +
      new Date(event.startedAt).getMinutes()
    const endMin = startMin + (event.durationSeconds / 60)

    const firstBucket = Math.floor(startMin / BUCKET_MINUTES)
    const lastBucket = Math.min(
      Math.floor(endMin / BUCKET_MINUTES),
      buckets.length - 1
    )

    for (let b = firstBucket; b <= lastBucket; b++) {
      const bucketStartMs = dayStartMs + b * bucketMs
      const bucketEndMs = bucketStartMs + bucketMs
      const overlapStart = Math.max(startMs, bucketStartMs)
      const overlapEnd = Math.min(endMs, bucketEndMs)
      const overlapSec = Math.max(0, (overlapEnd - overlapStart) / 1000)

      if (event.type === "focus") buckets[b].focus += overlapSec
      else if (event.type === "distraction") buckets[b].distraction += overlapSec
      else if (event.type === "idle") buckets[b].idle += overlapSec
      else buckets[b].unknown += overlapSec
    }
  }

  return buckets
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m > 0 ? m : ""}`
  return `${m}min`
}