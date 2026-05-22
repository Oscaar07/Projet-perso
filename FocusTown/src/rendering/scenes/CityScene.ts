import { Application, Graphics, Container } from "pixi.js"
import { Citizen } from "../../simulation/entities/Citizen"
import { WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from "../../simulation/config/worldConfig"
import { Building } from "../../simulation/entities/Building"
import { Tile } from "../../simulation/world/Tiles"
import { Weather } from "../../simulation/world/Weather"

export class CityScene {
  private app: Application
  private onCitizenClick?: (citizen: Citizen) => void
  private worldContainer = new Container();
  private cameraX = 0;
  private cameraY = 0;
  private camaraZoom = 1;
  private hoverTileX = 0;
  private hoverTileY = 0;
  private buildMode : "house" | "office" | "restaurant" | "road" | null = null;
  private isDragging = false;

  private onBuildingClick?: (building: Building) => void

  private onTileClick?: (x: number, y: number) => void
  
  constructor(app: Application, onCitizenClick?: (citizen: Citizen) => void, onBuildingClick?: (building: Building) => void, onTileClick?: (x: number, y: number) => void) {
    this.app = app
    this.onCitizenClick = onCitizenClick  
    this.onBuildingClick = onBuildingClick
    this.onTileClick = onTileClick
    this,app.stage.on("pointerdown", () => {
      this.isDragging = true
    })
    this.app.stage.on("pointerup", () => {
      this.isDragging = false
    })
    this.app.stage.addChild(this.worldContainer)
  }

  getZoom() {
    return this.camaraZoom
  }

  setBuildMode(buildMode: "house" | "office" | "restaurant" | "road" | null) {
    this.buildMode = buildMode
  }

  render(citizens: Citizen[], buildings: Building[], tiles: Tile[], timeOfDay: string, weather: Weather, selectedBuildingId: number, selectedCitizenId: number, buildMode: "house" | "office" | "restaurant" | "road" | null) {
    this.worldContainer.removeChildren()
    
    this.drawGrid()

    tiles.forEach((tile) =>{
        const graphics = new Graphics()
        graphics.eventMode = "static";
        graphics.cursor = "pointer";

        graphics.rect(tile.x * TILE_SIZE, tile.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        
        if(tile.type === "grass") {
            graphics.fill(0x2ecc71)
        }
        if(tile.type === "road") {
            graphics.fill(0x555555)
        }

        graphics.stroke({width: 1, color: 0x222222})

        if(buildMode) {
          graphics.alpha = 0.9
        }


        graphics.on("pointerover", () => {
          this.hoverTileX = tile.x
          this.hoverTileY = tile.y
        });

        graphics.on("pointerdown", () => {
          graphics.alpha = 0.5
          this.onTileClick?.(tile.x, tile.y)
          console.log("tile clicked", tile.x, tile.y)
        })

        this.worldContainer.addChild(graphics)
    })

    buildings.forEach((building) => {
      const graphics = new Graphics()
      graphics.eventMode = "static";
      graphics.cursor = "pointer";

      graphics.rect(
        building.x * TILE_SIZE,
        building.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      )

      if(building.type === "house") {
        graphics.fill(0x3498db)
      }else if(building.type === "office") {
        graphics.fill(0xe74c3c)
      }else if(building.type === "restaurant") {
        graphics.fill(0xf1c40f)
      }

      graphics.on("pointerdown", () => {
        this.onBuildingClick?.(building)
      })

      if(building.id === selectedBuildingId) {
        graphics.stroke({width: 3, color: 0xffff00})
      }

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
        graphics.fill(0xffff00)
      }else {
        graphics.fill(0xff0000)
      }

      graphics.on("pointerdown", () => {
        this.onCitizenClick?.(citizen)
      })

      if(citizen.id === selectedCitizenId) {
        graphics.stroke({width: 3, color: 0xffff00})
      }

      this.worldContainer.addChild(graphics)
    })
    
    const overlay = new Graphics()

    overlay.rect(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE)
    if (timeOfDay === "night") {
      overlay.fill({color: 0x000033,alpha: 0.5,})
    }
    if (timeOfDay === "evening") {
      overlay.fill({color: 0xff6600,alpha: 0.2,})
    }
    if (timeOfDay === "morning") {
      overlay.fill({color: 0xffffcc,alpha: 0.1,})
    }
    this.worldContainer.addChild(overlay)

    const weatherOverlay = new Graphics();
    weatherOverlay.rect(0, 0, WORLD_WIDTH * TILE_SIZE, WORLD_HEIGHT * TILE_SIZE)
    if(weather === "rain") {
      weatherOverlay.fill({color: 0x3366ff,alpha: 0.15,})
    }
    if(weather === "fog") {
      weatherOverlay.fill({color: 0xcccccc,alpha: 0.2,})
    }
    if(weather === "storm") {
      weatherOverlay.fill({color: 0x111111,alpha: 0.35,})
    }
    this.worldContainer.addChild(weatherOverlay)

    if(this.buildMode) {
      const canBuild = this.canBuildAt(this.hoverTileX, this.hoverTileY, buildings, tiles);
      const ghost = new Graphics()
      ghost.rect(this.hoverTileX * TILE_SIZE, this.hoverTileY * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      if(this.buildMode === "house") {
        ghost.fill(0x3498db)
      }else if(this.buildMode === "office") {
        ghost.fill(0xe74c3c)
      }else if(this.buildMode === "restaurant") {
        ghost.fill(0xf1c40f)
      }else if(this.buildMode === "road") {
        ghost.fill(0x888888)
        if(this.isDragging) {
          this.onTileClick?.(this.hoverTileX, this.hoverTileY)
        }
      }
      ghost.alpha = canBuild ? 0.5 : 0.2
      if(!canBuild) {
        ghost.tint = 0xff0000
      }
      this.worldContainer.addChild(ghost)
    }
  }

  drawGrid() {
    for (let x = 0; x <= WORLD_WIDTH; x++) {
        for (let y = 0; y <= WORLD_HEIGHT; y++) {
          const tile = new Graphics()

          tile.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          tile.stroke({width: 1, color: 0x555555})
          this.worldContainer.addChild(tile)
        }
    }
  }

  moveCamera(x: number, y: number) {
    this.cameraX += x
    this.cameraY += y

    this.worldContainer.x = this.cameraX
    this.worldContainer.y = this.cameraY
  }

  setZoom(zoom: number) {
    this.camaraZoom = zoom
    this.worldContainer.scale.set(this.camaraZoom)
  }

  private canBuildAt(x: number, y: number, building:Building[], tiles: Tile[]) {
    const exists = building.find((b) => b.x === x && b.y === y);
    if(exists) {
      return false
    }
    const tile = tiles.find((t) => t.x === x && t.y === y);
    if(!tile) {
      return false
    }
    if(tile.type !== "grass") {
      return false
    }
  }
}
