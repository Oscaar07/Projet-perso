import {getActionScores} from "../simulation/ai/debugActionScores"
import { useSimulationStore } from "../store/simulationStore"
import { useUIStore } from "../store/uiStore"
import { useProductivityStore } from "../store/productivityStore"
import { Relationship } from "../simulation/entities/Citizen"
import { Memory } from "../simulation/ai/Memory"

  export function HUD() {
    // Debug view: surfaces the simulation state that matters most to gameplay balancing.
    const simulationState = useSimulationStore()
    const { selectedCitizen, selectedBuilding, buildMode } = useUIStore()
    const bestFriend = selectedCitizen ? [...(selectedCitizen.relationships 
      ?? [])].sort((a, b) => b.friendship - a.friendship)[0] : null
    const actionScores = selectedCitizen ? getActionScores(selectedCitizen) : [];
    const summary = useProductivityStore((s) => s.summary)
    const focusStreak = summary.focusSeconds > 0
      ? Math.floor(summary.focusSeconds / 3600) + "h " +
        Math.floor((summary.focusSeconds % 3600) / 60) + "min"
      : "0min"
    
    return (
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
  
          width: 250,
  
          background: "#111",
          color: "white",
  
          padding: "16px",
          borderRadius: "12px",
  
          fontFamily: "Arial",
        }}
      >
        <h2>FocusTown</h2>
  
        <div>
          Day: {simulationState.day}
        </div>
  
        <div>
          Time:{" "}
          {simulationState.time.toFixed(2)}
        </div>
        <div>
          Population: {simulationState.citizens.length}
        </div>
        <div>
          Residential Demand: {(simulationState.residentialDemand ?? 0).toFixed(0)}
        </div>
        <div>
          City Money: {(simulationState.cityMoney ?? 0).toFixed(0)}
        </div>
        <hr />
        <h3>Build Mode :  {" "}{buildMode ?? "None"}</h3>

        <hr />
        
        <h3>Selected Citizen</h3>
        
        {selectedCitizen ? (
          <div>
            <div>
              Name: {" "} {selectedCitizen.name}
            </div>  
            <div>
              Age: {" "} {selectedCitizen.age} ticks ({selectedCitizen.lifeStage})
            </div>
            <div>
              Energy: {" "} {selectedCitizen.energy.toFixed(0)}
            </div>
            <div>
              Hunger: {" "} {selectedCitizen.hunger.toFixed(0)}
            </div>
            <div>
              Mood: {" "} {selectedCitizen.mood.toFixed(0)}
            </div>
            <div>
              Money: {" "} {selectedCitizen.money.toFixed(0)}
            </div>
            <div>
              Diligence:{" "} {selectedCitizen.personality.diligence.toFixed(2)}
            </div>
            <div>
              Laziness:{" "} {selectedCitizen.personality.laziness.toFixed(2)}
            </div>
            <div>
              Sociability:{" "} {selectedCitizen.personality.sociability.toFixed(2)}
            </div>
            <div>
              Friends:{" "} {selectedCitizen.relationships.filter((r: Relationship) => r.friendship > 20).length}
            </div>
            <div>
              Job:{" "} {selectedCitizen.job}
            </div>
            <div>
              Time of the day:{" "} {simulationState.timeOfDay.charAt(0).toUpperCase() + simulationState.timeOfDay.slice(1)}
            </div>
            <div>
              Weather:{" "} {simulationState.weather.charAt(0).toUpperCase() + simulationState.weather.slice(1)}
            </div>
            <div>
              Stress:{" "} {selectedCitizen.stress.toFixed(0)}
            </div>
            <div>
              Motivation:{" "} {selectedCitizen.motivation.toFixed(0)}
            </div>
            <div>
              Hygiene:{" "} {selectedCitizen.hygiene.toFixed(0)}
            </div>
            <div>
              Fun:{" "} {selectedCitizen.fun.toFixed(0)}
            </div>
            <div>
              Health:{" "} {selectedCitizen.health.toFixed(0)}
            </div>
            <div>
              Is Sick:{" "} {selectedCitizen.isSick ? "Yes" : "No"}
            </div>
            <div>
              Current Action:{" "} {selectedCitizen.currentAction}
            </div>
            <div>
              Chronotype:{" "} {selectedCitizen.chronotype.charAt(0).toUpperCase() + selectedCitizen.chronotype.slice(1)}
            </div>
            <div>
              Work Desire:{" "} {selectedCitizen.workDesire.toFixed(0)}
            </div>
            <div>
              Sleep Desire:{" "} {selectedCitizen.sleepDesire.toFixed(0)}
            </div>
            <div>
              Memories:{" "} {selectedCitizen.memories.length}
            </div>
            <div>
              Positive Social Memories:{" "} {selectedCitizen.memories.filter((memory: Memory) => memory.type === "social" && memory.value > 0).length}
            </div>
            <div>
              Negative Work Memories:{" "} {selectedCitizen.memories.filter((memory: Memory) => memory.type === "work" && memory.value < 0).length}
            </div>
            <div>
              Procrastination:{" "} {selectedCitizen.procrastination.toFixed(0)}
            </div>
            <div>
              Burnout:{" "} {selectedCitizen.burnout.toFixed(0)}
            </div>
            <div>
              Best Friend:{" "} {bestFriend?.citizenId ?? "None"}
            </div>
            <div>
              Discipline:{" "} {selectedCitizen.discipline.toFixed(0)}
            </div>
            <div>
              Work Habit:{" "} {selectedCitizen.habits.work.toFixed(0)}
            </div>
            <div>
              Relax Habit:{" "} {selectedCitizen.habits.relax.toFixed(0)}
            </div>
            <div>
              Emotion: {" "} {selectedCitizen.emotionalState}
            </div>

            <div>
              Anxiety: {" "} {selectedCitizen.anxiety.toFixed(0)}
            </div>

            <div>
              Confidence: {" "} {selectedCitizen.confidence.toFixed(0)}
            </div>

            <div>
              Perfectionism: {" "} {selectedCitizen.perfectionism.toFixed(0)}
            </div>
            <div>
              Action Scores:
              {actionScores.map((score, index) => (
                <div key={index}>
                  {score.type}: {score.score.toFixed(2)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            No citizen selected
          </div>
          
        )}

        <hr />
        <h3>Recent Deaths</h3>
        {simulationState.recentDeaths?.length > 0 ? (
          simulationState.recentDeaths.slice(0, 5).map((d, i) => (
            <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
              {d.name} ({d.job}) — {d.cause} at day {d.day}
            </div>
          ))
        ) : (
          <div style={{ fontSize: 12 }}>None</div>
        )}

        {simulationState.activeEvent && (
          <div style={{
            background: "#2a2a2a",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "10px",
            border: "2px solid #ff8800"
          }}>
            <h3 style={{ margin: 0, color: "#ffaa00" }}>
              {simulationState.activeEvent.icon} {simulationState.activeEvent.title}
            </h3>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {simulationState.activeEvent.description}
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
              {simulationState.activeEvent.remainingTicks} ticks remaining
            </div>
          </div>
        )}

        <hr />
            <h3 style={{color: "white"}}> Selected Building</h3>

            {selectedBuilding ? (
              <div style={{color: "white"}}>
                <div>
                  Type:{" "} {selectedBuilding.type}
                </div>
                <div>
                  Comfort:{" "} {selectedBuilding.comfort.toFixed(0)}
                </div>
                <div>
                  Cleanliness:{" "} {selectedBuilding.cleanliness.toFixed(0)}
                </div>
                <div>
                  Capacity:{" "} {selectedBuilding.capacity.toFixed(0)}
                </div>
              </div>
            ) : (
              <div style={{color: "white"}}>No building selected</div>
            )}

        <hr/>
        <h3>Productivity</h3>
        <div>
          Focus:{" "} {simulationState.productivitySummary?.focusSeconds ?? 0} seconds
        </div>
        <div>
          Distraction:{" "} {simulationState.productivitySummary?.distractionSeconds ?? 0} seconds
        </div>
        <div>
          Score:{" "} {(simulationState.productivitySummary?.averageProductivityScore ?? 0).toFixed(0)}
        </div>
        {/* Per-tick impact confirms that productivity data is actively affecting the city. */}
        <h3>Productivity Impact</h3>
        <div>
          Money / tick: {(simulationState.productivityImpact?.cityMoneyDelta ?? 0).toFixed(2)}
        </div>

        <div>
          Mood / tick: {(simulationState.productivityImpact?.moodDelta ?? 0).toFixed(2)}
        </div>

        <div>
          Motivation / tick: {(simulationState.productivityImpact?.motivationDelta ?? 0).toFixed(2)}
        </div>

        <div>
          Stress / tick: {(simulationState.productivityImpact?.stressDelta ?? 0).toFixed(2)}
        </div>

        <div>
          Burnout / tick: {(simulationState.productivityImpact?.burnoutDelta ?? 0).toFixed(2)}
        </div>

        <div style={{
          marginTop: 12, padding: "8px 12px",
          background: "rgba(0,0,0,0.5)", borderRadius: 6, fontSize: 12,
          fontFamily: "monospace"
        }}>
          <div>Focus today: {focusStreak}</div>
          <div>Score: {summary.averageProductivityScore.toFixed(0)}%</div>
          <div>City impact: +{(summary.averageProductivityScore / 10).toFixed(0)}% economy</div>
        </div>
      </div>
    )
  }
