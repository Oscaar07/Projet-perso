use rusqlite::{Connection, Result};
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        std::fs::create_dir_all(&app_data_dir).ok();
        let db_path = app_data_dir.join("focustown.db");
        let conn = Connection::open(db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.init()?;
        Ok(db)
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
        ")
    }
}