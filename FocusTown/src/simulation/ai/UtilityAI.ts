import { Citizen } from "../entities/Citizen"
import { UtilityAction } from "./UtilityAction"

export class UtilityAI {

  evaluate(citizen: Citizen): UtilityAction[] {

    const actions: UtilityAction[] = []
    const positiveSocialMemories  = citizen.memories.filter((memory) => memory.type === "social" && memory.value > 0).length
    const negativeWorkMemories  = citizen.memories.filter((memory) => memory.type === "work" && memory.value < 0).length

    actions.push({
      type: "sleep",
      score: (100 - citizen.energy) * 1.4 + citizen.sleepDesire + citizen.stress * 0.2,
    })

    actions.push({
      type: "eat",
      score: (100 - citizen.hunger) * 1.3,
    })

    actions.push({
      type: "work",
      score:
        citizen.workDesire +
        citizen.motivation * 0.35 +
        citizen.discipline * 0.2 +
        citizen.perfectionism * 0.1 +
        citizen.habits.work * 0.2 -
        citizen.stress * 0.3 -
        citizen.burnout * 0.5 -
        negativeWorkMemories * 3,
    })

    actions.push({
      type: "socialize",
      score:
        (100 - citizen.mood) * 0.7 +
        positiveSocialMemories * 2 +
        citizen.personality.sociability * 25 +
        citizen.habits.socialize * 0.2 +
        citizen.confidence * 0.1,
    })

    actions.push({
      type: "relax",
      score: citizen.stress * 1.1 + (100 - citizen.fun) * 0.6 + citizen.burnout * 0.4 + citizen.habits.relax * 0.2,
    })

    actions.push({
      type: "wander",
      score: 5 + citizen.habits.wander * 0.2 + citizen.anxiety * 0.1,
    })

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
