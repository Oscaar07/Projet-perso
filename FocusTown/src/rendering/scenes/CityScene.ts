import { Application, Graphics, Container } from "pixi.js"
import { Citizen } from "../../simulation/entities/Citizen"
import { WORLD_HEIGHT, WORLD_WIDTH, TILE_SIZE } from "../../simulation/config/worldConfig"
import { Building } from "../../simulation/entities/Building"
import { Tile } from "../../simulation/world/Tiles"
import { Weather } from "../../simulation/world/Weather"

export class CityScene {
  private app: Application
  private onCitizenClick?: (citizen: Citizen) => void
  private gridContainer = new Container()
  private tileContainer = new Container()
  private buildingContainer = new Container()
  private entityContainer = new Container()
  private worldContainer = new Container()
  private cameraX = 0;
  private cameraY = 0;
  private camaraZoom = 1;
  private hoverTileX = 0;
  private hoverTileY = 0;
  private buildMode : "house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null = null;
  private isDragging = false;
  private lastDraggedX: number | null = null;
  private lastDraggedY: number | null = null;

  private onBuildingClick?: (building: Building) => void

  private onTileClick?: (x: number, y: number) => void
  
  constructor(app: Application, onCitizenClick?: (citizen: Citizen) => void, onBuildingClick?: (building: Building) => void, onTileClick?: (x: number, y: number) => void) {
    this.app = app
    this.onCitizenClick = onCitizenClick  
    this.onBuildingClick = onBuildingClick
    this.onTileClick = onTileClick
    // The stage captures pointer input once and forwards it to the current build mode.
    this.app.stage.eventMode = "static"
    this.app.stage.hitArea = this.app.screen
    this.app.stage.on("pointerdown", () => {
      this.isDragging = true
      this.lastDraggedX = null
      this.lastDraggedY = null
    })
    // also place initial tile when pointerdown on the stage (for drags started off a graphic)
    this.app.stage.on("pointerdown", (e: any) => {
      if (this.buildMode !== "road") return
      const global = e.data.global
      const worldX = (global.x - this.worldContainer.x) / this.camaraZoom
      const worldY = (global.y - this.worldContainer.y) / this.camaraZoom
      const tx = Math.floor(worldX / TILE_SIZE)
      const ty = Math.floor(worldY / TILE_SIZE)
      if (tx < 0 || ty < 0 || tx >= WORLD_WIDTH || ty >= WORLD_HEIGHT) return
      this.lastDraggedX = tx
      this.lastDraggedY = ty
      this.onTileClick?.(tx, ty)
    })
    this.app.stage.on("pointerup", () => {
      this.isDragging = false
      this.lastDraggedX = null
      this.lastDraggedY = null
    })

    // When dragging, track pointer movement and place roads while moving
    this.app.stage.on("pointermove", (e: any) => {
      const global = e.data.global
      // transform screen coords to world coords (account for camera and zoom)
      const worldX = (global.x - this.worldContainer.x) / this.camaraZoom
      const worldY = (global.y - this.worldContainer.y) / this.camaraZoom

      const tx = Math.floor(worldX / TILE_SIZE)
      const ty = Math.floor(worldY / TILE_SIZE)

      // bounds check
      if (tx < 0 || ty < 0 || tx >= WORLD_WIDTH || ty >= WORLD_HEIGHT) return

      // update hover for every move so the preview follows the cursor everywhere
      this.hoverTileX = tx
      this.hoverTileY = ty

      if (!this.isDragging) return

      // only auto-place while in road build mode
      if (this.buildMode !== "road") return

      // avoid repeating the same tile
      if (this.lastDraggedX === tx && this.lastDraggedY === ty) return

      this.lastDraggedX = tx
      this.lastDraggedY = ty

      this.onTileClick?.(tx, ty)
    })
    this.app.stage.addChild(this.worldContainer)
    this.worldContainer.addChild(this.gridContainer)
    this.worldContainer.addChild(this.tileContainer)
    this.worldContainer.addChild(this.buildingContainer)
    this.worldContainer.addChild(this.entityContainer)

    this.drawGrid()
  }

  getZoom() {
    return this.camaraZoom
  }

  setBuildMode(buildMode: "house" | "office" | "restaurant" | "road" | "residential" | "commercial" | null) {
    this.buildMode = buildMode
  }

