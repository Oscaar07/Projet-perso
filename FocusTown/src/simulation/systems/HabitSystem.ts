/**
 * Système de renforcement des habitudes.
 *
 * Chaque fois qu'un citoyen fait une action, l'habitude correspondante
 * est renforcée (+0.05). Les habitudes non utilisées décroissent
 * progressivement (*0.999 par tick, soit ~0.37% de decay).
 *
 * Les habitudes influencent la procrastination :
 * - Trop de relaxation (relax > 70) → procrastination augmente
 * - Habitude de travail solide (work > 60) → procrastination diminue
 *
 * UtilityAI utilise les scores d'habitude pour favoriser les actions
 * familières (biais de routine).
 */
import { Citizen } from "../entities/Citizen"

export class HabitSystem {

  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
        if (citizen.currentAction === "work") {
          citizen.habits.work += 0.05
        }

        if (citizen.currentAction === "relax") {
          citizen.habits.relax += 0.05
        }

        if (citizen.currentAction === "socialize") {
          citizen.habits.socialize += 0.05
        }

        if (citizen.currentAction === "wander") {
          citizen.habits.wander += 0.05
        }

        if(citizen.habits.relax > 70) {
            citizen.procrastination += 0.05
        }

        if(citizen.habits.work > 60) {
            citizen.procrastination -= 0.05
        }

        // Decay progressif des habitudes inutilisées
        citizen.habits.work *= 0.999
        citizen.habits.relax *= 0.999
        citizen.habits.socialize *= 0.999
        citizen.habits.wander *= 0.999

        citizen.habits.work = Math.min(100, citizen.habits.work)
        citizen.habits.relax = Math.min(100, citizen.habits.relax)
        citizen.habits.socialize = Math.min(100, citizen.habits.socialize)
        citizen.habits.wander = Math.min(100, citizen.habits.wander)
        citizen.procrastination = Math.max(0, Math.min(100, citizen.procrastination))
      }
    )
  }
}
