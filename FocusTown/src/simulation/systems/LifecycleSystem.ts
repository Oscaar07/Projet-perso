import { Citizen } from "../entities/Citizen";

export interface DeathRecord {
    citizenId: string;
    name: string;
    cause: string;
    age: number;
    day: number;
    job: string;
}

export class LifecycleSystem {
    update(citizens: Citizen[], tick: number, day:number): { aliveCitizens: Citizen[]; deaths: DeathRecord[]} {
        const deaths: DeathRecord[] = []
        const aliveCitizens: Citizen[] =[]

        for(const citizen of citizens){
            citizen.age = tick - citizen.birthTick

            if (citizen.age < 50) {
                citizen.lifeStage = "child"
            } else if(citizen.age < 600){
                citizen.lifeStage = "adult"
            } else {
                citizen.lifeStage = "elder"
            }

            let shouldDie = false
            let cause = ""

            if(citizen.health <= 0) {
                shouldDie = true;
                cause = "sickness"
            }

            if(citizen.lifeStage === "elder" && citizen.stress > 80){
                if(Math.random() < 0.001){
                    shouldDie = true
                    cause = "old_age"
                }
            }

            if(shouldDie) {
                citizen.isAlive = false
                citizen.deathTick = tick
                citizen.deathCause = cause
                deaths.push({
                    citizenId: citizen.id,
                    name: citizen.name,
                    cause,
                    age: citizen.age,
                    day,
                    job: citizen.job
                })} else {
                    aliveCitizens.push(citizen)
                }
            }
        return { aliveCitizens, deaths }
    }
}