import { Citizen } from "../entities/Citizen"
import { Tile } from "../world/Tiles"

export class PathfindingSystem {

    private getTile(tiles: Tile[], x: number, y: number) {
        return tiles.find(t => t.x === x && t.y === y)
    }
    
  update(citizens: Citizen[], tiles: Tile[]) {
    citizens.forEach((citizen) => {
      if (citizen.path.length === 0) {
        const path = []

        const startX = Math.floor(citizen.x)

        const startY = Math.floor(citizen.y)

        const endX = Math.floor(citizen.targetX)

        const endY = Math.floor(citizen.targetY)

        let currentX = startX
        let currentY = startY

        const rightTile = this.getTile(tiles, currentX + 1, currentY);
        const leftTile = this.getTile(tiles, currentX - 1, currentY);

        while (currentX !== endX) {
          if(currentX < endX && rightTile && rightTile.movementCost <= 1) {
            currentX++
          }else if (currentX > endX && leftTile && leftTile.movementCost <= 1) {
            currentX--
          }else {
            currentX += currentX < endX ? 1 : -1
          }

          path.push({x: currentX, y: currentY})
        }

        while (currentY !== endY) {
          currentY += currentY < endY ? 1 : -1

          path.push({x: currentX, y: currentY})
        }

        citizen.path = path
      }
    })
  }
}