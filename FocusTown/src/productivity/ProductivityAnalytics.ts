/**
 * Agrégation des événements de productivité en timeline pour le graphique.
 *
 * Prend tous les événements de la journée et les répartit dans des
 * buckets de 30 minutes. Chaque bucket totalise les secondes de chaque
 * type d'activité (focus, distraction, idle, break, unknown) qui
 * chevauchent ce créneau. Un événement long peut s'étendre sur plusieurs
 * buckets — on découpe proportionnellement.
 *
 * Le résultat alimente le Recharts BarChart du dashboard.
 */
import { ProductivityEvent } from "./types"

export type TimelineBucket = {
  label: string
  focus: number
  distraction: number
  idle: number
  break: number
  unknown: number
}

const BUCKET_MINUTES = 30

export function buildTimeline(
  events: ProductivityEvent[],
  dayKey: string
): TimelineBucket[] {
  const dayEvents = events.filter(
    (e) => new Date(e.startedAt).toISOString().slice(0, 10) === dayKey
  )
  if (dayEvents.length === 0) return []

  const buckets: TimelineBucket[] = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const min = (i % 2) * 30
    return {
      label: `${hour.toString().padStart(2, "0")}h${min === 0 ? "" : "30"}`,
      focus: 0,
      distraction: 0,
      idle: 0,
      break: 0,
      unknown: 0,
    }
  })

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
      else if (event.type === "break") buckets[b].break += overlapSec
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
