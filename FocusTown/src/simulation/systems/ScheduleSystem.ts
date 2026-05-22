import { Citizen } from "../entities/Citizen"

export class ScheduleSystem {

  update(citizens: Citizen[], time: number) {

    citizens.forEach((citizen) => {

      citizen.workDesire = 0
      citizen.sleepDesire = 0

      if (citizen.chronotype === "morning") {

        if (time >= 7 && time <= 17) {
          citizen.workDesire = 40
        }

        if (time >= 21 || time <= 6) {
          citizen.sleepDesire = 60
        }

        if (time >= 12 && time <= 13) {
            citizen.hunger -= 0.1
        }
      }

      if (citizen.chronotype === "night") {

        if (time >= 10 && time <= 20) {
          citizen.workDesire = 40
        }

        if (time >= 1 && time <= 9) {
          citizen.sleepDesire = 60
        }
        if (time >= 12 && time <= 13) {
            citizen.hunger -= 0.1
        }
      }
    })
  }
}