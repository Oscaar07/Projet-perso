import { Application, Graphics, Container } from "pixi.js"
import { Citizen } from "../../simulation/entities/Citizen"
import { WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from "../../simulation/config/worldConfig"
import { Building } from "../../simulation/entities/Building"
import { Tile } from "../../simulation/world/Tiles"

export class CityScene {
  private app: Application
  private onCitizenClick?: (citizen: Citizen) => void
  private worldContainer = new Container();
  private cameraX = 0;
  private cameraY = 0;

  constructor(app: Application, onCitizenClick?: (citizen: Citizen) => void) {
    this.app = app
    this.onCitizenClick = onCitizenClick
    this.app.stage.addChild(this.worldContainer)
  }

  render(citizens: Citizen[], buildings: Building[], tiles: Tile[]) {
    this.worldContainer.removeChildren()
    
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
        this.worldContainer.addChild(graphics)
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

      this.worldContainer.addChild(graphics)
    })

    citizens.forEach((citizen) => {
      const graphics = new Graphics()
      graphics.eventMode = "static";
      graphics.cursor = "pointer";

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

      graphics.on("pointerdown", () => {
        this.onCitizenClick?.(citizen)
      })

      this.worldContainer.addChild(graphics)
    })
    
  }

  drawGrid() {
    for (let x = 0; x <= WORLD_WIDTH; x++) {
        for (let y = 0; y <= WORLD_HEIGHT; y++) {
          const title = new Graphics()

          title.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          title.stroke({width: 1, color: 0x555555})
          this.worldContainer.addChild(title)
        }
    }
  }

  moveCamera(x: number, y: number) {
    this.cameraX += x
    this.cameraY += y

    this.worldContainer.x = this.cameraX
    this.worldContainer.y = this.cameraY
  }
}
