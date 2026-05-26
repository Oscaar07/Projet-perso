import { Citizen } from "../entities/Citizen"
import { Building } from "../entities/Building"

export class PopulationSystem {

    private jobs = ["developer","artist","engineer","merchant","scientist",] as const


    update(citizens: Citizen[], buildings: Building[], populationCap: number, residentialDemand: number) {
        const houses = buildings.filter((b) => b.type === "house")

        if(citizens.length >= populationCap){
            return
        }

        houses.forEach((house) => {
            const residents = citizens.filter((c) => c.homeId === house.id)
            const maxResidents = house.maxResidents ?? 0
            const averageMood = citizens.reduce((sum, citizen) => sum + citizen.mood, 0) / Math.max(citizens.length, 1)
            const hapinessMultiplier = averageMood / 100
            const spawnChance = residentialDemand * 0.0001 * hapinessMultiplier

            if(residents.length < maxResidents) {
                if(Math.random() < spawnChance) {
                    citizens.push({
                        id: crypto.randomUUID(),
                        name: `Citizen ${citizens.length + 1}`,
                        x: house.x,
                        y: house.y,
                        targetX: house.x,
                        targetY: house.y,
                        homeX: house.x,
                        homeY: house.y,
                        workX: house.x,
                        workY: house.y,
                        restaurantX: house.x,
                        restaurantY: house.y,
                        energy: 100,
                        mood: 100,
                        hunger: 100,
                        money: 100,
                        homeId: house.id,
                        currentAction: "idle",
                        chronotype: Math.random() < 0.5 ? "morning" : "night",
                        workDesire: 0,
                        sleepDesire: 0,
                        memories: [],
                        personality: {
                            diligence: Math.random(),
                            sociability: Math.random(),
                            laziness: Math.random(),
                        },
                        relationships: [],
                        job: this.jobs[Math.floor(Math.random() * this.jobs.length)],
                        stress: 0,
                        motivation: 100,
                        hygiene: 100,
                        fun: 100,
                        health: 100,
                        isSick: false,
                        path: [],
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
        })
    }
}