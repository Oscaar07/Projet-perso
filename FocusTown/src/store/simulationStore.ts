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
  paused: boolean
  speed: number
  activeEvent: {
    type: string
    title: string
    icon: string
    description: string
    remainingTicks: number
    totalDuration: number
  } | null
}

const initial = engine.getState()

export const useSimulationStore = create<SimulationState>(() => ({
  ...initial,
  productivitySummary: { ...initial.productivitySummary },
  productivityImpact: { ...initial.productivityImpact },
  paused: false,
  speed: 1,
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
let renderCallback: ((tickProgress: number) => void) | null = null

export function setRenderCallback(cb: (tickProgress: number) => void) {
  renderCallback = cb
}

function gameLoop(time: number) {
  const delta = time - lastTime
  lastTime = time

  const state = useSimulationStore.getState()
  if (!state.paused) {
    accumulator += delta * state.speed

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
  }
  if(renderCallback) {
    renderCallback(accumulator / TICK_MS)
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

export function togglePause() {
  useSimulationStore.setState((s) => ({ paused: !s.paused }))
}

export function setSpeed(speed: number) {
  useSimulationStore.setState({ speed })
}