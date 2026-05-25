import { Citizen } from "../entities/Citizen"

export class ProcrastinationSystem {

  update(citizens: Citizen[]) {

    citizens.forEach((citizen) => {

        if (citizen.currentAction === "wander") {
          citizen.procrastination += 0.2
        }

        if (citizen.currentAction === "relax") {
          citizen.procrastination += 0.1
          citizen.burnout -= 0.1
        }

        if (citizen.currentAction === "work") {
          citizen.procrastination -= 0.3
        }
        
        if(citizen.stress > 70 && citizen.energy < 30) {
          citizen.burnout += 0.2
        }

        citizen.procrastination = Math.max(0, Math.min(100, citizen.procrastination))
        citizen.burnout = Math.max(0, Math.min(100, citizen.burnout))
        
      }
    )
  }
}