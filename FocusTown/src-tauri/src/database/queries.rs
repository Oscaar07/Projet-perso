use crate::database::models::ProductivityEvent;
use crate::database::db::Database;
use rusqlite::params;
use chrono::NaiveDate;

pub fn insert_event(db: &Database, event: &ProductivityEvent) -> rusqlite::Result<()> {
    let conn = db.conn.lock().unwrap();
    conn.execute(
        "INSERT OR REPLACE INTO productivity_events (id, type, started_at, ended_at, duration_seconds, app_name, window_title, domain, productivity_score)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![event.id, event.event_type, event.started_at, event.ended_at, event.duration_seconds, event.app_name, event.window_title, event.domain, event.productivity_score],
    )?;
    Ok(())
}

pub fn get_events_since(db: &Database, since: i64) -> rusqlite::Result<Vec<ProductivityEvent>> {
    let conn = db.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, type, started_at, ended_at, duration_seconds, app_name, window_title, domain, productivity_score
         FROM productivity_events WHERE started_at >= ?1 ORDER BY started_at DESC"
    )?;
    let events = stmt.query_map(params![since], |row| {
        Ok(ProductivityEvent {
            id: row.get(0)?,
            event_type: row.get(1)?,
            started_at: row.get(2)?,
            ended_at: row.get(3)?,
            duration_seconds: row.get(4)?,
            app_name: row.get(5)?,
            window_title: row.get(6)?,
            domain: row.get(7)?,
            productivity_score: row.get(8)?,
        })
    })?.collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(events)
}

pub fn get_daily_report(db: &Database, date: &str) -> rusqlite::Result<(Vec<ProductivityEvent>, f64, i64, i64, i64)> {
    let parsed = NaiveDate::parse_from_str(date, "%Y-%m-%d")
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let day_start = parsed.and_hms_opt(0, 0, 0)
        .unwrap()
        .and_utc()
        .timestamp_millis();
    let day_end = day_start + 86_400_000;

    let conn = db.conn.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT id, type, started_at, ended_at, duration_seconds, app_name, window_title, domain, productivity_score
         FROM productivity_events WHERE started_at >= ?1 AND started_at < ?2 ORDER BY started_at DESC"
    )?;

    let events = stmt.query_map(params![day_start, day_end], |row| {
        Ok(ProductivityEvent {
            id: row.get(0)?,
            event_type: row.get(1)?,
            started_at: row.get(2)?,
            ended_at: row.get(3)?,
            duration_seconds: row.get(4)?,
            app_name: row.get(5)?,
            window_title: row.get(6)?,
            domain: row.get(7)?,
            productivity_score: row.get(8)?,
        })
    })?.collect::<rusqlite::Result<Vec<_>>>()?;

    let mut total_focus: i64 = 0;
    let mut total_distraction: i64 = 0;
    let mut total_tracked: i64 = 0;
    let mut score_sum: f64 = 0.0;

    for e in &events {
        total_tracked += e.duration_seconds;
        score_sum += e.productivity_score;
        if e.event_type == "focus" {
            total_focus += e.duration_seconds;
        } else if e.event_type == "distraction" {
            total_distraction += e.duration_seconds;
        }
    }

    let average_score = if events.is_empty() { 0.0 } else { score_sum / events.len() as f64 };

    Ok((events, average_score, total_focus, total_distraction, total_tracked))
}
