import { Citizen } from "../entities/Citizen"
import { UtilityAction } from "./UtilityAction"

export class UtilityAI {

  evaluate(citizen: Citizen): UtilityAction[] {

    const actions: UtilityAction[] = []
    const positiveSocialMemories  = citizen.memories.filter((memory) => memory.type === "social" && memory.value > 0).length
    const negativeWorkMemories  = citizen.memories.filter((memory) => memory.type === "work" && memory.value < 0).length

    actions.push({type: "sleep", score: (100 - citizen.energy) *1.2 + citizen.sleepDesire,})

    actions.push({type: "eat", score: (100 - citizen.hunger),})

    actions.push({ type: "work", score: citizen.motivation * 0.8 + citizen.workDesire - negativeWorkMemories * 3,})

    actions.push({type: "socialize", score: (100 - citizen.mood) * 0.7 + positiveSocialMemories  * 2,})

    actions.push({type: "relax", score: citizen.stress,})

    actions.push({type: "wander",score: 5,})

    return actions
  }

  getBestAction(citizen: Citizen) {
    const actions = this.evaluate(citizen)
  
    return actions.reduce((best, current) => {
        return current.score > best.score ? current : best
      }
    )
  }
}