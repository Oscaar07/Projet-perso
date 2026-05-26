import { Citizen } from "../entities/Citizen";
import { Weather } from "../world/Weather";

export class NeedsSystem {
    
    update(citizens: Citizen[], weather: Weather) {
        citizens.forEach((citizen) => {

            citizen.energy -= 0.02 + citizen.personality.diligence * 0.05
            citizen.hunger -= 0.03
            citizen.mood = (citizen.energy + citizen.hunger) / 2

            citizen.mood += citizen.personality.sociability * 0.02

            if(weather === "rain") {
                citizen.mood -= 0.01
            }
            if(weather === "sunny") {
                citizen.mood += 0.01
            }

            citizen.hygiene -= 0.02
            citizen.fun -= 0.03

            if(citizen.fun < 30) {
                citizen.mood -= 0.05
            }

            citizen.stress += citizen.personality.laziness * 0.02
            
            if (citizen.stress > 70) {
                citizen.mood -= 0.08
              }
            
            citizen.motivation = citizen.mood - citizen.stress * 0.5

            citizen.motivation -= citizen.procrastination * 0.001

            if(citizen.stress > 90 && citizen.energy < 20){
                citizen.mood -= 0.2
                citizen.motivation -= 0.2
            }

            
            if (citizen.hunger < 30) {
                if (citizen.money >= 10) {
                    citizen.money -= 10
                    citizen.hunger += 40
                    if (citizen.hunger > 100) citizen.hunger = 100
                    citizen.mood += 5
                }
            }

            if(citizen.relationships.length === 0) {
                citizen.mood -= 0.05
            }
            
            //Clamp

            if (citizen.motivation < 0) {
                citizen.motivation = 0
              }    
            if (citizen.motivation > 100) {
                citizen.motivation = 100
            }

            if(citizen.hunger > 100) {
                citizen.hunger = 100
            }
            if(citizen.hunger < 0) {
                citizen.hunger = 0
            }

            if(citizen.energy > 100) {
                citizen.energy = 100
            }
            if(citizen.energy < 0) {
                citizen.energy = 0
            }

            if(citizen.procrastination > 100) {
                citizen.procrastination = 100
            }
            if(citizen.procrastination < 0) {
                citizen.procrastination = 0
            }

            if(citizen.mood < 0) {
                citizen.mood = 0
            }
            if(citizen.mood > 100) {
                citizen.mood = 100
            }	   
        })
    }
}