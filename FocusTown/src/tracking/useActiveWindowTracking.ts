import { useEffect } from "react"
import { listen } from "@tauri-apps/api/event"
import { ProductivityEvent } from "../productivity/types"

export type TrackingEventPayload = {
  title: string
  processName: string
  eventType: "focus" | "distraction" | "idle" | "break" | "unknown"
  timestamp: number
}

export function useActiveWindowTracking(
  onEvent: (event: ProductivityEvent) => void
) {
  useEffect(() => {
    let previousEvent: TrackingEventPayload | null = null
    let sessionStart = Date.now()

    const setup = async () => {
      const unlisten = await listen<TrackingEventPayload>("tracking-event", (event) => {
        const now = Date.now()
        const ev = event.payload

        if (previousEvent) {
          const productivityEvent: ProductivityEvent = {
            id: crypto.randomUUID(),
            type: previousEvent.eventType,
            startedAt: sessionStart,
            endedAt: now,
            durationSeconds: Math.floor((now - sessionStart) / 1000),
            appName: previousEvent.processName,
            windowTitle: previousEvent.title,
            productivityScore:
              previousEvent.eventType === "focus" ? 90 :
              previousEvent.eventType === "break" ? 70 :
              previousEvent.eventType === "distraction" ? 20 : 50,
          }
          onEvent(productivityEvent)
        }

        previousEvent = ev
        sessionStart = now
      })

      return unlisten
    }

    const unlistenPromise = setup()
    return () => { unlistenPromise.then(fn => fn()) }
  }, [onEvent])
}