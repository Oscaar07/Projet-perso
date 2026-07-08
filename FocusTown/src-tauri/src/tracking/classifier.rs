/// Classification et configuration des comportements de productivité.
///
/// Ce module détermine si une fenêtre active ou un onglet navigateur
/// correspond à du "focus", de la "distraction", de l'"idle" ou "unknown".
///
/// Deux sources de données sont classifiées :
/// - Le polling Windows (`tracker.rs`) : process_name + titre de fenêtre
/// - L'extension navigateur (`network/mod.rs`) : domaine + titre de page
///
/// La config (focus_processes, distraction_domains, etc.) est persistée
/// en SQLite (table app_config) et modifiable depuis l'UI Settings.

use std::sync::OnceLock;
use serde::{Deserialize, Serialize};

/// Configuration du classifieur, modifiable par l'utilisateur.
/// Persistée dans la table app_config de SQLite.
#[derive(Deserialize, Serialize, Clone)]
pub struct ClassifierConfig {
    /// Processus Windows considérés comme focus (ex: code.exe)
    pub focus_processes: Vec<String>,
    /// Domaines classés comme distraction (ex: youtube.com)
    pub distraction_domains: Vec<String>,
    /// Domaines classés comme focus (ex: github.com)
    pub focus_domains: Vec<String>,
    /// Secondes d'inactivité avant d'être considéré idle
    pub idle_timeout_secs: u64,
    /// Intervalle de polling en secondes
    pub poll_interval_secs: u64,
}

impl Default for ClassifierConfig {
    fn default() -> Self {
        Self {
            focus_processes: vec![
                "code.exe".into(), "cursor.exe".into(), "terminal.exe".into(),
                "powershell.exe".into(), "cmd.exe".into(), "notepad++.exe".into(),
                "sublime_text.exe".into(), "vim.exe".into(), "intellij".into(),
                "clion.exe".into(), "pycharm.exe".into(), "webstorm.exe".into(),
                "idea64.exe".into(), "slack.exe".into(), "teams.exe".into(),
            ],
            distraction_domains: vec![
                "youtube".into(), "netflix".into(), "twitch".into(), "reddit".into(),
                "twitter".into(), "x.com".into(), "instagram".into(), "facebook".into(),
                "tiktok".into(), "9gag".into(), "discord".into(),
            ],
            focus_domains: vec![
                "github.com".into(), "gitlab.com".into(), "bitbucket.org".into(),
                "docs.google.com".into(), "linear.app".into(), "notion.so".into(),
                "stackoverflow.com".into(), "developer.mozilla.org".into(),
            ],
            idle_timeout_secs: 100,
            poll_interval_secs: 5,
        }
    }
}

/// Stockage global de la config (initialisée au démarrage depuis SQLite).
/// OnceLock garantit une initialisation unique thread-safe.
static CONFIG: OnceLock<ClassifierConfig> = OnceLock::new();

pub fn load_config(config: ClassifierConfig) {
    let _ = CONFIG.set(config);
}

pub fn get_config_cloned() -> ClassifierConfig {
    get_config().clone()
}

pub fn get_config() -> &'static ClassifierConfig {
    if CONFIG.get().is_none() {
        CONFIG.set(ClassifierConfig::default()).ok();
    }
    CONFIG.get().unwrap()
}

/// Extrait le domaine depuis le titre d'une fenêtre navigateur.
///
/// Exemple : "GitHub - Google Chrome" → Some("github.com")
/// Retourne None si le process n'est pas un navigateur reconnu.
pub fn extract_domain(title: &str, process_name: &str) -> Option<String> {
    let lower_name = process_name.to_lowercase();
    let browser_processes = [
        "chrome.exe", "firefox.exe", "msedge.exe", "brave.exe", "opera.exe",
    ];
    if !browser_processes.iter().any(|k| lower_name.contains(k)) {
        return None;
    }

    let suffixes = [
        " - Google Chrome", " — Mozilla Firefox",
        " - Microsoft Edge", " - Brave", " - Opera",
    ];
    for suffix in &suffixes {
        if title.ends_with(suffix) {
            let before = &title[..title.len() - suffix.len()];
            let trimmed = before.trim();
            if let Some(sep) = trimmed.rfind(" - ") {
                return Some(trimmed[sep + 3..].to_string());
            }
            return Some(trimmed.to_string());
        }
    }
    None
}

/// Classe une fenêtre/onglet comme focus, distraction, idle ou unknown.
///
/// Ordre de priorité :
/// 1. Focus process (IDE, terminal, etc.) → focus
/// 2. Domaine dans distraction_domains → distraction
/// 3. Domaine dans focus_domains → focus
/// 4. Navigateur avec titre contenant un domaine distraction → distraction
/// 5. Navigateur sans distraction → focus (navigation = focus par défaut)
/// 6. Titre vide → idle
/// 7. Défaut → unknown
pub fn classify(process_name: &str, title: &str) -> &'static str {
    let config = get_config();
    let lower_name = process_name.to_lowercase();
    let lower_title = title.to_lowercase();

    if config.focus_processes.iter().any(|k| lower_name.contains(k)) {
        return "focus";
    }

    if config.distraction_domains.iter().any(|d| lower_name.contains(d)) {
        return "distraction";
    }
    if config.focus_domains.iter().any(|d| lower_name.contains(d)) {
        return "focus";
    }

    let browser_keywords = ["chrome.exe", "firefox.exe", "msedge.exe", "opera.exe", "brave.exe"];
    if browser_keywords.iter().any(|k| lower_name.contains(k)) {
        if config.distraction_domains.iter().any(|s| lower_title.contains(s)) {
            return "distraction";
        }
        return "focus";
    }

    if title.trim().is_empty() {
        return "idle";
    }

    "unknown"
}
