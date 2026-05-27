import {getActionScores} from "../simulation/ai/debugActionScores"

type Props = {
    simulationState: any
    selectedCitizen: any
    selectedBuilding: any
    buildMode: "house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null
  }
  
  export function HUD({simulationState, selectedCitizen, selectedBuilding, buildMode}: Props) {
    const bestFriend =[...(selectedCitizen?.relationships ?? [])].sort((a:any, b:any) =>b.friendship -a.friendship)[0];
    const actionScores = selectedCitizen ? getActionScores(selectedCitizen) : [];
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
              Friends:{" "} {selectedCitizen.relationships.filter((r:any) => r.friendship > 20).length}
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
              Positive Social Memories:{" "} {selectedCitizen.memories.filter((memory:any) => memory.type === "social" && memory.value > 0).length}
            </div>
            <div>
              Negative Work Memories:{" "} {selectedCitizen.memories.filter((memory:any) => memory.type === "work" && memory.value < 0).length}
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
      </div>
    )
  }
