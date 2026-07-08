/// Serveur WebSocket pour l'extension navigateur FocusTown.
///
/// L'extension se connecte à ws://127.0.0.1:9736 pour envoyer les URL
/// des onglets actifs. Ce serveur reçoit les messages, les classifie
/// (focus/distraction/idle) et les forwarde comme événements Tauri
/// "tracking-event", au même format que le polling Windows.
///
/// Le flag atomique EXTENSION_CONNECTED est utilisé par le polling loop
/// (commands/tracking.rs) pour skip les navigateurs quand l'extension
/// est active (évite les doublons de tracking).

use std::net::SocketAddr;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::StreamExt;
use serde::Deserialize;
use tauri::{AppHandle, Emitter};
use crate::tracking::classifier::classify;

/// Flag lu par le polling loop pour savoir si l'extension est connectée.
/// Vrai dès qu'une connexion WebSocket est acceptée, faux à la déconnexion.
pub static EXTENSION_CONNECTED: AtomicBool = AtomicBool::new(false);

#[derive(Deserialize)]
struct BrowserTabEvent {
    domain: String,
    title: String,
    timestamp: i64,
}

pub async fn start_ws_server(app: AppHandle) {
    let addr: SocketAddr = "127.0.0.1:9736".parse().unwrap();
    let listener = TcpListener::bind(addr).await.expect("WS bind failed");

    // Boucle principale : accepte les connexions entrantes une par une.
    // Chaque connexion est traitée dans une task tokio dédiée.
    loop {
        let (stream, _) = listener.accept().await.unwrap();
        let app = app.clone();
        tokio::spawn(async move {
            EXTENSION_CONNECTED.store(true, Ordering::SeqCst);

            // Upgrade HTTP → WebSocket
            let ws_stream = match accept_async(stream).await {
                Ok(ws) => ws,
                Err(_) => return,
            };

            let (_, mut read) = ws_stream.split();

            // Lecture des messages texte au fil de l'eau
            while let Some(msg) = read.next().await {
                let msg = match msg {
                    Ok(m) if m.is_text() => m,
                    _ => continue,
                };

                let tab: BrowserTabEvent = match serde_json::from_str(msg.to_text().unwrap()) {
                    Ok(t) => t,
                    Err(_) => continue,
                };

                let event_type = classify(&tab.domain, &tab.title);

                let _ = app.emit("tracking-event", serde_json::json!({
                    "title": tab.title,
                    "processName": tab.domain,
                    "eventType": event_type,
                    "domain": tab.domain,
                    "timestamp": tab.timestamp,
                }));
            }

            // Déconnexion : le polling loop reprend la main pour ce navigateur
            EXTENSION_CONNECTED.store(false, Ordering::SeqCst);
        });
    }
}
