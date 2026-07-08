/**
 * Pathfinding A* pour les déplacements des citoyens.
 *
 * Chaque tick, pour chaque citoyen qui n'a pas de chemin en cours,
 * calcule le chemin le plus court de sa position actuelle à sa cible.
 * Utilise une heuristique Manhattan (distance en grille) avec pénalités
 * d'occupation via PathfindingGrid.getEffectiveCost().
 *
 * L'exploration est limitée à PATHFINDING_MAX_TIER itérations pour
 * éviter les blocages infinis sur les grandes cartes.
 *
 * Le chemin retourné est une liste de {x, y} que MovementSystem
 * consomme case par case au fil des ticks.
 */
import { Citizen } from "../entities/Citizen"
import { PathfindingGrid } from "./PathfindingGrid"
import { PATHFINDING_MAX_TIER } from "../config/worldConfig"

export class PathfindingSystem {

  update(citizens: Citizen[], grid: PathfindingGrid) {
    for (const citizen of citizens) {
      if (citizen.path.length > 0) continue

      const startX = Math.floor(citizen.x)
      const startY = Math.floor(citizen.y)
      const endX = Math.floor(citizen.targetX)
      const endY = Math.floor(citizen.targetY)

      if (startX === endX && startY === endY) {
        citizen.path = [{ x: endX, y: endY }]
        continue
      }

      citizen.path = this.aStar(startX, startY, endX, endY, grid)
    }
  }

  private aStar(
    sx: number, sy: number,
    ex: number, ey: number,
    grid: PathfindingGrid
  ): { x: number; y: number }[] {
    const openSet: { x: number; y: number; g: number; f: number }[] = [{ x: sx, y: sy, g: 0, f: this.heuristic(sx, sy, ex, ey) }]
    const cameFrom = new Map<string, { x: number; y: number }>()
    const gScore = new Map<string, number>()
    gScore.set(`${sx},${sy}`, 0)
    const visited = new Set<string>()
    let iterations = 0

    while (openSet.length > 0 && iterations < PATHFINDING_MAX_TIER) {
      iterations++

      // Sélection du nœud avec le score f le plus bas (tas linéaire
      // suffisant pour les grilles de taille modeste)
      let lowest = 0
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowest].f) lowest = i
      }
      const current = openSet.splice(lowest, 1)[0]
      const key = `${current.x},${current.y}`

      if (current.x === ex && current.y === ey) {
        return this.reconstructPath(cameFrom, current.x, current.y)
      }

      visited.add(key)

      // Voisins dans les 4 directions cardinales
      const neighbors = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
      ]

      for (const nb of neighbors) {
        const nbKey = `${nb.x},${nb.y}`
        if (visited.has(nbKey)) continue

        const cost = grid.getEffectiveCost(nb.x, nb.y)
        if (cost === Infinity) continue

        const tentativeG = current.g + cost
        const bestG = gScore.get(nbKey)

        if (bestG !== undefined && tentativeG >= bestG) continue

        cameFrom.set(nbKey, { x: current.x, y: current.y })
        gScore.set(nbKey, tentativeG)
        const h = this.heuristic(nb.x, nb.y, ex, ey)
        openSet.push({ x: nb.x, y: nb.y, g: tentativeG, f: tentativeG + h })
      }
    }

    return []
  }

  /** Heuristique Manhattan : distance absolue en grille */
  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2)
  }

  private reconstructPath(
    cameFrom: Map<string, { x: number; y: number }>,
    ex: number, ey: number
  ): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [{ x: ex, y: ey }]
    let current = `${ex},${ey}`
    while (cameFrom.has(current)) {
      const prev = cameFrom.get(current)!
      path.unshift(prev)
      current = `${prev.x},${prev.y}`
    }
    return path
  }
}
