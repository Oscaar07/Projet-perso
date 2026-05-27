import { Citizen } from "../entities/Citizen"

export class LocationEffectSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      if (this.isAt(citizen.x, citizen.y, citizen.homeX, citizen.homeY)) {
        citizen.energy += 0.1
      }

      if (this.isAt(citizen.x, citizen.y, citizen.restaurantX, citizen.restaurantY)) {
        citizen.hunger += 0.2
      }

      citizen.energy = this.clamp(citizen.energy)
      citizen.hunger = this.clamp(citizen.hunger)
    })
  }

  private isAt(x: number, y: number, targetX: number, targetY: number) {
    return Math.abs(x - targetX) < 0.5 && Math.abs(y - targetY) < 0.5
  }

  private clamp(value: number) {
    return Math.max(0, Math.min(100, value))
  }
}