import { SimulationEngine } from "./engine/SimulationEngine"
import { Citizen } from "./entities/Citizen"
import { Building } from "./entities/Building"
import { Tile } from "./world/Tiles"
import { Weather } from "./world/Weather"

export interface SimulationSaveData {
  tickCount: number
  time: number
  day: number
  weather: Weather
  cityMoney: number
  residentialDemand: number
  populationCap: number
  productivitySummary: {
    focusSeconds: number
    distractionSeconds: number
    idleSeconds: number
    breakSeconds: number
    totalTrackedSeconds: number
    averageProductivityScore: number
  }
  citizens: Citizen[]
  buildings: Building[]
  tiles: Tile[]
  recentDeaths: { citizenId: string; name: string; cause: string; age: number; day: number; job: string}[]
  activeEvent: {
    type: string
    title: string
    icon: string
    description: string
    remainingTicks: number
    totalDuration: number
  } | null
}

export function serializeEngine(engine: SimulationEngine): string {
  const data = engine.exportState()
  return JSON.stringify(data)
}

export function deserializeEngine(json: string): SimulationSaveData {
  return JSON.parse(json) as SimulationSaveData
}