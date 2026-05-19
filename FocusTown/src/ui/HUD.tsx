type Props = {
    simulationState: any
    selectedCitizen: any
  }
  
  export function HUD({
    simulationState,
    selectedCitizen,
  }: Props) {
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
  
        <hr />
        
        <h3>Selected Citizens</h3>

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
          </div>
        ) : (
          <div>
            No citizen selected
          </div>
        )}
        
        {simulationState.citizens.map(
          (citizen: any) => (
            <div
              key={citizen.id}
              style={{
                marginBottom: "16px",
              }}
            >
              <strong>
                {citizen.name}
              </strong>
  
              <div>
                Energy:{" "}
                {citizen.energy.toFixed(0)}
              </div>
  
              <div>
                Hunger:{" "}
                {citizen.hunger.toFixed(0)}
              </div>
  
              <div>
                Mood:{" "}
                {citizen.mood.toFixed(0)}
              </div>
  
              <div>
                Money:{" "}
                {citizen.money.toFixed(0)}
              </div>
            </div>
          )
        )}
      </div>
    )
  }