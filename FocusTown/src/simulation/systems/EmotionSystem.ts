import { Citizen } from "../entities/Citizen";

export class EmotionSystem {
    update(citizens: Citizen[]) {
        citizens.forEach((citizen) => {
            if(citizen.burnout > 70) {
                citizen.emotionalState = "burnout"
                return
            }
            if(citizen.anxiety > 70) {
                citizen.emotionalState = "anxious"
                return
            }
            if(citizen.mood < 30) {
                citizen.emotionalState = "sad"
                return
            }
            if(citizen.mood > 70) {
                citizen.emotionalState = "happy"
                return
            }
            citizen.emotionalState = "neutral"
        })
    }
}