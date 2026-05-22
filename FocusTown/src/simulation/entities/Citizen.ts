import { Memory } from "../ai/Memory";

export type JobType =
  | "developer"
  | "artist"
  | "engineer"
  | "merchant"
  | "scientist"

export type Citizen = { 
    id: number;
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
    relationships: {
        citizenId: number;
        friendship: number;
    }[];
    job: JobType;
    stress: number;
    motivation: number;
    hygiene: number;
    fun: number;
    health: number;
    isSick: boolean;
    homeId: number;
    currentAction: string;
    chronotype: "morning" | "night";
    workDesire: number;
    sleepDesire: number;
    memories: Memory[];
 }