import { ProductivityEvent } from "./types"

const PRODUCTIVITY_EVENTS_STORAGE_KEY = "focusTown.productivityEvents"

export function loadProductivityEvents(): ProductivityEvent[] {
    const rawEvents = localStorage.getItem(PRODUCTIVITY_EVENTS_STORAGE_KEY)
    if (!rawEvents) return []
    try {
        return JSON.parse(rawEvents) as ProductivityEvent[]
    }catch (e) {
        console.error("Failed to parse productivity events from localStorage", e)
        return []
    }
}

export function saveProductivityEvents(events: ProductivityEvent[]) {
    localStorage.setItem(PRODUCTIVITY_EVENTS_STORAGE_KEY, JSON.stringify(events))
}