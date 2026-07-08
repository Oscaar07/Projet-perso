/// Commande Tauri de lancement du tracking de productivité.
///
/// Démarre un thread de polling qui, à intervalle régulier, inspecte la
/// fenêtre active (Windows API), détecte l'activité clavier/souris, et
/// émet des événements "tracking-event" vers le frontend React.
///
/// Deux modes de détection d'activité :
/// - `use_activity = true` → utilise le compteur rdev (clavier + souris)
/// - `use_activity = false` → utilise GetLastInputInfo (idle Windows)
///
/// Le thread est aussi responsable de détecter :
/// - Les changements de fenêtre (nouvel event)
/// - Les transitions idle → actif (retour event)
/// - Les périodes d'inactivité (idle event)

use tauri::{AppHandle, Emitter};
use std::thread;
use std::time::{Duration, Instant};
use crate::tracking::tracker::{get_active_window, get_last_input_tick};
use crate::tracking::input::get_activity_level;
use crate::tracking::classifier::{classify, extract_domain, get_config};

#[tauri::command]
pub fn start_tracking(app: AppHandle, use_activity: Option<bool>) -> Result<(), String> {
    let use_activity = use_activity.unwrap_or(false);

    thread::spawn(move || {
        let mut is_idle = false;
        let mut last_title = String::new();
        let mut last_input_tick = get_last_input_tick();
        let mut last_activity = Instant::now();

        loop {
            let config = get_config();
            let poll_interval = Duration::from_secs(config.poll_interval_secs);
            let idle_timeout = Duration::from_secs(config.idle_timeout_secs);

            thread::sleep(poll_interval);

            let now = Instant::now();
            let window = get_active_window();

            // Détection d'activité : deux méthodes selon le flag
            if use_activity {
                let activity = get_activity_level();
                if activity > 0.05 {
                    last_activity = now;
                }
            } else {
                let current_input_tick = get_last_input_tick();
                if current_input_tick != last_input_tick {
                    last_input_tick = current_input_tick;
                    last_activity = now;
                }
            }

            let idle_duration = now.duration_since(last_activity);

            // Si l'extension navigateur est connectée, on ne tracke pas
            // les navigateurs nous-mêmes (évite les doublons avec les
            // événements envoyés directement par l'extension).
            let browser_processes = [
                "chrome.exe", "firefox.exe", "msedge.exe", "brave.exe", "opera.exe",
            ];
            let is_browser = browser_processes
                .iter()
                .any(|k| window.process_name.to_lowercase().contains(k));
            let extension_connected = crate::network::EXTENSION_CONNECTED
                .load(std::sync::atomic::Ordering::SeqCst);

            if is_browser && extension_connected {
                if is_idle && idle_duration < idle_timeout {
                    is_idle = false;
                }
                continue;
            }

            // Transition retour d'idle → actif
            if is_idle {
                if idle_duration < idle_timeout {
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
                continue;
            }

            // Changement de fenêtre active → nouveau event de tracking
            if window.title != last_title && !window.title.is_empty() {
                last_title = window.title.clone();
                last_activity = now;
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

            // Détection de début d'inactivité
            if idle_duration >= idle_timeout && !is_idle {
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
