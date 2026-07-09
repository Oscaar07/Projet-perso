import { Citizen } from "../entities/Citizen"
import { Building } from "../entities/Building"
import { Weather } from "../world/Weather"

export type EventType = "calm" | "fire" | "epidemic" | "festival" | "recession"

export interface EventResult {
  description: string
  citizens: Citizen[]
  buildings: Building[]
  cityMoney: number
}

export interface CityEvent {
  type: EventType
  title: string
  icon: string
  score(
    citizens: Citizen[],
    buildings: Building[],
    weather: Weather,
    cityMoney: number,
    ticksSinceLastEvent: number
  ): number
  execute(
    citizens: Citizen[],
    buildings: Building[],
    cityMoney: number
  ): EventResult
  duration: number
}
