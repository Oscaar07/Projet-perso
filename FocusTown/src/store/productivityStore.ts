import { create } from "zustand"
import { ProductivityEvent, ProductivitySummary } from "../productivity/types"
import { summarizeProductivityEvent } from "../productivity/ProductivitySummary"
import { engine } from "./simulationStore"

const EMPTY_SUMMARY: ProductivitySummary = {
  focusSeconds: 0, distractionSeconds: 0, idleSeconds: 0,
  breakSeconds: 0, totalTrackedSeconds: 0, averageProductivityScore: 0,
}

type ProductivityState = {
  events: ProductivityEvent[]
  summary: ProductivitySummary
  activeFocusStartedAt: number | null
  loaded: boolean
  addEvent: (event: ProductivityEvent) => void
  clearAll: () => void
  startFocus: () => void
  stopFocus: () => void
}

export const useProductivityStore = create<ProductivityState>((set, get) => ({
  events: [],
  summary: { ...EMPTY_SUMMARY },
  activeFocusStartedAt: null,
  loaded: false,

  addEvent: (event) => {
    const nextEvents = [...get().events, event]
    const nextSummary = summarizeProductivityEvent(nextEvents)
    engine.setProductivitySummary(nextSummary)
    set({ events: nextEvents, summary: nextSummary })
  },

  clearAll: () => {
    engine.setProductivitySummary(EMPTY_SUMMARY)
    set({ events: [], summary: { ...EMPTY_SUMMARY } })
  },

  startFocus: () => {
    set({ activeFocusStartedAt: Date.now() })
  },

  stopFocus: () => {
    const { activeFocusStartedAt, addEvent } = get()
    if (!activeFocusStartedAt) return
    const now = Date.now()
    addEvent({
      id: crypto.randomUUID(),
      type: "focus",
      startedAt: activeFocusStartedAt,
      endedAt: now,
      durationSeconds: Math.floor((now - activeFocusStartedAt) / 1000),
      appName: "Manual Focus",
      productivityScore: 90,
    })
    set({ activeFocusStartedAt: null })
  },
}))