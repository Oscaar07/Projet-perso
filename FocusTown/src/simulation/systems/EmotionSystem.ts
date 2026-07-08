/**
 * Déduit l'état émotionnel d'un citoyen à partir de ses jauges internes.
 *
 * Les états sont mutuellement exclusifs et hiérarchiques :
 *   1. burnout  → priorité max (surcharge de travail)
 *   2. anxious  → anxiété élevée
 *   3. sad      → moral bas
 *   4. happy    → moral haut
 *   5. neutral  → état par défaut
 *
 * L'état émotionnel est utilisé par le rendu (couleur du cercle citoyen)
 * et par UtilityAI pour pondérer les décisions (un citoyen burnout ne
 * prendra pas les mêmes décisions qu'un citoyen heureux).
 */
import { Citizen } from "../entities/Citizen";

export class EmotionSystem {
    update(citizens: Citizen[]) {
        citizens.forEach((citizen) => {
            if(citizen.burnout > 70) {
                citizen.emotionalState = "burnout"
                return
            }
            if(citizen.anxiety > 70) {
                citizen.emotionalState = "anxious"
                return
            }
            if(citizen.mood < 30) {
                citizen.emotionalState = "sad"
                return
            }
            if(citizen.mood > 70) {
                citizen.emotionalState = "happy"
                return
            }
            citizen.emotionalState = "neutral"
        })
    }
}
