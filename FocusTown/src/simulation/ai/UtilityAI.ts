import { Citizen } from "../entities/Citizen"
import { UtilityAction } from "./UtilityAction"

export class UtilityAI {

  evaluate(citizen: Citizen): UtilityAction[] {

    const actions: UtilityAction[] = []
    const positiveSocialMemories  = citizen.memories.filter((memory) => memory.type === "social" && memory.value > 0).length
    const negativeWorkMemories  = citizen.memories.filter((memory) => memory.type === "work" && memory.value < 0).length

    actions.push({type: "sleep", score: (100 - citizen.energy) *1.2 + citizen.sleepDesire,})

    actions.push({type: "eat", score: (100 - citizen.hunger),})

    actions.push({ type: "work", score: citizen.motivation * 0.8 + citizen.workDesire - negativeWorkMemories * 3 - citizen.burnout * 0.01 + citizen.habits.work + citizen.discipline +  citizen.perfectionism * 0.5 + citizen.stress * 0.2,})

    actions.push({type: "socialize", score: (100 - citizen.mood) * 0.7 + positiveSocialMemories  * 2 + citizen.personality.sociability * 20 + citizen.habits.socialize + citizen.confidence * 0.3,})

    actions.push({type: "relax", score: citizen.stress + citizen.habits.relax,})

    actions.push({type: "wander",score: 5 + citizen.habits.wander + citizen.anxiety * 0.1,})

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