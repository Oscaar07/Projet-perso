import { Application, Graphics } from "pixi.js"
import { Citizen } from "../../simulation/entities/Citizen"
import { WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from "../../simulation/config/worldConfig"
import { Building } from "../../simulation/entities/Building"
import { Tile } from "../../simulation/world/Tiles"

export class CityScene {
  private app: Application

  constructor(app: Application) {
    this.app = app
  }

  render(citizens: Citizen[], buildings: Building[], tiles: Tile[]) {
    this.app.stage.removeChildren()
    
    this.drawGrid()

    tiles.forEach((tile) =>{
        const graphics = new Graphics()

        graphics.rect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        
        if(tile.type === "grass") {
            graphics.fill(0x2ecc71)
        }
        if(tile.type === "road") {
            graphics.fill(0x555555)
        }

        graphics.stroke({width: 1, color: 0x222222})
        this.app.stage.addChild(graphics)
    })

    buildings.forEach((building) => {
      const graphics = new Graphics()

      graphics.rect(
        building.x * TILE_SIZE,
        building.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      )

      graphics.fill(building.type === "house" ? 0x3498db : 0xe74c3c)

      this.app.stage.addChild(graphics)
    })

    citizens.forEach((citizen) => {
      const graphics = new Graphics()

      graphics.circle(
        citizen.x * TILE_SIZE + TILE_SIZE / 2,
        citizen.y * TILE_SIZE + TILE_SIZE / 2,
        8
      )

      if(citizen.mood > 70) {
        graphics.fill(0x00ff00)
      }else if(citizen.mood > 40) {
        graphics.fill(0x00ff00)
      }else {
        graphics.fill(0x00ff00)
      }

      this.app.stage.addChild(graphics)
    })
    
  }

  drawGrid() {
    for (let x = 0; x <= WORLD_WIDTH; x++) {
        for (let y = 0; y <= WORLD_HEIGHT; y++) {
          const title = new Graphics()

          title.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          title.stroke({width: 1, color: 0x555555})
          this.app.stage.addChild(title)
        }
    }
  }

}
