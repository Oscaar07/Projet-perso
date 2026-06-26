pub fn extract_domain(title: &str, process_name: &str) -> Option<String> {
    let lower_name = process_name.to_lowercase();
    let browser_processes = [
        "chrome.exe", "firefox.exe", "msedge.exe", "brave.exe", "opera.exe"
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

pub fn classify(process_name: &str, title: &str) -> &'static str {
    let lower_name = process_name.to_lowercase();
    let lower_title = title.to_lowercase();

    let focus_keywords = [
        "code.exe", "cursor.exe", "terminal.exe", "powershell.exe",
        "cmd.exe", "notepad++.exe", "sublime_text.exe", "vim.exe",
        "intellij", "clion.exe", "pycharm.exe", "webstorm.exe",
        "idea64.exe", "slack.exe", "teams.exe",
    ];
    if focus_keywords.iter().any(|k| lower_name.contains(k)) {
        return "focus"
    }

    let browser_keywords = ["chrome.exe", "firefox.exe", "msedge.exe", "opera.exe", "brave.exe"];
    let distraction_sites = ["youtube", "netflix", "twitch", "reddit", "twitter",
        "x.com", "instagram", "facebook", "tiktok", "9gag", "discord"];

    if browser_keywords.iter().any(|k| lower_name.contains(k)) {
        if distraction_sites.iter().any(|s| lower_title.contains(s)) {
            return "distraction"
        }
        return "focus"
    }

    if title.trim().is_empty() {
        return "idle"
    }

    "unknown"
}