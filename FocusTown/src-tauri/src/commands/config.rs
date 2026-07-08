/// Commandes Tauri pour la configuration du classifieur et l'état de
/// l'extension navigateur.
///
/// Ces commandes sont appelées depuis le frontend React (ProductivityDashboard)
/// pour :
/// - Lire/écrire la configuration focus/distraction/idle
/// - Savoir si l'extension navigateur est connectée (indicateur visuel)

use tauri::State;
use crate::database::db::Database;
use crate::tracking::classifier::{self, ClassifierConfig};
use crate::network;

#[tauri::command]
pub fn get_classifier_config() -> ClassifierConfig {
    classifier::get_config_cloned()
}

#[tauri::command]
pub fn set_classifier_config(state: State<'_, Database>, config: ClassifierConfig) -> Result<(), String> {
    let json = serde_json::to_string(&config).map_err(|e| e.to_string())?;
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO app_config (key, value) VALUES ('classifier', ?1)",
        rusqlite::params![json],
    ).map_err(|e| e.to_string())?;
    classifier::load_config(config);
    Ok(())
}

#[tauri::command]
pub fn get_extension_status() -> bool {
    network::EXTENSION_CONNECTED.load(std::sync::atomic::Ordering::SeqCst)
}
