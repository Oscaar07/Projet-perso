import { Citizen } from "../entities/Citizen"
import { MovementSystem } from "../systems/MovementSystem"
import { Building } from "../entities/Building"
import { Tile } from "../world/Tiles"
import { NeedsSystem } from "../systems/NeedsSystem"
import { EconomySystem } from "../systems/EconomySystem"
import { WORLD_HEIGHT, WORLD_WIDTH } from "../config/worldConfig"
import { PathfindingSystem } from "../systems/PathfindingSystem"
import { BuildingGenerator } from "../world/BuildingGenerator"
import { SocialSystem } from "../systems/SocialSystem"

export class SimulationEngine {
  private tickCount = 0

  private citizens: Citizen[] = []
  private movementSystem = new MovementSystem()
  private buildings: Building[] = []
  private tiles: Tile[] = []
  private time = 8;
  private day = 1;
  private needsSystem = new NeedsSystem()
  private economySystem = new EconomySystem()
  private pathfindingSystem = new PathfindingSystem()
  private buildingGenerator = new BuildingGenerator()
  private socialSystem = new SocialSystem()

  constructor() {
    this.generateWorld();
    this.buildings = this.buildingGenerator.generate();
    const houses = this.buildings.filter((b)=>b.type === "house");
    const offices = this.buildings.filter((b)=>b.type === "office");
    const restaurants = this.buildings.filter((b)=>b.type === "restaurant"); 

    for (let i = 0; i < 10; i++) {
      const home =houses[Math.floor(Math.random() *houses.length)]
      const office = offices[Math.floor(Math.random() * offices.length)]
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
      this.citizens.push({
        id: i,
      
        name: `Citizen ${i}`,
      
        x: home.x,
        y: home.y,
      
        targetX: office.x,
        targetY: office.y,
      
        homeX: home.x,
        homeY: home.y,
      
        workX: office.x,
        workY: office.y,
      
        restaurantX: restaurant.x,
        restaurantY: restaurant.y,
      
        energy: 100,
        hunger: 100,
        mood: 100,
        money: 100,
      
        path: [],
        personality: {
          diligence: Math.random(),
          sociability: Math.random(),
          laziness: Math.random(),
        },
        relationships: [],
      })
    }
  }

  tick() {
    this.tickCount++

    this.time += 0.1

    if (this.time >= 24) {
      this.time = 0
      this.day++
    }

    this.pathfindingSystem.update(this.citizens, this.tiles)
    this.movementSystem.update(this.citizens)
    this.needsSystem.update(this.citizens)
    this.economySystem.update(this.citizens)
    this.socialSystem.update(this.citizens)
    
    this.citizens.forEach((citizen) => {
        if (citizen.energy < 20) {
            citizen.targetX = citizen.homeX
            citizen.targetY = citizen.homeY
        }else if (citizen.hunger < 30) {
            citizen.targetX = citizen.restaurantX
            citizen.targetY = citizen.restaurantY
        }else if (this.time >= 8 && this.time <= 18) {
            citizen.targetX = citizen.workX
            citizen.targetY = citizen.workY
        }else {
            citizen.targetX = citizen.homeX
            citizen.targetY = citizen.homeY
        }
    })

    this.citizens.forEach((citizen) => {
        const atHome = Math.abs(citizen.x - citizen.homeX) < 0.5 && Math.abs(citizen.y - citizen.homeY) < 0.5
        if(atHome) {
            citizen.energy += 0.1
            if(citizen.energy > 100) {
                citizen.energy = 100
            }
        }

        const atRestaurant = Math.abs(citizen.x - citizen.restaurantX) < 0.5 && Math.abs(citizen.y - citizen.restaurantY) < 0.5;
        if(atRestaurant) {
            citizen.hunger += 0.2;
            if(citizen.hunger > 100) {
                citizen.hunger = 100
            }
        }
    })

    return {
        tick: this.tickCount,
        citizens: this.citizens,
        buildings: this.buildings,
        tiles: this.tiles,
        time: this.time,
        day: this.day,
    }
  }
  
  private generateWorld() {
  for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      this.tiles.push({
        x,
        y,
        type: "grass",
        movementCost: 3,
      })
    }
  }

  for (let x = 0; x < WORLD_WIDTH; x++) {
    const tile = this.tiles.find(
      (t) => t.x === x && t.y === 6
    )

    if (tile) {
      tile.type = "road"
      tile.movementCost = 1
    }
  }
  }
}