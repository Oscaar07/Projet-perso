use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductivityEvent {
    pub id: String,
    #[serde(rename = "type")]
    pub event_type: String,
    pub started_at: i64,
    pub ended_at: i64,
    pub duration_seconds: i64,
    pub app_name: Option<String>,
    pub window_title: Option<String>,
    pub domain: Option<String>,
    pub productivity_score: f64,
}

