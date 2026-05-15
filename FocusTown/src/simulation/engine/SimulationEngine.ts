import { Citizen } from "../entities/Citizen"
import { MovementSystem } from "../systems/MovementSystem"
import { Building } from "../entities/Building"
import { Tile } from "../world/Tiles"
import { NeedsSystem } from "../systems/NeedsSystem"
import { EconomySystem } from "../systems/EconomySystem"

export class SimulationEngine {
  private tickCount = 0

  private citizens: Citizen[] = [
    {
        id: 1,
        name: "Alice",

        x: 2,
        y: 2,

        energy: 100,
        mood: 100,

        homeX: 2,
        homeY: 2,

        workX: 10,
        workY: 5,

        targetX: 10,
        targetY: 5,

        hunger:100,
        restaurantX: 15,
        restaurantY: 8,
        money: 100,
    },
    {
        id: 2,
        name: "Bob",

        x: 5,
        y: 5,

        energy: 100,
        mood: 100,

        homeX: 2,
        homeY: 2,

        workX: 10,
        workY: 5,

        targetX: 10,
        targetY: 5,
        
        hunger:100,
        restaurantX: 15,
        restaurantY: 8,
        money: 100,
    },
]

  private movementSystem = new MovementSystem()
  private buildings: Building[] = [
    {
        id: 1,
        type: "house",
        x: 2,
        y: 2,
    },
    {
        id: 2,
        type: "office",
        x: 10,
        y: 5,
    },
    {
        id: 3,
        type: "restaurant",
        x: 15,
        y: 8,
    },
  ]
  private tiles: Tile[] = []
  private time = 8;
  private day = 1;
  private needsSystem = new NeedsSystem()
  private economySystem = new EconomySystem()

  constructor() {
    this.generateWorld();
  }

  tick() {
    this.tickCount++

    this.time += 0.1

    if (this.time >= 24) {
      this.time = 0
      this.day++
    }

    this.movementSystem.update(this.citizens)
    this.needsSystem.update(this.citizens)
    this.economySystem.update(this.citizens)

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
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      this.tiles.push({
        x,
        y,
        type: "grass",
      })
    }
  }

  for (let x = 0; x < 20; x++) {
    const tile = this.tiles.find(
      (t) => t.x === x && t.y === 6
    )

    if (tile) {
      tile.type = "road"
    }
  }
  }
}