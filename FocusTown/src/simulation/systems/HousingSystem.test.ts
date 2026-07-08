import { describe, it, expect } from 'vitest';
import { HousingSystem } from './HousingSystem';
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
    homeX: 0, homeY: 0, workX: 5, workY: 5,
    restaurantX: 3, restaurantY: 3,
    targetX: 5, targetY: 5, path: [],
    currentAction: '', chronotype: 'morning',
    workDesire: 0, sleepDesire: 0,
    personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 },
    memories: [], habits: { work: 0, relax: 0, socialize: 0, wander: 0 },
    movingTicks: 0, facingDirection: 'down',
    ...overrides,
  };
}

function makeHome(id: string, x: number, y: number, overrides?: Partial<Building>): Building {
  return {
    id, type: 'house', x, y, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    ...overrides,
  };
}

describe('HousingSystem', () => {
  const system = new HousingSystem();

  it('augmente energy, mood et health quand à la maison', () => {
    const home = makeHome('h1', 5, 5, { comfort: 100, cleanliness: 100 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 50, mood: 50, health: 50 })];
    system.update(citizens, [home]);
    expect(citizens[0].energy).toBeCloseTo(50.03);
    expect(citizens[0].mood).toBeCloseTo(50.02);
    expect(citizens[0].health).toBeCloseTo(50.01);
  });

  it('aucun effet si pas à la maison (distance >= 1)', () => {
    const home = makeHome('h1', 5, 5);
    const citizens = [makeCitizen({ homeId: 'h1', x: 3, y: 5, energy: 50, mood: 50, health: 50 })];
    system.update(citizens, [home]);
    expect(citizens[0].energy).toBe(50);
    expect(citizens[0].mood).toBe(50);
    expect(citizens[0].health).toBe(50);
  });

  it('aucun effet sans maison', () => {
    const citizens = [makeCitizen({ x: 5, y: 5, energy: 50 })];
    system.update(citizens, []);
    expect(citizens[0].energy).toBe(50);
  });

  it('nettoyage quand energy > 70 et cleanliness < 60', () => {
    const home = makeHome('h1', 5, 5, { comfort: 0, cleanliness: 50 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 80 })];
    system.update(citizens, [home]);
    expect(home.cleanliness).toBeCloseTo(50.005);
    expect(citizens[0].energy).toBeCloseTo(79.98);
  });

  it('pas de nettoyage si energy <= 70', () => {
    const home = makeHome('h1', 5, 5, { cleanliness: 50 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 70 })];
    system.update(citizens, [home]);
    expect(home.cleanliness).toBeCloseTo(50, 1);
  });

  it('pas de nettoyage si cleanliness >= 60', () => {
    const home = makeHome('h1', 5, 5, { cleanliness: 60 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 80 })];
    system.update(citizens, [home]);
    expect(home.cleanliness).toBeCloseTo(60, 1);
  });

  it('energy, mood et health ne dépassent pas 100', () => {
    const home = makeHome('h1', 5, 5, { comfort: 100, cleanliness: 100 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 100, mood: 100, health: 100 })];
    system.update(citizens, [home]);
    expect(citizens[0].energy).toBe(100);
    expect(citizens[0].mood).toBe(100);
    expect(citizens[0].health).toBe(100);
  });

  it('cleanliness diminue de 0.005 par tick', () => {
    const home = makeHome('h1', 5, 5, { cleanliness: 100 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5 })];
    system.update(citizens, [home]);
    expect(home.cleanliness).toBeCloseTo(99.995);
  });

  it('cleanliness ne descend pas sous 0', () => {
    const home = makeHome('h1', 5, 5, { comfort: 0, cleanliness: 0 });
    const citizens = [makeCitizen({ homeId: 'h1', x: 5, y: 5, energy: 50 })];
    system.update(citizens, [home]);
    expect(home.cleanliness).toBe(0);
  });
});
