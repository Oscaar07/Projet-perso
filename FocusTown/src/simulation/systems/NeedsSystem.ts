import { Citizen } from "../entities/Citizen";

export class NeedsSystem {
    
    update(citizens: Citizen[]) {
        citizens.forEach((citizen) => {
            citizen.energy -=0.02 + citizen.personality.diligence * 0.05
            citizen.hunger -=0.03

            if(citizen.energy < 0) {
                citizen.energy = 0
            }
            if(citizen.hunger < 0) {
                citizen.hunger = 0
            }
            citizen.mood = (citizen.energy + citizen.hunger) / 2

            citizen.mood += citizen.personality.sociability * 0.02

            if(citizen.mood < 0) {
                citizen.mood = 0
            }
            if(citizen.mood > 100) {
                citizen.mood = 100
            }
        })
    }
}