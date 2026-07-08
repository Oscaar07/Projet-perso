/**
 * Pont entre l'IA utilitaire et le système de déplacement.
 *
 * Chaque tick, pour chaque citoyen qui n'est pas en train de se déplacer
 * (movingTicks > 0), ce système interroge UtilityAI pour obtenir la
 * meilleure action, puis fixe la cible (targetX/targetY) correspondante.
 *
 * Si la cible change par rapport au tick précédent, le chemin en cours
 * est réinitialisé pour forcer un nouveau calcul par PathfindingSystem.
 */
import {Citizen} from "../entities/Citizen"
import {Building} from "../entities/Building"
import {UtilityAI} from "../ai/UtilityAI"
import { WORLD_WIDTH, WORLD_HEIGHT } from "../config/worldConfig"

export class ActionTargetSystem {
    private utilityAI = new UtilityAI()

    update(citizens: Citizen[], buildings: Building[]) {
        const restaurants = buildings.filter(b => b.type === "restaurant")
        const houses = buildings.filter(b => b.type === "house")

        citizens.forEach((citizen) => {
            // Blocage Pokémon-style : pas de nouvelle décision tant que le
            // citoyen n'a pas fini de se déplacer vers sa cible actuelle.
            if (citizen.movingTicks > 0) return

            const previousTargetX = citizen.targetX
            const previousTargetY = citizen.targetY
            const action = this.utilityAI.getBestAction(citizen)
            citizen.currentAction = action.type

            // Chaque type d'action correspond à un lieu cible dans le monde.
            // Les coordonnées sont en tiles, le PathfindingSystem s'occupe
            // de calculer le chemin pour y arriver.
            if(action.type === "sleep") {
                citizen.targetX = citizen.homeX
                citizen.targetY = citizen.homeY
            }else if(action.type === "eat") {
                const target = restaurants.length > 0
                    ? restaurants[Math.floor(Math.random() * restaurants.length)]
                    : { x: citizen.restaurantX, y: citizen.restaurantY }
                citizen.targetX = target.x
                citizen.targetY = target.y
                citizen.restaurantX = target.x
                citizen.restaurantY = target.y
            }else if(action.type === "work") {
                citizen.targetX = citizen.workX
                citizen.targetY = citizen.workY
            }else if(action.type === "socialize") {
                const target = houses.length > 0
                    ? houses[Math.floor(Math.random() * houses.length)]
                    : { x: citizen.homeX + 1, y: citizen.homeY + 1 }
                citizen.targetX = target.x
                citizen.targetY = target.y
            }else if(action.type === "relax") {
                citizen.targetX = citizen.homeX
                citizen.targetY = citizen.homeY
            }else if(action.type === "wander") {
                // Déplacement aléatoire dans un rayon d'1 tile autour du citoyen
                citizen.targetX = citizen.x + Math.floor(Math.random() * 3) - 1
                citizen.targetY = citizen.y + Math.floor(Math.random() * 3) - 1
                citizen.targetX = Math.max(0, Math.min(WORLD_WIDTH - 1, citizen.targetX))
                citizen.targetY = Math.max(0, Math.min(WORLD_HEIGHT - 1, citizen.targetY))
            }

            // Si la cible change, on vide la file de déplacement pour que
            // PathfindingSystem recalcule un nouveau chemin au prochain tick.
            if (citizen.targetX !== previousTargetX || citizen.targetY !== previousTargetY) {
                citizen.path = []
            }
        })
    }
}
