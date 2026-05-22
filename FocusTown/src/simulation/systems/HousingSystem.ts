import { Citizen } from "../entities/Citizen"
import { Building } from "../entities/Building"

export class HousingSystem {
  update(citizens: Citizen[], buildings: Building[]) {
    citizens.forEach((citizen) => {
      const home = buildings.find((b) => b.id === citizen.homeId)

      if (!home) return

      const atHome = Math.abs(citizen.x - home.x) < 1 && Math.abs(citizen.y - home.y) < 1;

      if (!atHome) return

      citizen.energy += 0.03 * (home.comfort / 100);

      citizen.mood += 0.02 * (home.comfort / 100);

      citizen.health += 0.01 * (home.cleanliness / 100);

      if (citizen.energy > 70 && home.cleanliness < 60) {
        home.cleanliness += 0.01;
        citizen.energy -= 0.02;
      }

      if (citizen.energy > 100) {
        citizen.energy = 100;
      }

      if (citizen.mood > 100) {
        citizen.mood = 100;
      }

      if (citizen.health > 100) {
        citizen.health = 100;
      }

      home.cleanliness -= 0.005;

      if (home.cleanliness < 0) {
        home.cleanliness = 0;
      }
    })
  }
}