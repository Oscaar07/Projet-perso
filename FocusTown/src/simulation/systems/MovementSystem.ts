/**
 * Exécute le déplacement des citoyens sur la grille discrète.
 *
 * Chaque tick, les citoyens qui ont un chemin (path[]) non vide avancent
 * d'exactement une case. Le système met à jour :
 * - movingTicks : compteur de ticks passés à se déplacer (utilisé pour le
 *   lock Pokémon-style et l'interpolation visuelle)
 * - facingDirection : orientation du sprite pour l'affichage
 * - prevX/prevY : position avant déplacement (interpolation rendu)
 * - occupancy : grille d'occupation pour le pathfinding
 *
 * Le mouvement est tile-par-tile : pas de déplacement fractionnaire.
 * L'interpolation fluide est gérée côté rendu via tickProgress.
 */
import { Citizen } from "../entities/Citizen"
import { PathfindingGrid } from "./PathfindingGrid";

export class MovementSystem {
  update(citizens: Citizen[], grid: PathfindingGrid) {
    for (const citizen of citizens) {
      // Sécurité anti-dérive : les positions doivent toujours être entières
      // car le mouvement est purement grid-based. Une valeur fractionnaire
      // pourrait venir d'un bug de sauvegarde/restauration.
      citizen.x = Math.round(citizen.x)
      citizen.y = Math.round(citizen.y)

      if (citizen.path.length > 0) {
        citizen.movingTicks++

        // Détermine la direction visuelle en comparant la prochaine case
        // avec la position actuelle. Ordre de priorité : X puis Y.
        const next = citizen.path[0]
        if (next.x > citizen.x) citizen.facingDirection = "right"
        else if (next.x < citizen.x) citizen.facingDirection = "left"
        else if (next.y > citizen.y) citizen.facingDirection = "down"
        else if (next.y < citizen.y) citizen.facingDirection = "up"

        citizen.prevX = citizen.x
        citizen.prevY = citizen.y

        citizen.x = next.x
        citizen.y = next.y
        citizen.path.shift()

        // Met à jour la grille pour le pathfinding des autres citoyens
        // (évite que deux citoyens occupent la même case simultanément)
        grid.vacate(Math.floor(citizen.prevX), Math.floor(citizen.prevY))
        grid.occupy(next.x, next.y)
      } else {
        citizen.movingTicks = 0
      }
    }
  }
}
