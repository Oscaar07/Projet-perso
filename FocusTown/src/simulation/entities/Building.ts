export type BuildingType =
  | "house"
  | "office"
  | "restaurant"

export type Building = {
  id: number
  type: BuildingType
  x: number
  y: number
}