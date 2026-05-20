import { Citizen } from "../entities/Citizen"

export class MovementSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      if (citizen.path.length === 0)
        return

      const next = citizen.path[0];

      const dx = next.x - citizen.x

      const dy = next.y - citizen.y

      const speed = 0.05

      if (Math.abs(dx) > 0.1) {
        citizen.x += dx > 0 ? speed : -speed
      }

      if (Math.abs(dy) > 0.1) {
        citizen.y += dy > 0 ? speed : -speed
      }

      const reached = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1

      if (reached) {
        citizen.path.shift()
      }
    })
  }
}