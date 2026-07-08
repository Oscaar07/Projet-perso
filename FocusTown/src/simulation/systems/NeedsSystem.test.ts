import { describe, it, expect } from 'vitest';
import { NeedsSystem } from './NeedsSystem';
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

describe('NeedsSystem', () => {
  const system = new NeedsSystem();

  it('diminue energy et hunger à chaque tick', () => {
    const citizens = [makeCitizen()];
    system.update(citizens, 'sunny');
    expect(citizens[0].energy).toBeLessThan(100);
    expect(citizens[0].hunger).toBeLessThan(100);
  });

  it('ne descend pas energy en dessous de 0', () => {
    const citizens = [makeCitizen({ energy: 0, hunger: 50, money: 0 })];
    system.update(citizens, 'sunny');
    expect(citizens[0].energy).toBe(0);
  });

  it('augmente le stress avec la paresse', () => {
    const citizens = [makeCitizen({ personality: { diligence: 0.5, sociability: 0.5, laziness: 0.9 }, stress: 0 })];
    system.update(citizens, 'sunny');
    expect(citizens[0].stress).toBeGreaterThan(0);
  });

  it('réduit le mood sous la pluie', () => {
    const citizens = [makeCitizen({ mood: 100, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } })];
    system.update(citizens, 'rain');
    expect(citizens[0].mood).toBeLessThan(100);
  });

  it('augmente le mood au soleil', () => {
    const citizens = [makeCitizen({ mood: 50, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } })];
    system.update(citizens, 'sunny');
    expect(citizens[0].mood).toBeGreaterThan(50);
  });

  it('dépense de l\'argent quand la faim est trop basse', () => {
    const citizens = [makeCitizen({ hunger: 20, money: 100 })];
    system.update(citizens, 'sunny');
    expect(citizens[0].money).toBeLessThan(100);
    expect(citizens[0].hunger).toBeGreaterThan(20);
  });

  it('ne déclenche pas d\'achat si pas assez d\'argent', () => {
    const citizens = [makeCitizen({ hunger: 20, money: 5 })];
    system.update(citizens, 'sunny');
    expect(citizens[0].money).toBe(5);
  });

  it('réduit le moral en cas d\'isolement social', () => {
    const citizens = [makeCitizen({ mood: 100, relationships: [] })];
    system.update(citizens, 'sunny');
    expect(citizens[0].mood).toBeLessThan(100);
  });
});
