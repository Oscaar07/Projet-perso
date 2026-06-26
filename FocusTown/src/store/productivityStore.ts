import { create } from "zustand"
import { ProductivityEvent, ProductivitySummary } from "../productivity/types"
import { summarizeProductivityEvent } from "../productivity/ProductivitySummary"
import { saveProductivityEvent } from "../productivity/ProductivityStorage"
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
  pendingBuffer: ProductivityEvent[]
  addEvent: (event: ProductivityEvent) => void
  setEvents: (events: ProductivityEvent[]) => void
  clearAll: () => void
  startFocus: () => void
  stopFocus: () => void
}

export const useProductivityStore = create<ProductivityState>((set, get) => ({
  events: [],
  summary: { ...EMPTY_SUMMARY },
  activeFocusStartedAt: null,
  loaded: false,
  pendingBuffer:[],

addEvent: async (event) => {
  // Bufferiser les events reçus avant le chargement SQLite
  if (!get().loaded) {
    set({ pendingBuffer: [...get().pendingBuffer, event] })
    return
  }
  const nextEvents = [...get().events, event]
  const nextSummary = summarizeProductivityEvent(nextEvents)
  engine.setProductivitySummary(nextSummary)
  set({ events: nextEvents, summary: nextSummary })
  await saveProductivityEvent(event)
},

  setEvents: (events) => {
    const summary = summarizeProductivityEvent(events)
    engine.setProductivitySummary(summary)
    set({ events, summary })
    // Rejouer les events bufferisés pendant le chargement
    const pending = get().pendingBuffer
    if (pending.length > 0) {
      set({ pendingBuffer: [] })
      for (const e of pending) {
        get().addEvent(e)
      }
    }
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