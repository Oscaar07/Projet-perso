import { Citizen } from "../entities/Citizen"

export class MovementSystem {
  update(citizens: Citizen[]) {
    citizens.forEach((citizen) => {
      if(citizen.x < citizen.targetX){
        citizen.x += 0.1
      }
      if(citizen.x > citizen.targetX){
        citizen.x -= 0.1
      }
      if(citizen.y < citizen.targetY){
        citizen.y += 0.1
      }
      if(citizen.y > citizen.targetY){
        citizen.y -= 0.1
      }
    })
  }
}