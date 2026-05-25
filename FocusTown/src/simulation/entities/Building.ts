export type BuildingType =
  | "house"
  | "office"
  | "restaurant"
  | "road"
  | "residential"
  | "commercial"

export type Building = {
  id: string
  type: BuildingType
  x: number
  y: number
  capacity: number
  comfort: number
  cleanliness: number
  maxResidents?: number
}