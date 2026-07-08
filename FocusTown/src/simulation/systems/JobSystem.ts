/**
 * Système de travail : applique les effets du métier sur le citoyen.
 *
 * Chaque métier a un salaire de base, un bonus basé sur la diligence et
 * la motivation, et des effets secondaires (énergie, mood) :
 *
 * - developer : salaire 1000, bonus fort, coût en énergie
 * - artist    : salaire 800, bonus moyen, boost de mood
 * - engineer  : salaire 1200, bonus fort, coût en énergie
 * - merchant  : salaire 1000, bonus moyen, petit boost de mood
 * - scientist : salaire 1500, bonus moyen, coût en énergie élevé
 *
 * Un citoyen malade (isSick) a son efficacité réduite à 30%.
 */
import { Citizen } from "../entities/Citizen"

export class JobSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      const efficiency = citizen.isSick ? 0.3 : 1

      const salary = citizen.job === "developer" ? 1000
        : citizen.job === "artist" ? 800
        : citizen.job === "engineer" ? 1200
        : citizen.job === "merchant" ? 1000
        : citizen.job === "scientist" ? 1500
        : 0

      switch (citizen.job) {
        case "developer":
            citizen.money += salary + (0.1 + citizen.personality.diligence * 0.08)
              * (citizen.motivation / 100) * efficiency
            citizen.energy -= 0.04
          break

        case "artist":
          citizen.money += salary + (0.06 + citizen.personality.diligence * 0.08)
            * (citizen.motivation / 100) * efficiency
          citizen.mood += 0.05
          break

        case "engineer":
          citizen.money += salary + (0.12 + citizen.personality.diligence * 0.08)
            * (citizen.motivation / 100) * efficiency
          citizen.energy -= 0.03
          break

        case "merchant":
          citizen.money += salary + (0.08 + citizen.personality.diligence * 0.08)
            * (citizen.motivation / 100) * efficiency
          citizen.mood += 0.02
          break

        case "scientist":
          citizen.money += salary + (0.09 + citizen.personality.diligence * 0.08)
            * (citizen.motivation / 100) * efficiency
          citizen.energy -= 0.05
          break
      }

      if (citizen.energy < 0) {
        citizen.energy = 0
      }

      if (citizen.mood > 100) {
        citizen.mood = 100
      }
    })
  }
}
