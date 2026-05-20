import { Citizen } from "../entities/Citizen"

export class SocialSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      citizens.forEach((other) => {
        if (citizen.id === other.id)
          return

        const dx = citizen.x - other.x

        const dy = citizen.y - other.y

        const distance = Math.sqrt(dx * dx + dy * dy)

        const close = distance < 2

        if (!close) return

        let relation = citizen.relationships.find((r) =>
              r.citizenId ===other.id
        );  

        if (!relation) {
          relation = {
            citizenId: other.id,
            friendship: 0,
          }

          citizen.relationships.push(relation)
        }

        relation.friendship +=0.02 *citizen.personality.sociability

        if (relation.friendship > 100) {
          relation.friendship = 100
        }

        citizen.mood += 0.01

        if (citizen.mood > 100) {
          citizen.mood = 100
        }
      })
    })
  }
}