/// Couche d'accès à la base de données SQLite.
///
/// Gère :
/// - La création et les migrations du schéma
/// - La persistance des événements de productivité
/// - La persistance des sauvegardes de simulation
/// - La persistance de la configuration du classifieur
///
/// La connexion est partagée via un Mutex pour permettre l'accès depuis
/// les commandes Tauri (multi-thread).

use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use std::sync::Mutex;
use crate::tracking::classifier::ClassifierConfig;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    /// Ouvre (ou crée) la base de données dans le répertoire de données
    /// de l'application Tauri et initialise le schéma.
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("focustown.db");
        let conn = Connection::open(db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.init()?;
        Ok(db)
    }

    /// Charge la configuration du classifieur depuis la table app_config.
    /// Retourne la config par défaut si la clé n'existe pas ou si le JSON
    /// stocké est corrompu (un avertissement est alors émis sur stderr).
    pub fn load_classifier_config(&self) -> Result<ClassifierConfig> {
        let conn = self.conn.lock().unwrap();
        let json: String = conn.query_row(
            "SELECT value FROM app_config WHERE key = 'classifier'",
            params![],
            |row| row.get(0),
        )?;
        Ok(serde_json::from_str(&json).unwrap_or_else(|e| {
            eprintln!("[FocusTown] Corrupted classifier config, using defaults: {e}");
            ClassifierConfig::default()
        }))
    }

    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS productivity_events (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                started_at INTEGER NOT NULL,
                ended_at INTEGER NOT NULL,
                duration_seconds INTEGER NOT NULL,
                app_name TEXT,
                window_title TEXT,
                domain TEXT,
                productivity_score REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_events_started_at ON productivity_events(started_at);

            CREATE TABLE IF NOT EXISTS simulation_saves (
                name TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        ")
    }
}
