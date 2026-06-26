import { create } from "zustand"
import { Citizen } from "../simulation/entities/Citizen"
import { Building } from "../simulation/entities/Building"
import { Tile } from "../simulation/world/Tiles"
import { Weather } from "../simulation/world/Weather"
import { SimulationEngine } from "../simulation/engine/SimulationEngine"

export const engine = new SimulationEngine()

export type SimulationState = {
  tick: number
  citizens: Citizen[]
  buildings: Building[]
  tiles: Tile[]
  time: number
  day: number
  timeOfDay: string
  weather: Weather
  cityMoney: number
  residentialDemand: number
  productivitySummary: {
    focusSeconds: number
    distractionSeconds: number
    idleSeconds: number
    breakSeconds: number
    totalTrackedSeconds: number
    averageProductivityScore: number
  }
  productivityImpact: {
    cityMoneyDelta: number
    moodDelta: number
    motivationDelta: number
    stressDelta: number
    burnoutDelta: number
  }
}

const initial = engine.getState()

export const useSimulationStore = create<SimulationState>(() => ({
  ...initial,
  productivitySummary: { ...initial.productivitySummary },
  productivityImpact: { ...initial.productivityImpact },
}))

export function tickSimulation() {
  const newState = engine.tick()
  useSimulationStore.setState({
    ...newState,
    productivitySummary: { ...newState.productivitySummary },
    productivityImpact: { ...newState.productivityImpact },
  })
}

const TICK_MS = 100
let accumulator = 0
let lastTime = 0
let rafId: number | null = null

function gameLoop(time: number) {
  const delta = time - lastTime
  lastTime = time
  accumulator += delta

  // Cap à 1s pour éviter un catch-up massif après un idle onglet
  if (accumulator > TICK_MS * 10) {
    accumulator = TICK_MS * 10
  }

  while (accumulator >= TICK_MS) {
    const newState = engine.tick()
    useSimulationStore.setState({
      ...newState,
      productivitySummary: { ...newState.productivitySummary },
      productivityImpact: { ...newState.productivityImpact },
    })
    accumulator -= TICK_MS
  }

  rafId = requestAnimationFrame(gameLoop)
}

export function startSimulation() {
  if (rafId !== null) return // déjà démarré
  lastTime = performance.now()
  accumulator = 0
  rafId = requestAnimationFrame(gameLoop)
}

export function stopSimulation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}