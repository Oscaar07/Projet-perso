import { Citizen } from "../entities/Citizen"
import { PathfindingGrid } from "./PathfindingGrid";

export class MovementSystem {
  private previousPositions = new Map<string, {x : number, y: number}>()

  update(citizens: Citizen[], grid : PathfindingGrid) {
    for(const citizen of citizens) {
      if (citizen.path.length === 0) continue

      const prev = this.previousPositions.get(citizen.id)
      const prevTileX = prev ? Math.floor(prev.x) : Math.floor(citizen.x)
      const prevTileY = prev ? Math.floor(prev.y) : Math.floor(citizen.y)

      this.previousPositions.set(citizen.id, {x : citizen.x, y : citizen.y})

      const next = citizen.path[0]
      const dx = next.x - citizen.x
      const dy = next.y - citizen.y
      const speed = 0.05

      if (Math.abs(dx) > 0.1) {
        citizen.x += dx > 0 ? speed : -speed
      }
      if (Math.abs(dy) > 0.1) {
        citizen.y += dy > 0 ? speed : -speed
      }
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        citizen.path.shift()
      }

      const newTileX = Math.floor(citizen.x)
      const newTileY = Math.floor(citizen.y)
      if (newTileX !== prevTileX || newTileY !== prevTileY) {
        grid.vacate(prevTileX, prevTileY)
        grid.occupy(newTileX, newTileY)
      }
      
    }
  }
}