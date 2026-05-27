import {Citizen} from "../entities/Citizen"
import {UtilityAI} from "../ai/UtilityAI"
import { WORLD_WIDTH, WORLD_HEIGHT } from "../config/worldConfig"

export class ActionTargetSystem {
    private utilityAI = new UtilityAI()

    update(citizens: Citizen[]) {
        citizens.forEach((citizen) => {
            const previousTargetX = citizen.targetX
            const previousTargetY = citizen.targetY
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

            if (citizen.targetX !== previousTargetX || citizen.targetY !== previousTargetY) {
                citizen.path = []
            }
        })
    }
}
