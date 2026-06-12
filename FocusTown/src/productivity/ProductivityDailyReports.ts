import { ProductivityEvent } from "./types"
import { summarizeProductivityEvent } from "./ProductivitySummary"

export function getEventDayKey(event: ProductivityEvent) {
    return new Date(event.startedAt).toISOString().slice(0, 10)
}

export function getTodayKey() {
    return new Date().toISOString().slice(0, 10)
}

export function getEventsForDay(events: ProductivityEvent[], dayKey: string) {
    return events.filter((e) => getEventDayKey(e) === dayKey)
}

export function getTodayProductivityReport(events: ProductivityEvent[]) {
    const todayEvents = getEventsForDay(events, getTodayKey())

    return {
        dayKey : getTodayKey(),
        events : todayEvents,
        summary : summarizeProductivityEvent(todayEvents)
    }
}