  render(
    citizens: Citizen[],
    buildings: Building[],
    tiles: Tile[],
    timeOfDay: string,
    weather: Weather,
    selectedCitizenId?: string | number | null,
  ) {
    this.entityContainer.removeChildren()

    citizens.forEach((citizen) => {
      const graphics = new Graphics()
      graphics.eventMode = "static";
      graphics.cursor = "pointer";

      graphics.circle(
        citizen.x * TILE_SIZE + TILE_SIZE / 2,
        citizen.y * TILE_SIZE + TILE_SIZE / 2,
        8
      )

      if (citizen.emotionalState === "happy") {
        graphics.fill(0x00ff00)
      
      } else if (citizen.emotionalState ==="sad") {
        graphics.fill(0x3498db)
      
      } else if (citizen.emotionalState ==="burnout") {
        graphics.fill(0xff0000)
      
      } else if (citizen.emotionalState === "anxious") {
        graphics.fill(0xffff00)
      
      } else {
        graphics.fill(0xffffff)
      }

      graphics.on("pointerdown", () => {
        this.onCitizenClick?.(citizen)
      })

      if (selectedCitizenId != null && citizen.id === selectedCitizenId.toString()) {
        graphics.stroke({width: 3, color: 0xffff00})
      }

      this.entityContainer.addChild(graphics)
    })
    
    // Time-of-day tint sits above the base map but below selection feedback.
    const overlay = new Graphics()
    overlay.eventMode = "none"

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
    this.entityContainer.addChild(overlay)

    // Weather is visually layered after the time tint so it remains readable.
    const weatherOverlay = new Graphics();
    weatherOverlay.eventMode = "none"
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
    this.entityContainer.addChild(weatherOverlay)

    // Hover feedback is always on top of the world so build targeting stays obvious.
    const hoverHighlight = new Graphics()
    hoverHighlight.eventMode = "none"
    hoverHighlight.rect(this.hoverTileX * TILE_SIZE, this.hoverTileY * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    hoverHighlight.fill({ color: 0xffffff, alpha: 0.08 })
    hoverHighlight.stroke({ width: 2, color: 0xffffff, alpha: 0.9 })
    this.entityContainer.addChild(hoverHighlight)

    if(this.buildMode) {
      const canBuild = this.canBuildAt(this.hoverTileX, this.hoverTileY, buildings, tiles);
      const ghost = new Graphics()
      ghost.eventMode = "none"
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
      this.entityContainer.addChild(ghost)
    }
  }

  drawGrid() {
    for (let x = 0; x <= WORLD_WIDTH; x++) {
        for (let y = 0; y <= WORLD_HEIGHT; y++) {
          const tile = new Graphics()

          tile.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          tile.stroke({width: 1, color: 0x555555})
          this.gridContainer.addChild(tile)
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
    return true
  }

  updateTiles(tiles: Tile[]) {
    this.tileContainer.removeChildren()

    tiles.forEach((tile) => {
      const g = new Graphics()
      g.eventMode = "static"
      g.cursor = "pointer"

      const x = tile.x * TILE_SIZE
      const y = tile.y * TILE_SIZE

      if (tile.zoneType === "residential") {
        g.beginFill(0x3498db, 0.5)
      } else if (tile.zoneType === "commercial") {
        g.beginFill(0xf1c40f, 0.5)
      } else if (tile.type === "grass") {
        g.beginFill(0x2ecc71, 1)
      } else if (tile.type === "road") {
        g.beginFill(0x555555, 1)
      } else {
        g.beginFill(0x222222, 1)
      }

      g.lineStyle(1, 0x222222)
      g.drawRect(x, y, TILE_SIZE, TILE_SIZE)
      g.endFill()

      g.on("pointerover", () => {
        this.hoverTileX = tile.x
        this.hoverTileY = tile.y
      })

      g.on("pointerdown", () => {
        g.alpha = 0.5
        this.onTileClick?.(tile.x, tile.y)
      })

      this.tileContainer.addChild(g)
    })
  }

  updateBuildings(buildings: Building[], selectedBuildingId?: string | number | null) {
    this.buildingContainer.removeChildren()

    buildings.forEach((building) => {
      const g = new Graphics()
      g.eventMode = "static"
      g.cursor = "pointer"

      g.rect(
        building.x * TILE_SIZE,
        building.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      )

      if (building.type === "house") {
        g.fill(0x3498db)
      } else if (building.type === "office") {
        g.fill(0xe74c3c)
      } else if (building.type === "restaurant") {
        g.fill(0xf1c40f)
      }

      g.on("pointerdown", () => {
        this.onBuildingClick?.(building)
      })

      if (selectedBuildingId != null && building.id === selectedBuildingId.toString()) {
        g.stroke({width: 3, color: 0xffff00})
      }

      this.buildingContainer.addChild(g)
    })
  }
}
