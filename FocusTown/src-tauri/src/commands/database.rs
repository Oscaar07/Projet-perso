use tauri::State;
use crate::database::db::Database;
use crate::database::models::ProductivityEvent;
use crate::database::queries;
use serde::Serialize;

#[derive(Serialize)]
pub struct DailyReport {
    pub events: Vec<ProductivityEvent>,
    pub average_score: f64,
    pub total_focus_seconds: i64,
    pub total_distraction_seconds: i64,
    pub total_tracked_seconds: i64,
}

#[tauri::command]
pub fn save_event(state: State<'_, Database>, event: ProductivityEvent) -> Result<(), String> {
    queries::insert_event(&state, &event).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_events(state: State<'_, Database>, since: i64) -> Result<Vec<ProductivityEvent>, String> {
    queries::get_events_since(&state, since).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_daily_report(state: State<'_, Database>, date: String) -> Result<DailyReport, String> {
    let (events, avg, focus, distraction, total) =
        queries::get_daily_report(&state, &date).map_err(|e| e.to_string())?;
    Ok(DailyReport {
        events,
        average_score: avg,
        total_focus_seconds: focus,
        total_distraction_seconds: distraction,
        total_tracked_seconds: total,
    })
}
