import { create } from "zustand"
import { Citizen } from "../simulation/entities/Citizen"
import { Building } from "../simulation/entities/Building"

export type BuildMode = "house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null

type UIState = {
  buildMode: BuildMode
  selectedCitizen: Citizen | null
  selectedBuilding: Building | null
  setBuildMode: (mode: BuildMode) => void
  setSelectedCitizen: (citizen: Citizen | null) => void
  setSelectedBuilding: (building: Building | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  buildMode: null,
  selectedCitizen: null,
  selectedBuilding: null,
  setBuildMode: (buildMode) => set({ buildMode }),
  setSelectedCitizen: (selectedCitizen) => set({ selectedCitizen }),
  setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
}))