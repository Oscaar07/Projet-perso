import { Citizen } from "../entities/Citizen";

export class MemorySystem {
    update(citizens: Citizen[], tick: number) {

        citizens.forEach((citizen) => {
            if(citizen.mood  > 80) {
                citizen.memories.push({
                    type: "social",
                    value: 10,
                    timestamp: tick,
                })
            }
            if(citizen.stress > 80) {
                citizen.memories.push({
                    type: "work",
                    value: -10,
                    timestamp: tick,
                })
            }

            citizen.memories = citizen.memories.filter((memory) => memory.timestamp > tick - 500)

            if(citizen.memories.length > 30) {
                citizen.memories.shift()
            }
        })
    }
}