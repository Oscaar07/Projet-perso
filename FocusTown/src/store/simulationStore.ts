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
  const state = engine.tick()
  useSimulationStore.setState({
    ...state,
    productivitySummary: { ...state.productivitySummary },
    productivityImpact: { ...state.productivityImpact },
  })
}