/**
 * Simulation sociale : amitiés, contagion émotionnelle et effets de groupe.
 *
 * Pour chaque paire de citoyens proches (distance < 2 tiles) :
 * - Crée une relation d'amitié si elle n'existe pas
 * - La friendship augmente avec la sociabilité, diminue si stressé
 * - Contagion émotionnelle : le mood converge lentement vers celui du voisin
 * - Contagion du burnout : si un voisin est en burnout, le stress augmente
 *
 * Les relations non entretenues se dégradent (-0.01 par tick).
 */
import { Citizen } from "../entities/Citizen"

export class SocialSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      citizens.forEach((other) => {
        if (citizen.id === other.id) return

        const dx = citizen.x - other.x
        const dy = citizen.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const close = distance < 2

        if (!close) return

        let relation = citizen.relationships.find((r) => r.citizenId === other.id)

        if (!relation) {
          relation = {citizenId: other.id, friendship: 0}
          citizen.relationships.push(relation)
        }

        relation.friendship += 0.02 * citizen.personality.sociability
        if(citizen.stress > 80) {
          relation.friendship -= 0.05
        }

        relation.friendship = Math.max(0, Math.min(100, relation.friendship))

        // La simple proximité sociale améliore légèrement le moral
        citizen.mood += 0.01

        // Contagion : le mood du citoyen converge doucement vers celui du voisin
        citizen.mood += (other.mood - citizen.mood) * 0.001

        if (citizen.mood > 100) {
          citizen.mood = 100
        }

        // Contagion du burnout : un voisin en burnout stresse
        if (other.burnout > 80) {
          citizen.stress += 0.02
        }
      })

      // Dégradation naturelle des amitiés non entretenues
      citizen.relationships.forEach((relation) => {
        relation.friendship -= 0.01
        relation.friendship = Math.max(-100, Math.min(100, relation.friendship))
      })
    })
  }
}
