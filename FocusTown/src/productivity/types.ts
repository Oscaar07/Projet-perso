export type ProductivityEventType = "focus" | "distraction" | "idle" | "break" | "unknown"

// Atomic activity record. Later, these events can come from Tauri instead of UI buttons.
export type ProductivityEvent = {
    id: string
    type: ProductivityEventType
    startedAt: number
    endedAt: number 
    durationSeconds: number
    appName?: string
    windowTitle?: string
    domain?: string
    productivityScore: number
}

// Aggregated view consumed by the simulation engine.
export type ProductivitySummary = {
    focusSeconds: number
    distractionSeconds: number
    idleSeconds: number
    breakSeconds: number
    totalTrackedSeconds: number
    averageProductivityScore: number
}