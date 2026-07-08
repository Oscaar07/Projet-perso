import { describe, it, expect } from 'vitest';
import { HabitSystem } from './HabitSystem';
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

describe('HabitSystem', () => {
  const system = new HabitSystem();

  it('renforce l\'habitude de travail en travaillant', () => {
    const citizens = [makeCitizen({ currentAction: 'work', habits: { work: 0, relax: 0, socialize: 0, wander: 0 } })];
    system.update(citizens);
    expect(citizens[0].habits.work).toBeGreaterThan(0);
  });

  it('renforce l\'habitude de relaxation en relaxant', () => {
    const citizens = [makeCitizen({ currentAction: 'relax', habits: { work: 0, relax: 0, socialize: 0, wander: 0 } })];
    system.update(citizens);
    expect(citizens[0].habits.relax).toBeGreaterThan(0);
  });

  it('applique le decay aux habitudes inutilisées', () => {
    const citizens = [makeCitizen({ habits: { work: 50, relax: 50, socialize: 50, wander: 50 }, currentAction: 'work' })];
    system.update(citizens);
    expect(citizens[0].habits.relax).toBeLessThan(50);
    expect(citizens[0].habits.socialize).toBeLessThan(50);
    expect(citizens[0].habits.wander).toBeLessThan(50);
  });

  it('augmente la procrastination si relax > 70', () => {
    const citizens = [makeCitizen({ habits: { work: 0, relax: 75, socialize: 0, wander: 0 }, procrastination: 0 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeGreaterThan(0);
  });

  it('diminue la procrastination si work > 60', () => {
    const citizens = [makeCitizen({ habits: { work: 65, relax: 0, socialize: 0, wander: 0 }, procrastination: 10 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeLessThan(10);
  });
});
