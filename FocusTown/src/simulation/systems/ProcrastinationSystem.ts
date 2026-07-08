/**
 * Gère la procrastination et le burnout des citoyens.
 *
 * La procrastination augmente quand le citoyen erre ou se relaxe
 * (évitement des tâches productives), et diminue quand il travaille.
 *
 * Le burnout s'accumule quand le citoyen est stressé ET fatigué
 * simultanément (stress > 70, energy < 30). Se relaxer réduit le
 * burnout mais augmente la procrastination — trade-off permanent.
 */
import { Citizen } from "../entities/Citizen"

export class ProcrastinationSystem {

  update(citizens: Citizen[]) {

    citizens.forEach((citizen) => {

        if (citizen.currentAction === "wander") {
          citizen.procrastination += 0.2
        }

        if (citizen.currentAction === "relax") {
          citizen.procrastination += 0.1
          citizen.burnout -= 0.1
        }

        if (citizen.currentAction === "work") {
          citizen.procrastination -= 0.3
        }

        // Le burnout arrive quand on force malgré l'épuisement
        if(citizen.stress > 70 && citizen.energy < 30) {
          citizen.burnout += 0.2
        }

        citizen.procrastination = Math.max(0, Math.min(100, citizen.procrastination))
        citizen.burnout = Math.max(0, Math.min(100, citizen.burnout))

      }
    )
  }
}
