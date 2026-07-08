import { describe, it, expect } from 'vitest';
import { CityFinanceSystem } from './CityFinanceSystem';
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

describe('CityFinanceSystem', () => {
  const system = new CityFinanceSystem();

  it('collecte 0.1% de l\'argent des citoyens', () => {
    const citizens = [makeCitizen({ money: 1000 })];
    const result = system.update({ citizens, buildings: [], cityMoney: 0 });
    expect(result.cityMoney).toBeCloseTo(1);
    expect(citizens[0].money).toBeCloseTo(999);
  });

  it('calcule l\'upkeep des bâtiments', () => {
    const buildings: Building[] = [
      { id: 'h1', type: 'house', x: 0, y: 0, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4 },
      { id: 'o1', type: 'office', x: 1, y: 0, capacity: 999, comfort: 50, cleanliness: 100 },
      { id: 'r1', type: 'restaurant', x: 2, y: 0, capacity: 999, comfort: 50, cleanliness: 100 },
    ];
    // upkeep = (1 + 2 + 3) * 0.01 = 0.06
    const result = system.update({ citizens: [], buildings, cityMoney: 100 });
    expect(result.cityMoney).toBeCloseTo(99.94);
  });

  it('combine taxes et upkeep', () => {
    const citizens = [makeCitizen({ money: 1000 })];
    const buildings: Building[] = [{ id: 'h1', type: 'house', x: 0, y: 0, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4 }];
    const result = system.update({ citizens, buildings, cityMoney: 50 });
    // 50 + 1 (tax) - 0.01 (upkeep) = 50.99
    expect(result.cityMoney).toBeCloseTo(50.99);
  });

  it('cityMoney peut devenir négatif', () => {
    const buildings: Building[] = [{ id: 'o1', type: 'office', x: 0, y: 0, capacity: 999, comfort: 50, cleanliness: 100 }];
    const result = system.update({ citizens: [], buildings, cityMoney: 0 });
    expect(result.cityMoney).toBeLessThan(0);
  });

  it('pas de taxe si citoyens sans argent', () => {
    const citizens = [makeCitizen({ money: 0 })];
    const result = system.update({ citizens, buildings: [], cityMoney: 0 });
    expect(result.cityMoney).toBe(0);
  });
});
