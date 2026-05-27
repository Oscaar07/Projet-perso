import { Citizen } from "../entities/Citizen"
import { Building } from "../entities/Building"
import { createCitizen  } from "../entities/CitizenFactory"

export class PopulationSystem {

    update(citizens: Citizen[], buildings: Building[], populationCap: number, residentialDemand: number) {
        const houses = buildings.filter((b) => b.type === "house")
        const offices = buildings.filter((b) => b.type === "office")
        const restaurants = buildings.filter((b) => b.type === "restaurant")

        if(citizens.length >= populationCap){
            return
        }

        houses.forEach((house) => {
            const residents = citizens.filter((c) => c.homeId === house.id)
            const maxResidents = house.maxResidents ?? 0
            const averageMood = citizens.reduce((sum, citizen) => sum + citizen.mood, 0) / Math.max(citizens.length, 1)
            const hapinessMultiplier = averageMood / 100
            const spawnChance = residentialDemand * 0.0001 * hapinessMultiplier
            const workplace = offices[Math.floor(Math.random() * offices.length)]
            const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)] 
            if(offices.length === 0 || restaurants.length === 0) {
                console.warn("Not enough buildings to spawn new citizens")
                return
            }


            if(residents.length < maxResidents) {
                if(Math.random() < spawnChance) {
                    citizens.push(createCitizen({
                        name: `Citizen ${citizens.length + 1}`,
                        home: house,
                        workplace,
                        restaurant,
                    }))
                }
            }
        })
    }
}