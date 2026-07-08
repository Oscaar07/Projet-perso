import { describe, it, expect } from 'vitest';
import { LocationEffectSystem } from './LocationEffectSystem';
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

describe('LocationEffectSystem', () => {
  const system = new LocationEffectSystem();

  it('augmente energy de 0.1 quand à la maison', () => {
    const citizens = [makeCitizen({ x: 0, y: 0, homeX: 0, homeY: 0, energy: 50 })];
    system.update(citizens);
    expect(citizens[0].energy).toBeCloseTo(50.1);
  });

  it('augmente hunger de 0.2 quand au restaurant', () => {
    const citizens = [makeCitizen({ x: 3, y: 3, restaurantX: 3, restaurantY: 3, hunger: 50 })];
    system.update(citizens);
    expect(citizens[0].hunger).toBeCloseTo(50.2);
  });

  it('les deux effets s\'appliquent si même position', () => {
    const citizens = [makeCitizen({ x: 0, y: 0, homeX: 0, homeY: 0, restaurantX: 0, restaurantY: 0, energy: 50, hunger: 50 })];
    system.update(citizens);
    expect(citizens[0].energy).toBeCloseTo(50.1);
    expect(citizens[0].hunger).toBeCloseTo(50.2);
  });

  it('aucun effet si pas à la maison ni au restaurant', () => {
    const citizens = [makeCitizen({ x: 10, y: 10, homeX: 0, homeY: 0, restaurantX: 3, restaurantY: 3, energy: 50, hunger: 50 })];
    system.update(citizens);
    expect(citizens[0].energy).toBe(50);
    expect(citizens[0].hunger).toBe(50);
  });

  it('seuil de distance < 0.5', () => {
    const near = [makeCitizen({ x: 0.49, y: 0, homeX: 0, homeY: 0, energy: 50 })];
    system.update(near);
    expect(near[0].energy).toBeGreaterThan(50);

    const far = [makeCitizen({ x: 0.5, y: 0, homeX: 0, homeY: 0, energy: 50 })];
    system.update(far);
    expect(far[0].energy).toBe(50);
  });

  it('ne dépasse pas 100', () => {
    const citizens = [makeCitizen({ x: 0, y: 0, homeX: 0, homeY: 0, energy: 100 })];
    system.update(citizens);
    expect(citizens[0].energy).toBe(100);
  });
});
