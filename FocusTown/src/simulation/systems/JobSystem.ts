import { Citizen } from "../entities/Citizen"

export class JobSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {

      const efficiency = citizen.isSick ? 0.3 : 1
      const salaire = citizen.job === "developer" ? 1000 : citizen.job === "artist" ? 800 : citizen.job === "engineer" ? 1200 : citizen.job === "merchant" ? 1000 : citizen.job === "scientist" ? 1500 : 0

      switch (citizen.job) {
        case "developer":
            citizen.money += salaire + (0.1 + citizen.personality.diligence *0.08) *(citizen.motivation / 100) * efficiency
            citizen.energy -= 0.04
          break

        case "artist":
          citizen.money += salaire + (0.06 + citizen.personality.diligence *0.08) *(citizen.motivation / 100) * efficiency
          citizen.mood += 0.05
          break

        case "engineer":
          citizen.money += salaire + (0.12 + citizen.personality.diligence *0.08) *(citizen.motivation / 100) * efficiency
          citizen.energy -= 0.03
          break

        case "merchant":
          citizen.money += salaire + (0.08 + citizen.personality.diligence *0.08) *(citizen.motivation / 100) * efficiency
          citizen.mood += 0.02
          break

        case "scientist":
          citizen.money += salaire + (0.09 + citizen.personality.diligence *0.08) *(citizen.motivation / 100) * efficiency
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