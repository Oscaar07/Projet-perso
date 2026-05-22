import { Citizen } from "../entities/Citizen"
import { Tile } from "../world/Tiles"

export class PathfindingSystem {

  private getTile(
    tiles: Tile[],
    x: number,
    y: number
  ) {
    return tiles.find(
      (t) =>
        t.x === x &&
        t.y === y
    )
  }

  update(
    citizens: Citizen[],
    tiles: Tile[]
  ) {

    citizens.forEach((citizen) => {

      if (citizen.path.length === 0) {

        const path = []

        const startX = Math.floor(citizen.x)

        const startY = Math.floor(citizen.y)

        const endX = Math.floor( citizen.targetX)

        const endY = Math.floor(citizen.targetY)

        let currentX = startX
        let currentY = startY

        while (currentX !== endX) {

          const rightTile = this.getTile(tiles, currentX + 1, currentY)

          const leftTile = this.getTile(tiles, currentX - 1, currentY)

          const moveRight = currentX < endX

          const preferredTile = moveRight ? rightTile : leftTile

          if (preferredTile && preferredTile.movementCost <= 1) {
            currentX += moveRight ? 1: -1
          } else {
            const upTile = this.getTile(tiles, currentX, currentY - 1)
            const downTile = this.getTile(tiles, currentX, currentY + 1)

            if (upTile && upTile.movementCost <= 1) {
              currentY--
            } else if (downTile && downTile.movementCost <= 1) {
              currentY++
            } else {

              currentX += moveRight ? 1 : -1
            }
          }

          path.push({x: currentX, y: currentY,})
        }

        while (currentY !== endY) {

          const downTile = this.getTile(tiles, currentX, currentY + 1)

          const upTile = this.getTile(tiles, currentX, currentY - 1)

          const moveDown = currentY < endY

          const preferredTile = moveDown? downTile : upTile

          if (preferredTile && preferredTile.movementCost <= 1) {
            currentY += moveDown ? 1 : -1
          } else {
            currentY += moveDown ? 1 : -1
          }

          path.push({x: currentX, y: currentY,})
        }
        citizen.path = path
      }
    })
  }
}