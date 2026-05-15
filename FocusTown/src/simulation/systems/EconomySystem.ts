import { Citizen } from "../entities/Citizen"

export class EconomySystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      const atWork = Math.abs(citizen.x - citizen.workX) < 0.5 &&Math.abs(citizen.y - citizen.workY) < 0.5;

      if (atWork) {
        citizen.money += 0.05
      }

      const atRestaurant = Math.abs(citizen.x - citizen.restaurantX) < 0.5 &&Math.abs(citizen.y - citizen.restaurantY) < 0.5

      if (atRestaurant && citizen.money > 0) {
        citizen.money -= 0.03
      }

      if (citizen.money < 0) {
        citizen.money = 0
      }
    })
  }
}