import { useEffect, useRef, useState } from "react"
import { Application } from "pixi.js"
import { SimulationEngine } from "../simulation/engine/SimulationEngine"
import { CityScene } from "../rendering/scenes/CityScene"
import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "../simulation/config/worldConfig"
import { HUD } from "../ui/HUD"

const engine = new SimulationEngine()

function App() {
  const [simulationState, setSimulationState] = useState({
    tick: 0,
    citizens: [],
    buildings: [],
    tiles: [],
    time: 8,
    day: 1,
  })

  const appRef = useRef<Application | null>(null)
  const citySceneRef = useRef<CityScene | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const [selectedCitizen, setSelectedCitizen] = useState<any>(null)

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

      citySceneRef.current = new CityScene(app, (citizen) => {setSelectedCitizen(citizen)})

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
      simulationState.tiles
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
      <div ref={containerRef} />
  
      <HUD
        simulationState={simulationState}
        selectedCitizen={selectedCitizen}
      />
    </>
  )
}

export default App