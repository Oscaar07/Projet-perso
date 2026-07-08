const dot = document.getElementById("dot")
const statusText = document.getElementById("statusText")
const tabTitle = document.getElementById("tabTitle")
const tabDomain = document.getElementById("tabDomain")

// Maintient une connexion runtime avec le service worker (nécessaire pour
// que le popup puisse communiquer avec le background même après fermeture)
chrome.runtime.connect({ name: "popup" })

// Affiche les infos de l'onglet courant
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0]
  if (tab) {
    tabTitle.textContent = tab.title || "(no title)"
    tabDomain.textContent = tab.url ? new URL(tab.url).hostname : "(no url)"
  }
})

function updateStatus(connected) {
  dot.className = "dot " + (connected ? "on" : "off")
  statusText.textContent = connected ? "Connected" : "Disconnected"
}

// Interroge le background toutes les 2s pour connaître le statut WebSocket
setInterval(() => {
  chrome.runtime.sendMessage({ type: "getStatus" }, (response) => {
    updateStatus(response?.connected || false)
  })
}, 2000)
