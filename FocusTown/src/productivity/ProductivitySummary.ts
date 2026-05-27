import {ProductivityEvent, ProductivitySummary} from "./types"

export function summarizeProductivityEvent(events: ProductivityEvent[]): ProductivitySummary {
    const summary: ProductivitySummary = {
        focusSeconds: 0,
        distractionSeconds: 0,
        idleSeconds: 0,
        breakSeconds: 0,
        totalTrackedSeconds: 0,
        averageProductivityScore: 0
    }

    if (events.length === 0) {
        return summary
    }
    
    let scoreTotal = 0

    events.forEach(event => {
        summary.totalTrackedSeconds += event.durationSeconds
        scoreTotal += event.productivityScore

        if (event.type === "focus") {
            summary.focusSeconds += event.durationSeconds
        } else if (event.type === "distraction") {
            summary.distractionSeconds += event.durationSeconds
        } else if (event.type === "idle") {
            summary.idleSeconds += event.durationSeconds
        } else if (event.type === "break") {
            summary.breakSeconds += event.durationSeconds
        }
    })
    
    summary.averageProductivityScore = scoreTotal / events.length
    return summary;
}