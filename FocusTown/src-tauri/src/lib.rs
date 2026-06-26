use tauri::Manager;

mod commands;
mod tracking;
mod database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("no app data dir");
            let db = database::db::Database::new(app_data_dir).expect("failed to init database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::tracking::start_tracking,
            commands::database::save_event,
            commands::database::get_events,
            commands::database::get_daily_report,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
