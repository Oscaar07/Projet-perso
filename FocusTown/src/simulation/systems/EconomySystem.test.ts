import { describe, it, expect } from 'vitest';
import { EconomySystem } from './EconomySystem';
import type { Citizen } from '../entities/Citizen';

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

describe('EconomySystem', () => {
  const system = new EconomySystem();

  it('verse un salaire quand le citoyen est à son travail', () => {
    const citizens = [makeCitizen({ x: 5, y: 5, workX: 5, workY: 5, money: 0 })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(0);
  });

  it('ne verse pas de salaire si le citoyen n\'est pas au travail', () => {
    const citizens = [makeCitizen({ x: 0, y: 0, workX: 5, workY: 5, money: 0 })];
    system.update(citizens);
    expect(citizens[0].money).toBe(0);
  });

  it('facture le restaurant quand le citoyen est au restaurant', () => {
    const citizens = [makeCitizen({ x: 3, y: 3, restaurantX: 3, restaurantY: 3, money: 10 })];
    system.update(citizens);
    expect(citizens[0].money).toBeLessThan(10);
  });

  it('ne descend pas l\'argent en dessous de 0', () => {
    const citizens = [makeCitizen({ x: 3, y: 3, restaurantX: 3, restaurantY: 3, money: 0 })];
    system.update(citizens);
    expect(citizens[0].money).toBe(0);
  });

  it('un citoyen diligent gagne plus au travail', () => {
    const diligent = makeCitizen({ x: 5, y: 5, workX: 5, workY: 5, money: 0, personality: { diligence: 0.9, sociability: 0.5, laziness: 0.1 } });
    const lazy = makeCitizen({ x: 5, y: 5, workX: 5, workY: 5, money: 0, personality: { diligence: 0.1, sociability: 0.5, laziness: 0.9 } });
    system.update([diligent]);
    system.update([lazy]);
    expect(diligent.money).toBeGreaterThan(lazy.money);
  });
});
