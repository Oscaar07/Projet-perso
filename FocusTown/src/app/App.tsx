import { useEffect, useRef , useState} from "react"
import { Application } from "pixi.js"
import { useSimulationStore, engine, tickSimulation, startSimulation, stopSimulation, togglePause, setSpeed, setRenderCallback } from "../store/simulationStore"
import { useUIStore } from "../store/uiStore"
import { useProductivityStore } from "../store/productivityStore"
import { CityScene } from "../rendering/scenes/CityScene"
import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "../simulation/config/worldConfig"
import { HUD } from "../ui/HUD"
import { ProductivityDashboard } from "../ui/ProductivityDashboard"
import { useActiveWindowTracking } from "../tracking/useActiveWindowTracking"
import { invoke } from "@tauri-apps/api/core"
import { loadProductivityEvents } from "../productivity/ProductivityStorage"
import { serializeEngine, deserializeEngine } from "../simulation/SimulationSerializer"
import { saveSimulation, loadSimulation, listSaves } from "../simulation/SimulationStorage"

function App() {
  const sim = useSimulationStore()
  const { setBuildMode, setSelectedCitizen, setSelectedBuilding } = useUIStore()
  const { events, activeFocusStartedAt, addEvent, clearAll, startFocus, stopFocus } = useProductivityStore()

  const appRef = useRef<Application | null>(null)
  const citySceneRef = useRef<CityScene | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const [saveName, setSaveName] = useState("")
  const [saves, setSaves] = useState<{ name: string; created_at: string }[]>([])
  const [showLoadMenu, setShowLoadMenu] = useState(false)

  useEffect(() => {
    startSimulation()
    return () => stopSimulation()
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
        (citizen) => { setSelectedCitizen(citizen) },
        (building) => { setSelectedBuilding(building) },
        (x, y) => {
          const currentBuildMode = useUIStore.getState().buildMode
          if (!currentBuildMode) return

          if (currentBuildMode === "road") {
            engine.addRoad(x, y)
          } else if (currentBuildMode === "residential") {
            engine.addZone("residential", x, y)
          } else if (currentBuildMode === "commercial") {
            engine.addZone("commercial", x, y)
          } else {
            engine.addBuilding(currentBuildMode, x, y)
          }

          if (currentBuildMode !== "road") {
            setBuildMode(null)
          }
          tickSimulation()
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
    setRenderCallback((tickProgress) => {
      const scene = citySceneRef.current
      if (!scene) return
      const state = useSimulationStore.getState()
      const uiState = useUIStore.getState()

      if (engine.tilesChanged) {
        scene.updateTiles(state.tiles)
        engine.tilesChanged = false
      }
      if (engine.buildingsChanged) {
        scene.updateBuildings(state.buildings, uiState.selectedBuilding?.id)
        engine.buildingsChanged = false
      }
      scene.render(
        state.citizens, state.buildings, state.tiles,
        state.timeOfDay, state.weather,
        uiState.selectedCitizen?.id,
        tickProgress,
      )
    })
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!citySceneRef.current) return
      const speed = 20
      if (event.key === "ArrowUp") citySceneRef.current.moveCamera(0, speed)
      if (event.key === "ArrowDown") citySceneRef.current.moveCamera(0, -speed)
      if (event.key === "ArrowLeft") citySceneRef.current.moveCamera(speed, 0)
      if (event.key === "ArrowRight") citySceneRef.current.moveCamera(-speed, 0)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (!citySceneRef.current) return
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      citySceneRef.current.setZoom(Math.max(0.5, Math.min(3, citySceneRef.current.getZoom() + delta)))
    }
    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [])

  useActiveWindowTracking(addEvent)

  // Productivité : charge depuis SQLite au démarrage (sans re-sauvegarder)
  useEffect(() => {
    const { loaded } = useProductivityStore.getState()
    if (loaded) return
    loadProductivityEvents().then((saved) => {
      const { setEvents } = useProductivityStore.getState()
      setEvents(saved)
      useProductivityStore.setState({ loaded: true })
      invoke("start_tracking").catch(console.error)
    })
  }, [])

  useEffect(() => {
    listSaves().then(setSaves).catch(console.error)
  }, [])

  return (
    <>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button onClick={() => setBuildMode("house")}>Build House</button>
        <button onClick={() => setBuildMode("office")}>Build Office</button>
        <button onClick={() => setBuildMode("restaurant")}>Build Restaurant</button>
        <button onClick={() => setBuildMode("road")}>Build Road</button>
        <button onClick={() => setBuildMode("residential")}>Build Residential</button>
        <button onClick={() => setBuildMode("commercial")}>Build Commercial</button>
        <button onClick={() => setBuildMode(null)}>Cancel</button>
        <button onClick={togglePause}>  {sim.paused ? "▶ Play" : "⏸ Pause"}</button>
        <button onClick={() => setSpeed(0.5)} style={{ fontWeight: sim.speed === 0.5 ? "bold" : "normal" }}>0.5x</button>
        <button onClick={() => setSpeed(1)} style={{ fontWeight: sim.speed === 1 ? "bold" : "normal" }}>1x</button>
        <button onClick={() => setSpeed(2)} style={{ fontWeight: sim.speed === 2 ? "bold" : "normal" }}>2x</button>
        <button onClick={() => setSpeed(4)} style={{ fontWeight: sim.speed === 4 ? "bold" : "normal" }}>4x</button>

        <input
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Save name"
            style={{ width: 100 }}
          />
          <button onClick={async () => {
            if (!saveName) return
            const data = serializeEngine(engine)
            await saveSimulation(saveName, data)
            setSaves(await listSaves())
            setSaveName("")
          }}>Save</button>

          <button onClick={async () => {
            const list = await listSaves()
            setSaves(list)
            setShowLoadMenu(!showLoadMenu)
          }}>Load</button>

          {showLoadMenu && (
            <div style={{ position: "absolute", top: 40, left: 0, background: "#222", border: "1px solid #555", padding: 8 }}>
              {saves.length === 0 && <div>No saves</div>}
              {saves.map((s) => (
                <div key={s.name}>
                  <button onClick={async () => {
                    const json = await loadSimulation(s.name)
                    const data = deserializeEngine(json)
                    engine.importState(data)
                    tickSimulation()
                    setShowLoadMenu(false)
                  }}>{s.name}</button>
                </div>
              ))}
            </div>
          )}

        <button onClick={() => addEvent({
          id: crypto.randomUUID(),
          type: "distraction",
          startedAt: Date.now() - 300000,
          endedAt: Date.now(),
          durationSeconds: 300,
          appName: "Simulated Distraction",
          productivityScore: 20,
        })}>Log Distraction</button>
        <button onClick={clearAll}>Clear Productivity</button>
        {activeFocusStartedAt && <span>Focus session running</span>}
        <span>Events: {events.length}</span>
        {activeFocusStartedAt ? (
          <button onClick={stopFocus}>Stop Focus</button>
        ) : (
          <button onClick={startFocus}>Start Focus</button>
        )}
      </div>

      <div ref={containerRef} />

      <HUD />
      <ProductivityDashboard />
    </>
  )
}

export default App