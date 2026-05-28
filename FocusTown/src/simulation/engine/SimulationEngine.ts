import { Citizen } from "../entities/Citizen"
import { MovementSystem } from "../systems/MovementSystem"
import { Building, BuildingType } from "../entities/Building"
import { Tile } from "../world/Tiles"
import { NeedsSystem } from "../systems/NeedsSystem"
import { EconomySystem } from "../systems/EconomySystem"
import { PathfindingSystem } from "../systems/PathfindingSystem"
import { BuildingGenerator } from "../world/BuildingGenerator"
import { SocialSystem } from "../systems/SocialSystem"
import { JobSystem } from "../systems/JobSystem"
import { Weather } from "../world/Weather"
import { HealthSystem } from "../systems/HealthSystem"
import { HousingSystem } from "../systems/HousingSystem"
import { ScheduleSystem } from "../systems/ScheduleSystem"
import { MemorySystem } from "../systems/MemorySystem"
import { PopulationSystem } from "../systems/PopulationSystem"
import { ProcrastinationSystem } from "../systems/ProcrastinationSystem"
import { HabitSystem } from "../systems/HabitSystem"
import { EmotionSystem } from "../systems/EmotionSystem"
import { TimeSystem } from "../systems/TimeSystem"
import { ProductivitySummary } from "../../productivity/types"
import { ProductivityInfluenceSystem } from "../systems/ProductivityInfluenceSystem"
import { createCitizen} from "../entities/CitizenFactory"
import { ActionTargetSystem} from "../systems/ActionTargetSystem"
import { CityFinanceSystem} from "../systems/CityFinanceSystem"
import { ConstructionSystem } from "../systems/ConstructionSystem"
import { LocationEffectSystem } from "../systems/LocationEffectSystem"
import { WorldGenerator } from "../world/WorldGenerator"

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
  private scheduleSystem = new ScheduleSystem()
  private memorySystem = new MemorySystem()
  private populationSystem = new PopulationSystem()
  private populationCap = 10
  private residentialDemand = 50;
  private cityMoney = 1000;
  private procrastinationSystem = new ProcrastinationSystem()
  private habitSystem = new HabitSystem()
  private emotionSystem = new EmotionSystem()
  private timeSystem = new TimeSystem()
  private productivityInfluenceSystem = new ProductivityInfluenceSystem()
  private productivitySummary : ProductivitySummary = {
    focusSeconds: 0,
    distractionSeconds: 0,
    idleSeconds: 0,
    breakSeconds: 0,
    totalTrackedSeconds: 0,
    averageProductivityScore: 0
  }
  private actionTargetSystem = new ActionTargetSystem()
  private cityFinanceSystem = new CityFinanceSystem()
  private constructionSystem = new ConstructionSystem()
  private locationEffectSystem = new LocationEffectSystem()
  private worldGenerator = new WorldGenerator()
  private productivityImpact = { 
    cityMoneyDelta: 0,
    moodDelta: 0,
    motivationDelta: 0,
    stressDelta: 0,
    burnoutDelta: 0,
  }

  constructor() {
    this.tiles = this.worldGenerator.generate();
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

        this.citizens.push(createCitizen({
          name: `Citizen ${i + 1}`,
          home,
          workplace: office,
          restaurant,
          }
        ))
      }
    }
  }

  tick() {
    this.tickCount++

    // The engine owns simulation time; React only reads the resulting state.
    const timeState = this.timeSystem.update({time: this.time, day: this.day, weather: this.weather})
    this.time = timeState.time
    this.day = timeState.day
    this.weather = timeState.weather

    this.residentialDemand += Math.random() * 2 - 1;
    if(this.residentialDemand < 0) {
      this.residentialDemand = 0
    }
    if(this.residentialDemand > 100) {
      this.residentialDemand = 100
    }
    
    this.memorySystem.update(this.citizens, this.tickCount)
    this.scheduleSystem.update(this.citizens, this.time)
    this.actionTargetSystem.update(this.citizens)
    this.habitSystem.update(this.citizens)
    this.procrastinationSystem.update(this.citizens)
    this.pathfindingSystem.update(this.citizens, this.tiles)
    this.movementSystem.update(this.citizens)
    this.locationEffectSystem.update(this.citizens)
    this.needsSystem.update(this.citizens, this.weather)
    this.emotionSystem.update(this.citizens)

    // Real or manual productivity data flows into the city through this bridge.
    const productivityEffect = this.productivityInfluenceSystem.update(this.citizens, this.productivitySummary)
    this.productivityImpact = productivityEffect
    this.cityMoney += productivityEffect.cityMoneyDelta

    this.healthSystem.update(this.citizens)
    this.housingSystem.update(this.citizens, this.buildings)
    this.economySystem.update(this.citizens)
    this.socialSystem.update(this.citizens)
    this.jobSystem.update(this.citizens)
    this.populationSystem.update(this.citizens, this.buildings, this.populationCap, this.residentialDemand)

    const constructionState = this.constructionSystem.autoBuildZones({ tiles: this.tiles, buildings: this.buildings, cityMoney: this.cityMoney })
    this.buildings = constructionState.buildings
    this.tiles = constructionState.tiles
    this.cityMoney = constructionState.cityMoney

    const fianceState = this.cityFinanceSystem.update({ citizens: this.citizens, buildings: this.buildings, cityMoney: this.cityMoney })
    this.cityMoney = fianceState.cityMoney

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
        productivitySummary: this.productivitySummary,
        productivityImpact: this.productivityImpact,
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
      productivitySummary: this.productivitySummary,
      productivityImpact: this.productivityImpact,
    }
  }

  addBuilding(type: BuildingType, x: number, y: number) {
    // Public UI command: the engine keeps the API stable and delegates construction rules.
    const state = this.constructionSystem.addBuilding({
      type,
      x,
      y,
      buildings: this.buildings,
      tiles: this.tiles,
      cityMoney: this.cityMoney,
    })

    this.buildings = state.buildings
    this.tiles = state.tiles
    this.cityMoney = state.cityMoney
  }

  addRoad(x: number, y: number) {
    // Roads are tiles, not buildings, but the construction system owns both edits.
    const state = this.constructionSystem.addRoad({
      x,
      y,
      buildings: this.buildings,
      tiles: this.tiles,
      cityMoney: this.cityMoney,
    })

    this.buildings = state.buildings
    this.tiles = state.tiles
    this.cityMoney = state.cityMoney
  }

  addZone(type: "residential" | "commercial", x: number, y: number) {
    // Zones mark tiles and may later auto-generate buildings during ticks.
    const state = this.constructionSystem.addZone({
      type,
      x,
      y,
      buildings: this.buildings,
      tiles: this.tiles,
      cityMoney: this.cityMoney,
    })

    this.buildings = state.buildings
    this.tiles = state.tiles
    this.cityMoney = state.cityMoney
  }

  setProductivitySummary(summary: ProductivitySummary) {
    this.productivitySummary = summary
  }
}
