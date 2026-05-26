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
              r.citizenId === other.id
        );  

        if (!relation) {
          relation = {citizenId: other.id, friendship: 0,}
          citizen.relationships.push(relation)
        }

        relation.friendship += 0.02 *citizen.personality.sociability
        if(citizen.stress > 80) {
          relation.friendship -= 0.05
        }

        relation.friendship = Math.max(0, Math.min(100, relation.friendship))

        citizen.mood += 0.01

        citizen.mood += (other.mood - citizen.mood) * 0.001

        if (citizen.mood > 100) {
          citizen.mood = 100
        }

        if (other.burnout > 80) {
          citizen.stress += 0.02
        }
      })
      citizen.relationships.forEach((relation) => {
        relation.friendship -= 0.01
        relation.friendship = Math.max(-100,Math.min(100,relation.friendship))
      })
    })
  }
}