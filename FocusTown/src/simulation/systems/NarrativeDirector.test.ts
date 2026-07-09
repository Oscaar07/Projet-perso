import { describe, it, expect, vi } from 'vitest'
import { NarrativeDirector } from './NarrativeDirector'
import type { Citizen } from '../entities/Citizen'
import type { Building } from '../entities/Building'

function makeCitizen(overrides?: Partial<Citizen>): Citizen {
  return {
    id: 'test', name: 'T', x: 0, y: 0, prevX: 0, prevY: 0,
    energy: 100, hunger: 100, hygiene: 100, fun: 100,
    money: 100, health: 100, isSick: false,
    mood: 100, stress: 0, motivation: 100,
    procrastination: 0, burnout: 0,
    anxiety: 0, discipline: 50, confidence: 50, perfectionism: 50,
    relationships: [], emotionalState: 'neutral', job: 'developer',
    homeX: 0, homeY: 0, workX: 5, workY: 5,
    restaurantX: 3, restaurantY: 3,
    targetX: 5, targetY: 5, path: [],
    currentAction: '', chronotype: 'morning',
    workDesire: 0, sleepDesire: 0,
    personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 },
    memories: [], habits: { work: 0, relax: 0, socialize: 0, wander: 0 },
    movingTicks: 0, facingDirection: 'down',
    birthTick: 0, age: 100, lifeStage: "adult", isAlive: true,
    ...overrides,
  }
}

function makeBuilding(overrides?: Partial<Building>): Building {
  return {
    id: 'b1', type: 'house', x: 0, y: 0,
    capacity: 4, comfort: 50, cleanliness: 100,
    ...overrides,
  }
}

describe('NarrativeDirector', () => {
  it('ne retourne pas d\'événement actif au tick 0', () => {
    const director = new NarrativeDirector()
    const result = director.update([makeCitizen()], [makeBuilding()], 'sunny', 1000, 1, 1)
    expect(result.activeEvent).toBeNull()
  })

  it('ne retourne pas d\'événement avant 100 ticks', () => {
    const director = new NarrativeDirector()
    let result: any = null
    for (let tick = 1; tick <= 99; tick++) {
      result = director.update([makeCitizen()], [makeBuilding()], 'sunny', 1000, tick, 1)
    }
    expect(result!.activeEvent).toBeNull()
  })

  it('retourne calme pendant une longue période paisible', () => {
    const director = new NarrativeDirector()
    let result: any = null
    for (let tick = 1; tick <= 500; tick++) {
      result = director.update([makeCitizen()], [makeBuilding()], 'sunny', 1000, tick, 1)
    }
    expect(result!.activeEvent).toBeNull()
  })

  it('déclenche un incendie pendant un orage avec beaucoup de bâtiments', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const director = new NarrativeDirector()
    const citizens = [makeCitizen()]
    const buildings = Array.from({ length: 10 }, (_, i) => makeBuilding({ id: `b${i}` }))
    let result: any = null
    for (let tick = 1; tick <= 140; tick++) {
      result = director.update(citizens, buildings, 'storm', 1000, tick, 1)
    }
    expect(result!.activeEvent).not.toBeNull()
    expect(result!.activeEvent!.type).toBe('fire')
    vi.restoreAllMocks()
  })

  it('ne déclenche pas d\'événement si calme gagne', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const director = new NarrativeDirector()
    const citizens = [makeCitizen()]
    const buildings = [makeBuilding()]
    let result: any = null
    for (let tick = 1; tick <= 150; tick++) {
      result = director.update(citizens, buildings, 'sunny', 2000, tick, 1)
    }
    expect(result!.activeEvent).toBeNull()
    vi.restoreAllMocks()
  })
})
