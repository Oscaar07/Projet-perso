/// Point d'entrée de l'application Tauri FocusTown.
///
/// Initialise dans l'ordre :
/// 1. La base de données SQLite (connexion + schéma)
/// 2. La configuration du classifieur (depuis SQLite ou défaut)
/// 3. Le serveur WebSocket pour l'extension navigateur (task tokio)
/// 4. L'écoute globale clavier/souris (thread rdev)
/// 5. Les commandes Tauri exposées au frontend React

use tauri::Manager;

mod commands;
mod tracking;
mod database;
mod network;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("no app data dir");
            let db = database::db::Database::new(app_data_dir).expect("failed to init database");

            let config = db.load_classifier_config()
                .unwrap_or_else(|_| tracking::classifier::ClassifierConfig::default());
            tracking::classifier::load_config(config);

            app.manage(db);

            // Serveur WebSocket pour l'extension navigateur
            let app_handle = app.handle().clone();
            tokio::spawn(async move {
                network::start_ws_server(app_handle).await;
            });

            // Écoute globale clavier/souris (détection d'activité)
            tracking::input::start_input_listener();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::tracking::start_tracking,
            commands::database::save_event,
            commands::database::get_events,
            commands::database::get_daily_report,
            commands::simulation::save_simulation,
            commands::simulation::load_simulation,
            commands::simulation::list_saves,
            commands::simulation::delete_save,
            commands::config::get_classifier_config,
            commands::config::set_classifier_config,
            commands::config::get_extension_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
