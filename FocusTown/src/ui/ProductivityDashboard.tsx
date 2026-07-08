import { useState, useEffect } from "react"
import { useProductivityStore } from "../store/productivityStore"
import { getTodayProductivityReport } from "../productivity/ProductivityDailyReports"
import { getTodayKey } from "../productivity/ProductivityDailyReports"
import { buildTimeline, formatDuration, TimelineBucket } from "../productivity/ProductivityAnalytics"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { invoke } from "@tauri-apps/api/core"

type ClassifierConfig = {
  focus_processes: string[]
  distraction_domains: string[]
  focus_domains: string[]
  idle_timeout_secs: number
  poll_interval_secs: number
}

const COLORS: Record<string, string> = {
  focus: "#00cc66",
  distraction: "#ff4444",
  idle: "#888888",
  break: "#66aaff",
  unknown: "#ff9900",
}

export function ProductivityDashboard() {
  const { events } = useProductivityStore()
  const [expanded, setExpanded] = useState(false)
  const [extConnected, setExtConnected] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [config, setConfig] = useState<ClassifierConfig | null>(null)
  const todayKey = getTodayKey()
  const todayReport = getTodayProductivityReport(events)
  const timeline: TimelineBucket[] = buildTimeline(events, todayKey)
  const { summary } = todayReport

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const ok = await invoke<boolean>("get_extension_status")
        setExtConnected(ok)
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(poll)
  }, [])

  async function openSettings() {
    try {
      const cfg = await invoke<ClassifierConfig>("get_classifier_config")
      setConfig(cfg)
      setShowSettings(true)
    } catch { /* ignore */ }
  }

  async function saveSettings() {
    if (!config) return
    try {
      await invoke("set_classifier_config", { config })
      setShowSettings(false)
    } catch { /* ignore */ }
  }

  // --- Mode compact (4 lignes, clic pour expand) ---
  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          width: 260,
          background: "#111",
          color: "white",
          padding: "12px 16px",
          borderRadius: 12,
          fontFamily: "Arial",
          cursor: "pointer",
          border: "1px solid #333",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
          {summary.averageProductivityScore.toFixed(0)}%
        </div>
        <div style={{ fontSize: 13, color: "#ccc" }}>
          Focus {formatDuration(summary.focusSeconds)}
          {" · "}Dist {formatDuration(summary.distractionSeconds)}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
          {todayReport.events.length} events — ▸ Détail
        </div>
      </div>
    )
  }

  // --- Mode expanded (dashboard complet) ---
  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        width: 520,
        maxHeight: "70vh",
        background: "#111",
        color: "white",
        padding: 16,
        borderRadius: 12,
        fontFamily: "Arial",
        overflow: "auto",
        border: "1px solid #333",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Productivity Dashboard</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              display: "inline-block",
              width: 10, height: 10,
              borderRadius: "50%",
              background: extConnected ? "#00cc66" : "#ff4444",
              cursor: "help",
            }}
            title={extConnected ? "Extension connectée" : "Extension déconnectée"}
          />
          <button
            onClick={openSettings}
            style={{
              background: "none", border: "none",
              color: "#888", cursor: "pointer", fontSize: 14,
            }}
          >
            Settings
          </button>
          <button
            onClick={() => setExpanded(false)}
            style={{
              background: "none", border: "none",
              color: "#888", cursor: "pointer", fontSize: 18,
            }}
          >
            X
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <StatCard label="Score" value={`${summary.averageProductivityScore.toFixed(0)}%`} color="#00cc66" />
        <StatCard label="Focus" value={formatDuration(summary.focusSeconds)} color="#00cc66" />
        <StatCard label="Distraction" value={formatDuration(summary.distractionSeconds)} color="#ff4444" />
        <StatCard label="Idle" value={formatDuration(summary.idleSeconds)} color="#888" />
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#ccc" }}>
          Timeline du jour ({todayKey})
        </h4>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={timeline} stackOffset="sign">
            <XAxis
              dataKey="label"
              tick={{ fill: "#888", fontSize: 10 }}
              interval={3}
            />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#222",
                border: "1px solid #444",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="focus" stackId="a" fill={COLORS.focus} />
            <Bar dataKey="distraction" stackId="a" fill={COLORS.distraction} />
            <Bar dataKey="break" stackId="a" fill={COLORS.break} />
            <Bar dataKey="idle" stackId="a" fill={COLORS.idle} />
            <Bar dataKey="unknown" stackId="a" fill={COLORS.unknown} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Event list */}
      <div>
        <h4 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#ccc" }}>
          Journal des events
        </h4>
        {todayReport.events.length === 0 ? (
          <div style={{ color: "#666", fontSize: 13 }}>
            Aucun event aujourd'hui
          </div>
        ) : (
          todayReport.events
            .slice()
            .reverse()
            .map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  fontSize: 13,
                  borderBottom: "1px solid #222",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: COLORS[event.type] || COLORS.unknown,
                      marginRight: 6,
                    }}
                  />
                  <strong>{event.type}</strong>
                  {event.appName && ` — ${event.appName}`}
                  {event.domain && ` (${event.domain})`}
                </span>
                <span style={{ color: "#888" }}>
                  {formatDuration(event.durationSeconds)}
                </span>
              </div>
            ))
        )}
      </div>

      {/* Settings modal */}
      {showSettings && config && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              background: "#1a1a1a", color: "white",
              padding: 20, borderRadius: 12, minWidth: 400, maxWidth: 500,
              fontFamily: "Arial", fontSize: 13,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px 0" }}>Classifier Settings</h3>

            <label style={{ display: "block", marginBottom: 8 }}>
              Poll interval (secs):
              <input type="number" value={config.poll_interval_secs}
                onChange={(e) => setConfig({...config, poll_interval_secs: Number(e.target.value)})}
                style={inputStyle} />
            </label>
            <label style={{ display: "block", marginBottom: 8 }}>
              Idle timeout (secs):
              <input type="number" value={config.idle_timeout_secs}
                onChange={(e) => setConfig({...config, idle_timeout_secs: Number(e.target.value)})}
                style={inputStyle} />
            </label>

            <h4 style={{ margin: "12px 0 4px" }}>Focus processes</h4>
            <textarea rows={3} value={config.focus_processes.join("\n")}
              onChange={(e) => setConfig({...config, focus_processes: e.target.value.split("\n").filter(Boolean)})}
              style={{...inputStyle, width: "100%", resize: "vertical" }} />

            <h4 style={{ margin: "12px 0 4px" }}>Distraction domains</h4>
            <textarea rows={3} value={config.distraction_domains.join("\n")}
              onChange={(e) => setConfig({...config, distraction_domains: e.target.value.split("\n").filter(Boolean)})}
              style={{...inputStyle, width: "100%", resize: "vertical" }} />

            <h4 style={{ margin: "12px 0 4px" }}>Focus domains</h4>
            <textarea rows={3} value={config.focus_domains.join("\n")}
              onChange={(e) => setConfig({...config, focus_domains: e.target.value.split("\n").filter(Boolean)})}
              style={{...inputStyle, width: "100%", resize: "vertical" }} />

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSettings(false)}
                style={{ background: "#333", color: "white", border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={saveSettings}
                style={{ background: "#00cc66", color: "white", border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: "#111", color: "white", border: "1px solid #444",
  borderRadius: 4, padding: "4px 8px", fontSize: 12, marginLeft: 8,
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#1a1a1a",
        borderRadius: 8,
        padding: "8px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
    </div>
  )
}