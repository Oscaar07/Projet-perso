import {Citizen} from "../entities/Citizen"
import {UtilityAI} from "../ai/UtilityAI"

const utilityAI = new UtilityAI()

export function getActionScores(citizen: Citizen) {
    return utilityAI.evaluate(citizen).sort((a, b) => b.score - a.score)
}