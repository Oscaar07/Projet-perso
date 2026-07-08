/**
 * Système de mémoire épisodique : chaque citoyen stocke des souvenirs
 * marquants (bons ou mauvais) qui influencent ses décisions futures.
 *
 * Fonctionnement :
 * - Quand le mood > 80 : enregistre un souvenir social positif
 * - Quand le stress > 80 : enregistre un souvenir de travail négatif
 * - Les souvenirs de plus de 500 ticks sont oubliés
 * - Maximum 30 souvenirs (file, les plus vieux sont dépriorisés)
 *
 * L'IA utilitaire (UtilityAI) consulte ces souvenirs pour ajuster les
 * scores des actions. Un citoyen avec beaucoup de souvenirs négatifs au
 * travail aura tendance à éviter de travailler.
 */
import { Citizen } from "../entities/Citizen";

export class MemorySystem {
    update(citizens: Citizen[], tick: number) {

        citizens.forEach((citizen) => {
            if(citizen.mood  > 80) {
                citizen.memories.push({
                    type: "social",
                    value: 10,
                    timestamp: tick,
                })
            }
            if(citizen.stress > 80) {
                citizen.memories.push({
                    type: "work",
                    value: -10,
                    timestamp: tick,
                })
            }

            // L'oubli : les souvenirs trop anciens ne sont plus pertinents
            // pour la prise de décision. Fenêtre de 500 ticks.
            citizen.memories = citizen.memories.filter((memory) => memory.timestamp > tick - 500)

            // Plafond mémoire pour éviter une croissance infinie
            if(citizen.memories.length > 30) {
                citizen.memories.shift()
            }
        })
    }
}
