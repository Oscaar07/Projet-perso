import { useState } from "react"
import { useProductivityStore } from "../store/productivityStore"
import { getTodayProductivityReport } from "../productivity/ProductivityDailyReports"
import { getTodayKey } from "../productivity/ProductivityDailyReports"
import { buildTimeline, formatDuration, TimelineBucket } from "../productivity/ProductivityAnalytics"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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
  const todayKey = getTodayKey()
  const todayReport = getTodayProductivityReport(events)
  const timeline: TimelineBucket[] = buildTimeline(events, todayKey)
  const { summary } = todayReport

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
          📊 {summary.averageProductivityScore.toFixed(0)}%
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
        <h3 style={{ margin: 0 }}>📊 Productivity Dashboard</h3>
        <button
          onClick={() => setExpanded(false)}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ✕
        </button>
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
    </div>
  )
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