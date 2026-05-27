import {Building, BuildingType} from "../entities/Building"
import {Tile} from "../world/Tiles"

type ConstructionState = {
    buildings: Building[]
    tiles: Tile[]
    cityMoney: number
}

export class ConstructionSystem {
    addBuilding(params: { type: BuildingType, x: number, y: number, buildings: Building[], tiles: Tile[], cityMoney: number }) : ConstructionState {
    const cost = params.type === "house" ? 100 : params.type === "office" ? 200 : params.type === "restaurant" ? 300 : 0

    if(params.cityMoney < cost) {
      console.warn("not enough money to build", params.x, params.y)
      return params
    }
    
    const exists = params.buildings.find((building) => building.x === params.x && building.y === params.y)

    if (exists) {
      console.warn("building already exists", params.x, params.y)
      return params
    }

    const tile = params.tiles.find((t) => t.x === params.x && t.y === params.y)
    if (!tile) {
      console.warn("tile not found", params.x, params.y)
      return params
    }
    if (tile.type !== "grass") {
      console.warn("tile is not grass", params.x, params.y)
      return params
    }

    params.buildings.push({
      id: crypto.randomUUID(),
      type: params.type,
      x: params.x,
      y: params.y,
      capacity: params.type === "house" ? 4 : 999,
      comfort: 50,
      cleanliness: 100,
      maxResidents: params.type === "house" ? 4 : undefined,
    })
    params.cityMoney -= cost
    return params
  }

    addRoad(params: { x: number, y: number, cityMoney: number, tiles: Tile[], buildings: Building[] }): ConstructionState {
    const cost = 25

    if (params.cityMoney < cost) {
      console.warn("not enough money to build road", params.x, params.y)
      return params
    }

    const exists = params.tiles.find((t) => t.x === params.x && t.y === params.y)
    if (!exists) {
      console.warn("road not found", params.x, params.y)
      return params
    }
    exists.type = "road"
    exists.movementCost = 1
    return { buildings: params.buildings, tiles: params.tiles, cityMoney: params.cityMoney - cost }
  }

    addZone(params: { type: "residential" | "commercial", x: number, y: number, tiles: Tile[], cityMoney: number, buildings: Building[] }): ConstructionState {
    const tile = params.tiles.find((t) => t.x === params.x && t.y === params.y)
    if (!tile || tile.type !== "grass") {
      return params
    }
    tile.zoneType = params.type
    return { buildings: params.buildings, tiles: params.tiles, cityMoney: params.cityMoney }
  }

   autoBuildZones(params: { tiles: Tile[], buildings: Building[], cityMoney: number }): ConstructionState {

    params.tiles.forEach((tile) => {
  
      if (tile.zoneType === "residential") {
        const exists = params.buildings.some((building) => building.x === tile.x && building.y === tile.y)
        if (!exists) {
          if (Math.random() < 0.001) {  
            params.buildings.push({ id: crypto.randomUUID(), type: "house", x: tile.x, y: tile.y, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4 })
          }
        }
      }

      if (tile.zoneType === "commercial" ) {
        const exists = params.buildings.some((building) => building.x === tile.x && building.y === tile.y)
      
        if (!exists) {
          if (Math.random() < 0.001) {
            params.buildings.push({ id: crypto.randomUUID(), type: "restaurant", x: tile.x, y: tile.y, capacity: 999, comfort: 50, cleanliness: 100, })
          }
        }
      }
    })
    return { buildings: params.buildings, tiles: params.tiles, cityMoney: params.cityMoney }
  }
}