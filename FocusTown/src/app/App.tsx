import { useEffect, useRef } from "react"
import { Application } from "pixi.js"
import { useSimulationStore, engine, tickSimulation, startSimulation, stopSimulation } from "../store/simulationStore"
import { useUIStore } from "../store/uiStore"
import { useProductivityStore } from "../store/productivityStore"
import { CityScene } from "../rendering/scenes/CityScene"
import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "../simulation/config/worldConfig"
import { HUD } from "../ui/HUD"
import { ProductivityDashboard } from "../ui/ProductivityDashboard"
import { useActiveWindowTracking } from "../tracking/useActiveWindowTracking"
import { invoke } from "@tauri-apps/api/core"
import { ProductivityEvent } from "../productivity/types"
import { loadProductivityEvents } from "../productivity/ProductivityStorage"

function App() {
  const sim = useSimulationStore()
  const { selectedBuilding, selectedCitizen, setBuildMode, setSelectedCitizen, setSelectedBuilding } = useUIStore()
  const { events, activeFocusStartedAt, addEvent, clearAll, startFocus, stopFocus } = useProductivityStore()

  const appRef = useRef<Application | null>(null)
  const citySceneRef = useRef<CityScene | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

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
    const scene = citySceneRef.current
    if (!scene) return

    if (engine.tilesChanged) {
      scene.updateTiles(sim.tiles)
      engine.tilesChanged = false
    }
    if (engine.buildingsChanged) {
      scene.updateBuildings(sim.buildings, selectedBuilding?.id)
      engine.buildingsChanged = false
    }
    scene.render(
      sim.citizens, sim.buildings, sim.tiles,
      sim.timeOfDay, sim.weather,
      selectedCitizen?.id,
    )
  }, [sim])

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

  useActiveWindowTracking((event: ProductivityEvent) => {
    addEvent(event)
  })

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