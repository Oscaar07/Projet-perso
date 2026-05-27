export type ProductivityEventType = "focus" | "distraction" | "idle" | "break" | "unknown"

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

export type ProductivitySummary = {
    focusSeconds: number
    distractionSeconds: number
    idleSeconds: number
    breakSeconds: number
    totalTrackedSeconds: number
    averageProductivityScore: number
}