/// Commandes Tauri pour la sauvegarde et le chargement des simulations.
///
/// Les sauvegardes sont stockées dans la table `simulation_saves` en SQLite,
/// sérialisées en JSON. Chaque sauvegarde a un nom unique, une date de
/// création et une date de mise à jour.
///
/// Commandes exposées :
/// - save_simulation : persist l'état courant de la simulation
/// - load_simulation : restaure un état depuis une sauvegarde
/// - list_saves : liste les sauvegardes disponibles
/// - delete_save : supprime une sauvegarde

use tauri::State;
use crate::database::db::Database;
use serde::Serialize;
use chrono::Utc;

#[derive(Serialize)]
pub struct SaveSlot {
    pub name: String,
    pub created_at: String,
}

#[tauri::command]
pub fn save_simulation(state: State<'_, Database>, name: String, data: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT OR REPLACE INTO simulation_saves (name, data, created_at, updated_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![name, data, &now, &now],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_simulation(state: State<'_, Database>, name: String) -> Result<String, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let result = conn.query_row(
        "SELECT data FROM simulation_saves WHERE name = ?1",
        rusqlite::params![name],
        |row| row.get::<_, String>(0),
    ).map_err(|e| e.to_string())?;
    Ok(result)
}

#[tauri::command]
pub fn list_saves(state: State<'_, Database>) -> Result<Vec<SaveSlot>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT name, created_at FROM simulation_saves ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let slots = stmt.query_map([], |row| {
        Ok(SaveSlot {
            name: row.get(0)?,
            created_at: row.get(1)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    Ok(slots)
}

#[tauri::command]
pub fn delete_save(state: State<'_, Database>, name: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM simulation_saves WHERE name = ?1", rusqlite::params![name])
        .map_err(|e| e.to_string())?;
    Ok(())
}
