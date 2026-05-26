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
import { JobSystem } from "../systems/JobSystem"
import { Weather } from "../world/Weather"
import { HealthSystem } from "../systems/HealthSystem"
import { HousingSystem } from "../systems/HousingSystem"
import { UtilityAI } from "../ai/UtilityAI"
import { ScheduleSystem } from "../systems/ScheduleSystem"
import { MemorySystem } from "../systems/MemorySystem"
import { PopulationSystem } from "../systems/PopulationSystem"
import { ProcrastinationSystem } from "../systems/ProcrastinationSystem"
import { HabitSystem } from "../systems/HabitSystem"
import { EmotionSystem } from "../systems/EmotionSystem"


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
  private jobSystem = new JobSystem()
  private healthSystem = new HealthSystem()
  private housingSystem = new HousingSystem()
  private weather: Weather = "sunny"
  private utilityAI = new UtilityAI()
  private scheduleSystem = new ScheduleSystem()
  private memorySystem = new MemorySystem()
  private populationSystem = new PopulationSystem()
  private populationCap = 10
  private residentialDemand = 50;
  private cityMoney = 1000;
  private procrastinationSystem = new ProcrastinationSystem()
  private habitSystem = new HabitSystem()
  private emotionSystem = new EmotionSystem()

  constructor() {
    this.generateWorld();
    this.buildings = this.buildingGenerator.generate();
    const houses = this.buildings.filter((b)=>b.type === "house");
    const offices = this.buildings.filter((b)=>b.type === "office");
    const restaurants = this.buildings.filter((b)=>b.type === "restaurant"); 

    if (houses.length === 0 || offices.length === 0 || restaurants.length === 0) {
      console.warn("Not enough buildings to spawn initial citizens")
    } else {
      for (let i = 0; i < 10; i++) {
        const home = houses[Math.floor(Math.random() * houses.length)]
        const office = offices[Math.floor(Math.random() * offices.length)]
        const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
        const jobs = ["developer","artist","engineer","merchant","scientist",] as const
        const job = jobs[Math.floor(Math.random() * jobs.length)]

        this.citizens.push({
          id: crypto.randomUUID(),
        
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
          job: job,
          stress: 0,
          motivation: 100,
          hygiene: 100,
          fun: 100,
          health: 100,
          isSick: false,
          homeId: home.id,
          currentAction: "",
          chronotype: Math.random() < 0.5 ? "morning" : "night",
          workDesire: 0,
          sleepDesire: 0,
          memories: [],
          procrastination: 0,
          burnout: 0,
          habits: {
            work: 0,
            relax: 0,
            socialize: 0,
            wander: 0,
          },
          discipline: Math.random()*100,
          anxiety: Math.random()*100,
          confidence: Math.random()*100,
          perfectionism: Math.random()*100,
          emotionalState: "neutral",
        })
      }
    }
  }

  tick() {
    this.tickCount++

    this.time += 0.1

    if (this.time >= 24) {
      this.time = 0
      this.day++
      this.updateWeather()
    }

    this.residentialDemand += Math.random() * 2 - 1;
    if(this.residentialDemand < 0) {
      this.residentialDemand = 0
    }
    if(this.residentialDemand > 100) {
      this.residentialDemand = 100
    }
    
    this.memorySystem.update(this.citizens, this.tickCount)
    this.scheduleSystem.update(this.citizens, this.time)

     this.citizens.forEach((citizen) => {

      const action = this.utilityAI.getBestAction(citizen)
      citizen.currentAction = action.type

      if(action.type === "sleep") {
        citizen.targetX = citizen.homeX
        citizen.targetY = citizen.homeY
      }else if(action.type === "eat") {
        citizen.targetX = citizen.restaurantX
        citizen.targetY = citizen.restaurantY
      }else if(action.type === "work") {
        citizen.targetX = citizen.workX
        citizen.targetY = citizen.workY
      }else if(action.type === "socialize") {
        citizen.targetX = citizen.homeX +  1
        citizen.targetY = citizen.homeY + 1
      }else if(action.type === "relax") {
        citizen.targetX = citizen.homeX
        citizen.targetY = citizen.homeY
      }else if(action.type === "wander") {
        citizen.targetX = citizen.x + Math.floor(Math.random() * 3) - 1
        citizen.targetY = citizen.y + Math.floor(Math.random() * 3) - 1
        citizen.targetX = Math.max(0, Math.min(WORLD_WIDTH - 1, citizen.targetX))
        citizen.targetY = Math.max(0, Math.min(WORLD_HEIGHT - 1, citizen.targetY))
      }
    })
    this.habitSystem.update(this.citizens)
    this.procrastinationSystem.update(this.citizens)
    this.pathfindingSystem.update(this.citizens, this.tiles)
    this.movementSystem.update(this.citizens)
    this.needsSystem.update(this.citizens, this.weather)
    this.emotionSystem.update(this.citizens)
    this.healthSystem.update(this.citizens)
    this.housingSystem.update(this.citizens, this.buildings)
    this.economySystem.update(this.citizens)
    this.socialSystem.update(this.citizens)
    this.jobSystem.update(this.citizens)
    this.populationSystem.update(this.citizens, this.buildings, this.populationCap, this.residentialDemand)

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

    this.autoBuildZones()

    this.collectTaxes()
    this.payBuildingUpKeep()

    if(this.cityMoney < -1000) {
      console.warn("game over, you are bankrupt")
    }

    return {
        tick: this.tickCount,
        citizens: this.citizens,
        buildings: this.buildings,
        tiles: this.tiles,
        time: this.time,
        day: this.day,
        timeOfDay: this.getTimeOfDay(),
        weather: this.weather,
        cityMoney: this.cityMoney,
      residentialDemand: this.residentialDemand,
    }
  }
  
  private generateWorld() {
  for (let x = 0; x < WORLD_WIDTH; x++) {
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      this.tiles.push({
        x,
        y,
        type: "grass",
        movementCost: 5,
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

  getTimeOfDay() {
    if(this.time >= 6 && this.time < 12)
      return "morning"
    else if(this.time >= 12 && this.time < 18)
      return "day"
    else if(this.time >= 18 && this.time < 22)
      return "evening"
    else
      return "night"
  }

  private updateWeather() {
    const random = Math.random()
    if(random < 0.6)
      this.weather = "sunny"
    else if(random < 0.8)
      this.weather = "rain"
    else if(random < 0.95) {
      this.weather = "fog"
    }else {
      this.weather = "storm"}
  }

  addBuilding(type: "house" | "office" | "restaurant" | "road" | "residential" | "commercial", x: number, y: number) {
    const cost = type === "house" ? 100 : type === "office" ? 200 : type === "restaurant" ? 300 : 0
    const exists = this.buildings.find((b) => b.x === x && b.y === y)

    if(this.cityMoney < cost) {
      console.warn("not enough money to build", x, y)
      return
    }
    
    if (exists) {
      console.warn("building already exists", x, y)
      return
    }

    const tile = this.tiles.find((t) => t.x === x && t.y === y)
    if (!tile) {
      console.warn("tile not found", x, y)
      return
    }
    if (tile.type !== "grass") {
      console.warn("tile is not grass", x, y)
      return
    }

    this.buildings.push({
      id: crypto.randomUUID(),
      type,
      x,
      y,
      capacity: type === "house" ? 4 : 999,
      comfort: 50,
      cleanliness: 100,
      maxResidents: type === "house" ? 4 : undefined,
    })
    this.cityMoney -= cost
  }

  getState() {
    return {
      tick: this.tickCount,
      citizens: this.citizens,
      buildings: this.buildings,
      tiles: this.tiles,
      time: this.time,
      day: this.day,
      timeOfDay: this.getTimeOfDay(),
      weather: this.weather,
      cityMoney: this.cityMoney,
      residentialDemand: this.residentialDemand,
    }
  }

  addRoad(x: number, y: number) {
    const cost = 25

    if (this.cityMoney < cost) {
      console.warn("not enough money to build road", x, y)
      return
    }

    const exists = this.tiles.find((t) => t.x === x && t.y === y)
    if (!exists) {
      console.warn("road not found", x, y)
      return
    }
    exists.type = "road"
    exists.movementCost = 1
    this.cityMoney -= cost
  }

  addZone(type: "residential" | "commercial", x: number, y: number) {
    const tile = this.tiles.find((t) => t.x === x && t.y === y)
    if (!tile) {
      return
    }
    if (tile.type !== "grass") {
      return
    }
    tile.zoneType = type
  }

  private autoBuildZones() {

    this.tiles.forEach((tile) => {
  
      if (tile.zoneType === "residential") {
        const exists = this.buildings.some((building) => building.x === tile.x && building.y === tile.y)
        if (!exists) {
          if (Math.random() < 0.001) {  
            this.buildings.push({ id: crypto.randomUUID(), type: "house", x: tile.x, y: tile.y, capacity: 4, comfort: 50, cleanliness: 100,})
          }
        }
      }

      if (tile.zoneType === "commercial" ) {
        const exists = this.buildings.some((building) => building.x === tile.x && building.y === tile.y)
      
        if (!exists) {
          if (Math.random() < 0.001) {
            this.buildings.push({ id: crypto.randomUUID(), type: "restaurant", x: tile.x, y: tile.y, capacity: 999, comfort: 50, cleanliness: 100,})
          }
        }
      }
    })
  }

  private collectTaxes() {
    this.citizens.forEach((citizen) => {
      const tax = citizen.money * 0.001
      this.cityMoney += tax
      citizen.money -= tax
    })
  }

  private payBuildingUpKeep() {
    this.buildings.forEach((building) => {
      const upKeep = building.type === "house" ? 1 : building.type === "office" ? 2 : building.type === "restaurant" ? 3 : 0
      this.cityMoney -= upKeep * 0.01
    })
  }
}