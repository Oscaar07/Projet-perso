import { invoke } from "@tauri-apps/api/core"
import { ProductivityEvent } from "./types"

export async function saveProductivityEvent(event: ProductivityEvent): Promise<void> {
  await invoke("save_event", { event })
}

export async function loadProductivityEvents(since?: number): Promise<ProductivityEvent[]> {
  return await invoke("get_events", { since: since ?? 0 })
}

export async function loadDailyReport(date: string): Promise<{
  events: ProductivityEvent[],
  total_focus_seconds: number,
  total_distraction_seconds: number,
  total_tracked_seconds: number,
  average_score: number,
}> {
  return await invoke("get_daily_report", { date })
}
