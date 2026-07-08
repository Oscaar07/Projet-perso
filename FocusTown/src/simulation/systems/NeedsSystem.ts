/**
 * Décroissance et régénération des besoins vitaux des citoyens.
 *
 * Ce système est le cœur du gameplay : il gère la dégradation progressive
 * des jauges (faim, énergie, hygiène, fun, stress) et ajuste le moral
 * (mood) et la motivation. Les autres systèmes (ProductivityInfluence,
 * Social, Housing, Job) modifient aussi le mood via += ; on ne fait donc
 * qu'une convergence douce vers le baseline (énergie + faim) / 2 plutôt
 * qu'un écrasement.
 *
 * Toutes les jauges sont clampées entre 0 et 100 après mise à jour.
 */
import { Citizen } from "../entities/Citizen";
import { Weather } from "../world/Weather";

export class NeedsSystem {

    update(citizens: Citizen[], weather: Weather) {
        citizens.forEach((citizen) => {

            // Décroissance métabolique de base
            citizen.energy -= 0.02 + citizen.personality.diligence * 0.05
            citizen.hunger -= 0.03

            // Convergence douce du mood vers le baseline énergie/faim.
            // On n'écrase pas la valeur (permet aux autres systèmes de
            // contribuer au mood sans être annulés au tick suivant).
            const targetMood = (citizen.energy + citizen.hunger) / 2
            citizen.mood += (targetMood - citizen.mood) * 0.1

            // Influences sociales et environnementales
            citizen.mood += citizen.personality.sociability * 0.02

            if(weather === "rain") {
                citizen.mood -= 0.01
            }
            if(weather === "sunny") {
                citizen.mood += 0.01
            }

            citizen.hygiene -= 0.02
            citizen.fun -= 0.03

            // Le manque de loisir affecte le moral
            if(citizen.fun < 30) {
                citizen.mood -= 0.05
            }

            // Le stress augmente avec la paresse (les tâches non faites
            // s'accumulent mentalement)
            citizen.stress += citizen.personality.laziness * 0.02

            // Seuils de stress : plus le stress est haut, plus le moral
            // est impacté négativement
            if (citizen.stress > 70) {
                citizen.mood -= 0.08
              }

            // Motivation = état d'esprit général corrigé par le stress
            citizen.motivation = citizen.mood - citizen.stress * 0.5

            // La procrastination érode la motivation sur le long terme
            citizen.motivation -= citizen.procrastination * 0.001

            // État critique : surmenage + épuisement = effondrement
            if(citizen.stress > 90 && citizen.energy < 20){
                citizen.mood -= 0.2
                citizen.motivation -= 0.2
            }

            // Mécanisme de survie : manger quand la faim est trop basse
            // Coûte de l'argent, mais restaure 40 points de faim
            if (citizen.hunger < 30) {
                if (citizen.money >= 10) {
                    citizen.money -= 10
                    citizen.hunger += 40
                    if (citizen.hunger > 100) citizen.hunger = 100
                    citizen.mood += 5
                }
            }

            // L'isolement social affecte le moral
            if(citizen.relationships.length === 0) {
                citizen.mood -= 0.05
            }

            // Clamp toutes les jauges entre 0 et 100 pour éviter les
            // débordements qui casseraient les calculs de scoring
            if (citizen.motivation < 0) citizen.motivation = 0
            if (citizen.motivation > 100) citizen.motivation = 100

            if(citizen.hunger > 100) citizen.hunger = 100
            if(citizen.hunger < 0) citizen.hunger = 0

            if(citizen.energy > 100) citizen.energy = 100
            if(citizen.energy < 0) citizen.energy = 0

            if(citizen.procrastination > 100) citizen.procrastination = 100
            if(citizen.procrastination < 0) citizen.procrastination = 0

            if(citizen.mood < 0) citizen.mood = 0
            if(citizen.mood > 100) citizen.mood = 100
        })
    }
}
