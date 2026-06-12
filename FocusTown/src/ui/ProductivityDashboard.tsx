import { getTodayProductivityReport } from "../productivity/ProductivityDailyReports"
import { useProductivityStore } from "../store/productivityStore"



export function ProductivityDashboard() {
    const {events} = useProductivityStore()
    const todayReport = getTodayProductivityReport(events)
    return (
        <div
        style={{
            position: "fixed",
            left: 20,
            bottom: 20,
            width: 360,
            maxHeight: 300,
            overflow: "auto",
            background: "#111",
            color: "white",
            padding: "16px",
            borderRadius: "12px",
            fontFamily: "Arial",
        }}
        >
        <h3>Productivity Dashboard</h3>

        <div>Focus: {todayReport.summary.focusSeconds}s</div>
        <div>Distraction: {todayReport.summary.distractionSeconds}s</div>
        <div>Total: {todayReport.summary.totalTrackedSeconds}s</div>
        <div>Score: {todayReport.summary.averageProductivityScore.toFixed(0)}</div>

        <hr />

        {todayReport.events.length === 0 ? (
            <div>No productivity events yet</div>
        ) : (
            todayReport.events
            .slice()
            .reverse()
            .map((event) => (
                <div key={event.id}>
                <strong>{event.type}</strong>{" "}
                {event.durationSeconds}s - score {event.productivityScore}
                </div>
            ))
        )}
        </div>
    )
}