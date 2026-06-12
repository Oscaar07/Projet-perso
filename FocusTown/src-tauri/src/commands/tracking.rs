use tauri::{AppHandle, Emitter};
use std::thread;
use std::time::Duration;
use crate::tracking::tracker::get_active_window;
use crate::tracking::classifier::classify;

#[tauri::command]
pub fn start_tracking(app: AppHandle) -> Result<(), String> {
    thread::spawn(move || {
        let mut last_title = String::new();

        loop {
            thread::sleep(Duration::from_secs(5));

            let window = get_active_window();
            if window.title != last_title && !window.title.is_empty() {
                last_title = window.title.clone();

                let event_type = classify(&window.process_name, &window.title);

                let _ = app.emit("tracking-event", serde_json::json!({
                    "title": window.title,
                    "processName": window.process_name,
                    "eventType": event_type,
                    "timestamp": chrono::Utc::now().timestamp_millis(),
                }));
            }
        }
    });

    Ok(())
}