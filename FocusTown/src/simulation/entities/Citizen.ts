import { Memory } from "../ai/Memory";

export type JobType =
  | "developer"
  | "artist"
  | "engineer"
  | "merchant"
  | "scientist"

export interface Relationship {
    citizenId: string;
    friendship: number;
}

export type Citizen = { 
    id: string;
    name: string;
    x: number;
    y: number;
    energy: number;
    mood: number;
    homeX: number;
    homeY: number;
    workX: number;
    workY: number;
    targetX: number;
    targetY: number;
    hunger: number;
    restaurantX: number;
    restaurantY: number;
    money:number;
    path: {x: number, y: number}[];
    personality: {
        diligence: number
        sociability: number
        laziness: number
      }
    relationships: Relationship[];
    job: JobType;
    stress: number;
    motivation: number;
    hygiene: number;
    fun: number;
    health: number;
    isSick: boolean;
    homeId?: string;
    currentAction: string;
    chronotype: "morning" | "night";
    workDesire: number;
    sleepDesire: number;
    memories: Memory[];
    procrastination: number;
    burnout: number;
 }