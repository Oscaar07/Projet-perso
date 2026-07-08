import { describe, it, expect, vi } from 'vitest';
import { ActionTargetSystem } from './ActionTargetSystem';
import type { Citizen } from '../entities/Citizen';
import type { Building } from '../entities/Building';

function makeCitizen(overrides?: Partial<Citizen>): Citizen {
  return {
    id: 'test', name: 'T', x: 0, y: 0, prevX: 0, prevY: 0,
    energy: 100, hunger: 100, hygiene: 100, fun: 100,
    money: 100, health: 100, isSick: false,
    mood: 100, stress: 0, motivation: 100,
    procrastination: 0, burnout: 0,
    anxiety: 0, discipline: 50, confidence: 50, perfectionism: 50,
    relationships: [], emotionalState: 'neutral', job: 'developer',
    homeX: 5, homeY: 5, workX: 10, workY: 10,
    restaurantX: 15, restaurantY: 15,
    targetX: 0, targetY: 0, path: [{ x: 1, y: 0 }],
    currentAction: '', chronotype: 'morning',
    workDesire: 0, sleepDesire: 0,
    personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 },
    memories: [], habits: { work: 0, relax: 0, socialize: 0, wander: 0 },
    movingTicks: 0, facingDirection: 'down',
    ...overrides,
  };
}

function makeHouse(id: string, x: number, y: number): Building {
  return { id, type: 'house', x, y, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4 };
}
function makeOffice(id: string, x: number, y: number): Building {
  return { id, type: 'office', x, y, capacity: 999, comfort: 50, cleanliness: 100 };
}
function makeRestaurant(id: string, x: number, y: number): Building {
  return { id, type: 'restaurant', x, y, capacity: 999, comfort: 50, cleanliness: 100 };
}

describe('ActionTargetSystem', () => {
  const system = new ActionTargetSystem();

  it('ne fait rien si movingTicks > 0', () => {
    const citizens = [makeCitizen({ movingTicks: 1, targetX: 0, targetY: 0, path: [{ x: 1, y: 0 }] })];
    system.update(citizens, []);
    expect(citizens[0].targetX).toBe(0);
    expect(citizens[0].targetY).toBe(0);
    expect(citizens[0].path).toHaveLength(1);
  });

  it('cible sleep = home', () => {
    const citizens = [makeCitizen({
      energy: 0, sleepDesire: 60, stress: 0, targetX: 0, targetY: 0, path: [],
    })];
    system.update(citizens, []);
    expect(citizens[0].currentAction).toBe('sleep');
    expect(citizens[0].targetX).toBe(5);
    expect(citizens[0].targetY).toBe(5);
  });

  it('cible eat = restaurant', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const citizens = [makeCitizen({
      hunger: 0, energy: 100, sleepDesire: 0, targetX: 0, targetY: 0, path: [],
    })];
    const buildings = [makeRestaurant('r1', 20, 20)];
    system.update(citizens, buildings);
    expect(citizens[0].currentAction).toBe('eat');
    expect(citizens[0].targetX).toBe(20);
    expect(citizens[0].targetY).toBe(20);
    vi.restoreAllMocks();
  });

  it('eat sans restaurant utilise restaurantX/Y du citoyen', () => {
    const citizens = [makeCitizen({
      hunger: 0, energy: 100, sleepDesire: 0, targetX: 0, targetY: 0, path: [],
    })];
    system.update(citizens, []);
    expect(citizens[0].currentAction).toBe('eat');
    expect(citizens[0].targetX).toBe(15);
    expect(citizens[0].targetY).toBe(15);
  });

  it('cible work = workX/workY', () => {
    const citizens = [makeCitizen({
      energy: 100, hunger: 100, sleepDesire: 0, workDesire: 40, motivation: 100,
      discipline: 50, perfectionism: 10, stress: 0, burnout: 0,
      targetX: 0, targetY: 0, path: [],
    })];
    system.update(citizens, []);
    expect(citizens[0].currentAction).toBe('work');
    expect(citizens[0].targetX).toBe(10);
    expect(citizens[0].targetY).toBe(10);
  });

  it('cible socialize = maison aléatoire', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const citizens = [makeCitizen({
      mood: 0, energy: 100, hunger: 100, sociability: 1, confidence: 50,
      targetX: 0, targetY: 0, path: [],
    })];
    const buildings = [makeHouse('h2', 25, 25)];
    system.update(citizens, buildings);
    expect(citizens[0].currentAction).toBe('socialize');
    expect(citizens[0].targetX).toBe(25);
    expect(citizens[0].targetY).toBe(25);
    vi.restoreAllMocks();
  });

  it('cible relax = home', () => {
    const citizens = [makeCitizen({
      stress: 100, fun: 0, burnout: 100, targetX: 0, targetY: 0, path: [],
    })];
    system.update(citizens, []);
    expect(citizens[0].currentAction).toBe('relax');
    expect(citizens[0].targetX).toBe(5);
    expect(citizens[0].targetY).toBe(5);
  });

  it('cible wander = position aléatoire proche', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const citizens = [makeCitizen({
      x: 10, y: 10, energy: 100, hunger: 100, mood: 100, stress: 0, fun: 100,
      burnout: 0, sleepDesire: 0, workDesire: 0,
      personality: { diligence: 0, sociability: 0, laziness: 0 },
      confidence: 0, motivation: 0, discipline: 0, perfectionism: 0, anxiety: 0,
      habits: { work: 0, relax: 0, socialize: 0, wander: 0 },
      targetX: 0, targetY: 0, path: [],
    })];
    system.update(citizens, []);
    expect(citizens[0].currentAction).toBe('wander');
    expect(citizens[0].targetX).toBe(9);
    expect(citizens[0].targetY).toBe(9);
    vi.restoreAllMocks();
  });

  it('réinitialise le chemin si la cible change', () => {
    const citizens = [makeCitizen({
      energy: 0, sleepDesire: 60, stress: 0,
      targetX: 0, targetY: 0, path: [{ x: 1, y: 0 }, { x: 2, y: 0 }],
    })];
    system.update(citizens, []);
    expect(citizens[0].path).toHaveLength(0);
  });

  it('garde le chemin si la cible ne change pas', () => {
    const citizens = [makeCitizen({
      energy: 0, sleepDesire: 60, stress: 0,
      homeX: 0, homeY: 0, targetX: 0, targetY: 0, path: [{ x: 1, y: 0 }],
    })];
    system.update(citizens, []);
    expect(citizens[0].path).toHaveLength(1);
  });
});
