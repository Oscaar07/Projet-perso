import { describe, it, expect } from 'vitest';
import { HealthSystem } from './HealthSystem';
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

describe('HealthSystem', () => {
  const system = new HealthSystem();

  it('réduit health de 0.03 si energy < 20', () => {
    const citizens = [makeCitizen({ energy: 10, health: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(99.97);
  });

  it('réduit health de 0.02 si hunger < 20', () => {
    const citizens = [makeCitizen({ hunger: 10, health: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(99.98);
  });

  it('réduit health de 0.04 si stress > 80', () => {
    const citizens = [makeCitizen({ stress: 90, health: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(99.96);
  });

  it('réduit health de 0.01 si fun < 20', () => {
    const citizens = [makeCitizen({ fun: 10, health: 100, stress: 50, energy: 100, hunger: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(99.99);
  });

  it('cumule les pénalités', () => {
    const citizens = [makeCitizen({ energy: 10, hunger: 10, stress: 90, fun: 10, health: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(99.9, 2);
  });

  it('guérit de 0.05 si energy > 80, hunger > 80 et stress < 30', () => {
    const citizens = [makeCitizen({ energy: 90, hunger: 90, stress: 20, health: 50 })];
    system.update(citizens);
    expect(citizens[0].health).toBeCloseTo(50.05);
  });

  it('isSick = true quand health < 50', () => {
    const citizens = [makeCitizen({ health: 49, isSick: false })];
    system.update(citizens);
    expect(citizens[0].isSick).toBe(true);
  });

  it('isSick = false quand health > 70', () => {
    const citizens = [makeCitizen({ health: 71, isSick: true })];
    system.update(citizens);
    expect(citizens[0].isSick).toBe(false);
  });

  it('isSick ne change pas entre 50 et 70', () => {
    const sick = [makeCitizen({ health: 60, isSick: true })];
    system.update(sick);
    expect(sick[0].isSick).toBe(true);

    const healthy = [makeCitizen({ health: 60, isSick: false })];
    system.update(healthy);
    expect(healthy[0].isSick).toBe(false);
  });

  it('health ne descend pas sous 0', () => {
    const citizens = [makeCitizen({ energy: 10, hunger: 10, stress: 90, fun: 10, health: 0 })];
    system.update(citizens);
    expect(citizens[0].health).toBe(0);
  });

  it('health ne dépasse pas 100', () => {
    const citizens = [makeCitizen({ energy: 90, hunger: 90, stress: 20, health: 100 })];
    system.update(citizens);
    expect(citizens[0].health).toBe(100);
  });
});
