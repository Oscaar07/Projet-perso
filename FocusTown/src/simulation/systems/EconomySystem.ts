/**
 * Économie individuelle : salaires et dépenses des citoyens.
 *
 * Quand un citoyen est à son lieu de travail, il gagne de l'argent
 * (proportionnel à sa diligence). Quand il est au restaurant, il
 * dépense pour manger.
 *
 * L'économie de la ville (cityMoney) est gérée par CityFinanceSystem.
 * Ce système ne gère que l'argent personnel des citoyens.
 */
import { Citizen } from "../entities/Citizen"

export class EconomySystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      const atWork = Math.abs(citizen.x - citizen.workX) < 0.5
        && Math.abs(citizen.y - citizen.workY) < 0.5

      if (atWork) {
        citizen.money += 0.02 + citizen.personality.diligence * 0.08
      }

      const atRestaurant = Math.abs(citizen.x - citizen.restaurantX) < 0.5
        && Math.abs(citizen.y - citizen.restaurantY) < 0.5

      if (atRestaurant && citizen.money > 0) {
        citizen.money -= 0.03
      }

      if (citizen.money < 0) {
        citizen.money = 0
      }
    })
  }
}
