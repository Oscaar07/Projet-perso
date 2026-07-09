import { describe, it, expect, vi } from 'vitest';
import { LifecycleSystem } from './LifecycleSystem';
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
    birthTick: 0, age: 0, lifeStage: "adult", isAlive: true,
    ...overrides,
  };
}

describe('LifecycleSystem', () => {
  const system = new LifecycleSystem();

  it('enfant quand age < 50', () => {
    const citizens = [makeCitizen({ birthTick: 0 })];
    const { aliveCitizens } = system.update(citizens, 20, 1);
    expect(aliveCitizens[0].lifeStage).toBe('child');
  });

  it('adulte quand age entre 50 et 600', () => {
    const citizens = [makeCitizen({ birthTick: 0 })];
    const { aliveCitizens } = system.update(citizens, 200, 1);
    expect(aliveCitizens[0].lifeStage).toBe('adult');
  });

  it('elder quand age >= 600', () => {
    const citizens = [makeCitizen({ birthTick: 0 })];
    const { aliveCitizens } = system.update(citizens, 700, 1);
    expect(aliveCitizens[0].lifeStage).toBe('elder');
  });

  it('meurt si health <= 0', () => {
    const citizens = [makeCitizen({ birthTick: 0, health: 0 })];
    const { aliveCitizens, deaths } = system.update(citizens, 100, 5);
    expect(aliveCitizens).toHaveLength(0);
    expect(deaths).toHaveLength(1);
    expect(deaths[0].cause).toBe('sickness');
  });

  it('reste vivant si health > 0', () => {
    const citizens = [makeCitizen({ birthTick: 0, health: 100 })];
    const { aliveCitizens, deaths } = system.update(citizens, 100, 1);
    expect(aliveCitizens).toHaveLength(1);
    expect(deaths).toHaveLength(0);
  });

  it('ne crashe pas sur un tableau vide', () => {
    const { aliveCitizens, deaths } = system.update([], 100, 1);
    expect(aliveCitizens).toHaveLength(0);
    expect(deaths).toHaveLength(0);
  });
});