import { Citizen } from "../entities/Citizen";

export class NeedsSystem {
    
    update(citizens: Citizen[]) {
        citizens.forEach((citizen) => {
            citizen.energy -=0.02
            citizen.hunger -=0.03

            if(citizen.energy < 0) {
                citizen.energy = 0
            }
            if(citizen.hunger < 0) {
                citizen.hunger = 0
            }
            citizen.mood = (citizen.energy + citizen.hunger) / 2
        })
    }
}