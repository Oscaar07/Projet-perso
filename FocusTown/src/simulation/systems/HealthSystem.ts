import { Citizen } from "../entities/Citizen"

export class HealthSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {

      if (citizen.energy < 20) {
        citizen.health -= 0.03
      }

      if (citizen.hunger < 20) {
        citizen.health -= 0.02
      }

      if (citizen.stress > 80) {
        citizen.health -= 0.04
      }

      if (citizen.fun < 20) {
        citizen.health -= 0.01
      }

      if (citizen.health < 50) {
        citizen.isSick = true
      }

      if (citizen.energy > 80 && citizen.hunger > 80 && citizen.stress < 30) {
        citizen.health += 0.05
      }

      if (citizen.health > 100) {
        citizen.health = 100
      }

      if (citizen.health < 0) {
        citizen.health = 0
      }

      if (citizen.health > 70) {
        citizen.isSick = false
      }
    })
  }
}