/// Écoute globale du clavier et de la souris (via la crate `rdev`).
///
/// Comptabilise les événements dans des AtomicU64 pour que le polling
/// loop puisse lire le niveau d'activité sans blocage. Les compteurs
/// sont remis à zéro après chaque lecture (swap 0).
///
/// `get_activity_level()` retourne un score normalisé entre 0.0 (idle)
/// et 1.0 (actif) basé sur le nombre d'events dans l'intervalle de
/// 5 secondes du polling loop.

use std::sync::atomic::{AtomicU64, Ordering};

static KEY_EVENTS: AtomicU64 = AtomicU64::new(0);
static MOUSE_EVENTS: AtomicU64 = AtomicU64::new(0);

pub fn start_input_listener() {
    std::thread::spawn(move || {
        let callback = move |event: rdev::Event| {
            match event.event_type {
                rdev::EventType::KeyPress(_) | rdev::EventType::KeyRelease(_) => {
                    KEY_EVENTS.fetch_add(1, Ordering::Relaxed);
                }
                rdev::EventType::ButtonPress(_)
                | rdev::EventType::ButtonRelease(_)
                | rdev::EventType::MouseMove { .. } => {
                    MOUSE_EVENTS.fetch_add(1, Ordering::Relaxed);
                }
                _ => {}
            }
        };
        if let Err(e) = rdev::listen(callback) {
            eprintln!("rdev listen error: {:?}", e);
        }
    });
}

pub fn get_activity_level() -> f64 {
    let keys = KEY_EVENTS.swap(0, Ordering::Relaxed) as f64;
    let mouse = MOUSE_EVENTS.swap(0, Ordering::Relaxed) as f64;
    let total = keys + mouse;

    (total / 10.0).clamp(0.0, 1.0)
}
