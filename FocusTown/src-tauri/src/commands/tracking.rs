use tauri::{AppHandle, Emitter};
use std::thread;
use std::time::{Duration, Instant};
use crate::tracking::tracker::{get_active_window, get_last_input_tick};
use crate::tracking::classifier::{classify, extract_domain};

/// Intervalle entre chaque poll (5s)
const POLL_INTERVAL: Duration = Duration::from_secs(5);

/// Temps sans input avant d'être déclaré idle
const IDLE_TIMEOUT: Duration = Duration::from_secs(100);

#[tauri::command]
pub fn start_tracking(app: AppHandle) -> Result<(), String> {
    thread::spawn(move || {
        // État du thread
        let mut is_idle = false;
        let mut last_title = String::new();
        let mut last_input_tick = get_last_input_tick();
        let mut last_activity = Instant::now();

        loop {
            thread::sleep(POLL_INTERVAL);

            let now = Instant::now();
            let window = get_active_window();
            let current_input_tick = get_last_input_tick();

            // --- Détection d'input clavier/souris ---
            // Si le tick a changé depuis le dernier poll, l'utilisateur a interagi
            if current_input_tick != last_input_tick {
                last_input_tick = current_input_tick;
                last_activity = now;
            }

            let idle_duration = now.duration_since(last_activity);

            // --- État IDLE : vérifier si retour à l'activité ---
            if is_idle {
                if idle_duration < IDLE_TIMEOUT {
                    // L'utilisateur est revenu : on classifie la fenêtre active
                    is_idle = false;
                    let event_type = classify(&window.process_name, &window.title);
                    let domain = extract_domain(&window.title, &window.process_name);
                    let _ = app.emit("tracking-event", serde_json::json!({
                        "title": window.title,
                        "processName": window.process_name,
                        "eventType": event_type,
                        "domain": domain,
                        "timestamp": chrono::Utc::now().timestamp_millis(),
                    }));
                }
                continue; // On ne vérifie pas le changement de fenêtre tant qu'on est idle
            }

            // --- État ACTIF : détection changement de fenêtre ---
            if window.title != last_title && !window.title.is_empty() {
                last_title = window.title.clone();
                last_activity = now; // Un changement de fenêtre = activité

                let event_type = classify(&window.process_name, &window.title);
                let domain = extract_domain(&window.title, &window.process_name);
                let _ = app.emit("tracking-event", serde_json::json!({
                    "title": window.title,
                    "processName": window.process_name,
                    "eventType": event_type,
                    "domain": domain,
                    "timestamp": chrono::Utc::now().timestamp_millis(),
                }));
            }

            // --- Vérification passage en idle ---
            if idle_duration >= IDLE_TIMEOUT && !is_idle {
                is_idle = true;
                let _ = app.emit("tracking-event", serde_json::json!({
                    "title": window.title,
                    "processName": window.process_name,
                    "eventType": "idle",
                    "timestamp": chrono::Utc::now().timestamp_millis(),
                }));
            }
        }
    });

    Ok(())
}