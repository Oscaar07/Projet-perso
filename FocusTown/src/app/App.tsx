import { useEffect, useRef, useState } from "react"
import { Application } from "pixi.js"
import { Citizen } from "../simulation/entities/Citizen"
import { Building } from "../simulation/entities/Building"
import { Tile } from "../simulation/world/Tiles"
import { SimulationEngine } from "../simulation/engine/SimulationEngine"
import { CityScene } from "../rendering/scenes/CityScene"
import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "../simulation/config/worldConfig"
import { HUD } from "../ui/HUD"
import { Weather } from "../simulation/world/Weather"

const engine = new SimulationEngine()

function App() {
  const [simulationState, setSimulationState] = useState<{
    tick: number
    citizens: Citizen[]
    buildings: Building[]
    tiles: Tile[]
    time: number
    day: number
    timeOfDay: string
    weather: Weather
    cityMoney?: number
    residentialDemand?: number
  }>({
    tick: 0,
    citizens: [],
    buildings: [],
    tiles: [],
    time: 8,
    day: 1,
    timeOfDay: "morning",
    weather: "sunny" as Weather,
  })

  const appRef = useRef<Application | null>(null)
  const citySceneRef = useRef<CityScene | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const [selectedCitizen, setSelectedCitizen] = useState<any>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null)


  const [buildMode, setBuildMode] = useState<"house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null>(null)
  const buildModeRef = useRef<"house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null>(null)

  useEffect(() => {
    buildModeRef.current = buildMode
    citySceneRef.current?.setBuildMode(buildMode)
  }, [buildMode])

  useEffect(() => {
    const interval = setInterval(() => {
      const state = engine.tick()

      setSimulationState(state)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (initializedRef.current) return

    initializedRef.current = true

    async function initPixi() {
      const app = new Application()

      await app.init({
        width: WORLD_WIDTH * TILE_SIZE,
        height: WORLD_HEIGHT * TILE_SIZE,
        backgroundColor: 0x222222,
      })

      appRef.current = app


      citySceneRef.current = new CityScene(app,

            (citizen) => {setSelectedCitizen(citizen)},

            (building) => {setSelectedBuilding(building)},

            (x, y) => {const currentBuildMode =buildModeRef.current
              if (!currentBuildMode)return

              if (currentBuildMode === "road") {
                engine.addRoad(x,y)
              } else if (currentBuildMode === "residential") {
                engine.addZone("residential",x,y)
              } else if (currentBuildMode === "commercial") {
                engine.addZone("commercial",x,y)
              } else {
                engine.addBuilding(currentBuildMode,x,y)
              }

              if (currentBuildMode !== "road") {
                setBuildMode(null)
              }
              setSimulationState(engine.getState())
            }
        )

      containerRef.current?.appendChild(app.canvas)
    }

    initPixi()

    return () => {
      appRef.current?.destroy()

      containerRef.current?.replaceChildren()
    }
  }, [])

  useEffect(() => {
    citySceneRef.current?.render(
      simulationState.citizens,
      simulationState.buildings,
      simulationState.tiles,
      simulationState.timeOfDay,
      simulationState.weather,
      selectedBuilding?.id,
      selectedCitizen?.id,
      buildMode
    )
  }, [simulationState])

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (!citySceneRef.current) return
  
      const speed = 20
  
      if (event.key === "ArrowUp") {
        citySceneRef.current.moveCamera(0,speed);
      }
  
      if (event.key === "ArrowDown") {
        citySceneRef.current.moveCamera(0, -speed);
      }
  
      if (event.key === "ArrowLeft") {
        citySceneRef.current.moveCamera(speed, 0);
      }
  
      if (event.key === "ArrowRight") {
        citySceneRef.current.moveCamera(-speed, 0);
      }
    }
  
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (!citySceneRef.current) return

      event.preventDefault()

      const delta = event.deltaY > 0 ? -0.1 : 0.1;

      citySceneRef.current.setZoom(Math.max(0.5,Math.min(3,citySceneRef.current.getZoom()  + delta)));
    }
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  return (
    <>
      <div
        style={{display: "flex", gap: "10px", marginBottom: "10px",}}>
        <button onClick={() => setBuildMode("house")}>
          Build House
        </button>

        <button onClick={() =>setBuildMode("office")}>
          Build Office
        </button>

        <button onClick={() => setBuildMode("restaurant")}>
          Build Restaurant
        </button>

        <button onClick={() => setBuildMode("road")}>
          Build Road
        </button>

        <button onClick={() => setBuildMode("residential")}>
          Build Residential
        </button>

        <button onClick={() => setBuildMode("commercial")}>
          Build Commercial
        </button>

        <button onClick={() => setBuildMode(null)}>
          Cancel
        </button>
      </div>

      <div ref={containerRef} />
  
      <HUD
        simulationState={simulationState}
        selectedCitizen={selectedCitizen}
        selectedBuilding={selectedBuilding}
        buildMode={buildMode}
      />
    </>
  )
}

export default App