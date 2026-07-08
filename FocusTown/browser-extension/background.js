// Service worker de l'extension navigateur FocusTown.
//
// Se connecte en WebSocket au serveur Tauri (ws://127.0.0.1:9736) pour
// envoyer l'URL de l'onglet actif à chaque changement de page ou
// d'onglet.
//
// Le Tauri backend classifie l'URL (focus/distraction) et tracke le
// temps passé. Le polling Windows est désactivé pour les navigateurs
// quand l'extension est active (EXTENSION_CONNECTED flag).
//
// La popup (popup.js) interroge ce script pour afficher le statut.

let ws = null
let reconnectTimer = null
const WS_URL = "ws://127.0.0.1:9736"

function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) return

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    console.log("[FocusTown] WebSocket connected")
    chrome.action.setBadgeText({ text: "ON" })
    chrome.action.setBadgeBackgroundColor({ color: "#00cc66" })
    if (reconnectTimer) {
      clearInterval(reconnectTimer)
      reconnectTimer = null
    }
  }

  ws.onclose = () => {
    console.log("[FocusTown] WebSocket disconnected")
    chrome.action.setBadgeText({ text: "OFF" })
    chrome.action.setBadgeBackgroundColor({ color: "#ff4444" })
    if (!reconnectTimer) {
      reconnectTimer = setInterval(connect, 3000)
    }
  }

  ws.onerror = () => {
    ws.close()
  }
}

function sendTab(tab) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  if (!tab.url) return
  if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) return
  if (tab.url.startsWith("chrome-extension://")) return

  try {
    const url = new URL(tab.url)
    ws.send(JSON.stringify({
      url: tab.url,
      domain: url.hostname,
      title: tab.title || url.hostname,
      timestamp: Date.now()
    }))
  } catch (e) {
    // Ignorer les URLs invalides (ex: pages locales)
  }
}

// Envoie l'URL à chaque changement d'onglet actif
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  sendTab(tab)
})

// Envoie l'URL à chaque changement dans l'onglet actif
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) sendTab(tab)
})

// Capture les navigations dans l'onglet courant (chrome.webNavigation
// est optionnel dans le manifest pour certains navigateurs)
chrome.webNavigation?.onCommitted?.addListener((details) => {
  if (details.frameId !== 0) return
  chrome.tabs.get(details.tabId, (tab) => {
    if (chrome.runtime.lastError) return
    sendTab(tab)
  })
})

// Répond aux requêtes de statut depuis la popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "getStatus") {
    sendResponse({ connected: ws?.readyState === WebSocket.OPEN })
  }
})

connect()
