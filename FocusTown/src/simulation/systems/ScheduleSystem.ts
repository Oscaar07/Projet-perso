/**
 * Système de chronotypes : détermine les fenêtres de travail et de sommeil
 * de chaque citoyen selon son profil (morning lark / night owl).
 *
 * UtileAI utilise les valeurs workDesire / sleepDesire ici comme des
 * scores de base qui entrent dans son calcul d'utilité. Un citoyen aura
 * naturellement tendance à travailler pendant sa fenêtre productive et
 * dormir pendant sa fenêtre de repos.
 *
 * La faim est aussi légèrement augmentée le midi pour déclencher des
 * pauses repas.
 */
import { Citizen } from "../entities/Citizen"

export class ScheduleSystem {

  update(citizens: Citizen[], time: number) {

    citizens.forEach((citizen) => {

      // On remet les désirs à zéro avant de les recalculer à chaque tick
      citizen.workDesire = 0
      citizen.sleepDesire = 0

      // Chronotype "morning" : lève-tôt, productif en journée,
      // se couche tôt
      if (citizen.chronotype === "morning") {

        if (time >= 7 && time <= 17) {
          citizen.workDesire = 40
        }

        if (time >= 21 || time <= 6) {
          citizen.sleepDesire = 60
        }

        if (time >= 12 && time <= 13) {
          citizen.hunger += 0.1
        }
      }

      // Chronotype "night" : démarre plus tard, productif en fin de
      // journée, se couche tard
      if (citizen.chronotype === "night") {

        if (time >= 10 && time <= 20) {
          citizen.workDesire = 40
        }

        if (time >= 1 && time <= 9) {
          citizen.sleepDesire = 60
        }
        if (time >= 12 && time <= 13) {
          citizen.hunger += 0.1
        }
      }
    })
  }
}
