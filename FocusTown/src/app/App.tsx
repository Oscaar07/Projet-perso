import { useEffect, useRef, useState } from "react"
import { Application } from "pixi.js"

import { SimulationEngine } from "../simulation/engine/SimulationEngine"
import { CityScene } from "../rendering/scenes/CityScene"
import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from "../simulation/config/worldConfig"

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

      citySceneRef.current = new CityScene(app)

      containerRef.current?.appendChild(app.canvas)
    }

    initPixi()

    return () => {
      appRef.current?.destroy()

      containerRef.current?.replaceChildren()
    }
  }, [])

  useEffect(() => {
    if (!appRef.current) return

    const app = appRef.current

    citySceneRef.current?.render(simulationState.citizens, simulationState.buildings, simulationState.tiles)
  }, [simulationState])

  return (
    <div>
      <h1 style={{ color: "white" }}>
        FocusTown
      </h1>
      <div ref={containerRef} />

      <p style={{ color: "white" }}>
        Time: {simulationState.time.toFixed(2)} | Day: {simulationState.day}
      </p>

      {simulationState.citizens.map((citizen: any) => (
      <div key={citizen.id} style={{color: "white", marginBottom: "10px",}}>
        <div>{citizen.name}</div>
        <div>Energy: {citizen.energy.toFixed(0)}</div>
        <div>Hunger: {citizen.hunger.toFixed(0)}</div>
        <div>Mood: {citizen.mood.toFixed(0)}</div>
        <div>Money: {citizen.money.toFixed(0)}</div>
      </div>
      ))}

    </div>
  )
}

export default App