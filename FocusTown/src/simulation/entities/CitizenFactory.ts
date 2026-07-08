import {Citizen, JobType} from "./Citizen"
import {Building} from "./Building"

const jobs : JobType[] = ["developer", "artist", "engineer", "merchant", "scientist"]

export function createCitizen(params: {name: string, home: Building, workplace?: Building, restaurant?: Building}): Citizen {
    const workplace = params.workplace ?? params.home
    const restaurant = params.restaurant ?? params.home
    const job = jobs[Math.floor(Math.random() * jobs.length)]
    
    return {
        id: crypto.randomUUID(),
        
          name: params.name,
        
          x: params.home.x,
          y: params.home.y,

          prevX: params.home.x,
          prevY: params.home.y,
        
          targetX: workplace.x,
          targetY: workplace.y,
        
          homeX: params.home.x,
          homeY: params.home.y,
        
          workX: workplace.x,
          workY: workplace.y,
        
          restaurantX: restaurant.x,
          restaurantY: restaurant.y,
        
          energy: 100,
          hunger: 100,
          mood: 100,
          money: 100,
        
          path: [],
          personality: {
            diligence: Math.random(),
            sociability: Math.random(),
            laziness: Math.random(),
          },
          relationships: [],
          job: job,
          stress: 0,
          motivation: 100,
          hygiene: 100,
          fun: 100,
          health: 100,
          isSick: false,
          homeId: params.home.id,
          currentAction: "",
          chronotype: Math.random() < 0.5 ? "morning" : "night",
          workDesire: 0,
          sleepDesire: 0,
          memories: [],
          procrastination: 0,
          burnout: 0,
          habits: {
            work: 0,
            relax: 0,
            socialize: 0,
            wander: 0,
          },
          discipline: Math.random()*100,
          anxiety: Math.random()*100,
          confidence: Math.random()*100,
          perfectionism: Math.random()*100,
          emotionalState: "neutral",
          movingTicks: 0,
          facingDirection: "down",
    }
}
