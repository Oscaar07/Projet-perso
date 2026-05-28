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
import { ProductivitySummary, ProductivityEvent } from "../productivity/types"
import { summarizeProductivityEvent } from "../productivity/ProductivitySummary"

const engine = new SimulationEngine()
const PRODUCTIVITY_EVENTS_STORAGE_KEY = "focusTown.productivityEvents"

// Single in-memory summary used by the HUD and by the simulation engine.
const EMPTY_PRODUCTIVITY_SUMMARY: ProductivitySummary = {
  focusSeconds: 0,
  distractionSeconds: 0,
  idleSeconds: 0,
  breakSeconds: 0,
  totalTrackedSeconds: 0,
  averageProductivityScore: 0,
}

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

  const [productivitySummary, setProductivitySummary] = useState<ProductivitySummary>(EMPTY_PRODUCTIVITY_SUMMARY)

  const [activeFocusStartedAt, setActiveFocusStartedAt] = useState<number | null>(null)
  const [productivityEvents, setProductivityEvents] = useState<ProductivityEvent[]>([])
  const [productivityLoaded, setProductivityLoaded] = useState(false)

  function applyProductivitySummary(nextSummary: typeof productivitySummary) {
    // Keep React state and the simulation engine in sync from one update path.
    setProductivitySummary(nextSummary)
    engine.setProductivitySummary(nextSummary)
    setSimulationState(engine.getState())
  }

  function startFocusSession() {
    setActiveFocusStartedAt(Date.now())
  }

  function stopFocusSession() {
    if (!activeFocusStartedAt) return

    const endedAt = Date.now()
    const durationSeconds = Math.floor((endedAt - activeFocusStartedAt) / 1000)

    addProductivityEvent({
      id: crypto.randomUUID(),
      type: "focus",
      startedAt: activeFocusStartedAt,
      endedAt,
      durationSeconds,
      appName: "Manual Focus",
      productivityScore: 90,
    })
    setActiveFocusStartedAt(null)
  }

  function addProductivityEvent(event: ProductivityEvent) {
    // Events are the source of truth; the summary is recalculated from them.
    const nextEvents = [...productivityEvents, event]
    const nextSummary = summarizeProductivityEvent(nextEvents)

    setProductivityEvents(nextEvents)
    applyProductivitySummary(nextSummary)
  }

  function clearProductivity() {
    setProductivityEvents([])
    applyProductivitySummary(EMPTY_PRODUCTIVITY_SUMMARY)
  }

  useEffect(() => {
    buildModeRef.current = buildMode
    citySceneRef.current?.setBuildMode(buildMode)
  }, [buildMode])

  useEffect(() => {
    const interval = setInterval(() => {
      // The engine owns the simulation clock; the UI only renders snapshots.
      const state = engine.tick()

      setSimulationState(state)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (initializedRef.current) return

    initializedRef.current = true

    async function initPixi() {
      // PIXI renders the city scene into a single canvas managed by React.
      const app = new Application()

      await app.init({
        width: WORLD_WIDTH * TILE_SIZE,
        height: WORLD_HEIGHT * TILE_SIZE,
        backgroundColor: 0x222222,
      })

      appRef.current = app


      // CityScene is the rendering bridge between simulation state and user input.
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
    // Re-render from the latest simulation snapshot after each engine tick.
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

      // Clamp zoom so the camera stays usable on all screen sizes.
      const delta = event.deltaY > 0 ? -0.1 : 0.1;

      citySceneRef.current.setZoom(Math.max(0.5,Math.min(3,citySceneRef.current.getZoom()  + delta)));
    }
    window.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    // Persist user productivity history locally so the HUD survives reloads.
    const rawEvent = localStorage.getItem(PRODUCTIVITY_EVENTS_STORAGE_KEY)
    if (!rawEvent) {
      setProductivityLoaded(true)
      return
    }

    try {
      const savedEvents = JSON.parse(rawEvent) as ProductivityEvent[]
      const savedSummary = summarizeProductivityEvent(savedEvents)

      setProductivityEvents(savedEvents)
      applyProductivitySummary(savedSummary)
    } catch (error) {
      console.error("Failed to load productivity events", error)
    } finally {
      setProductivityLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!productivityLoaded) return

    // Temporary browser persistence until the Tauri/SQLite storage layer exists.
    localStorage.setItem(PRODUCTIVITY_EVENTS_STORAGE_KEY, JSON.stringify(productivityEvents))
  }, [productivityEvents, productivityLoaded])

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
        <button onClick={() => addProductivityEvent({
          id: crypto.randomUUID(),
          type: "distraction",
          startedAt: Date.now() - 300000,
          endedAt: Date.now(),
          durationSeconds: 300,
          appName: "Simulated Distraction",
          productivityScore: 20,
        })}>
          Log Distraction
        </button>
        <button onClick={clearProductivity}>
          Clear Productivity
        </button>
        {activeFocusStartedAt && (
          <span>
            Focus session running
          </span>
        )}
          <span>
            Events: {productivityEvents.length}
          </span>
        {activeFocusStartedAt ? (
          <button onClick={stopFocusSession}>
            Stop Focus
          </button>
        ) : (
          <button onClick={startFocusSession}>
            Start Focus
          </button>
        )}
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
