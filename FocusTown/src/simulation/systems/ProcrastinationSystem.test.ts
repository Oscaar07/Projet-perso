import { describe, it, expect } from 'vitest';
import { ProcrastinationSystem } from './ProcrastinationSystem';
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

describe('ProcrastinationSystem', () => {
  const system = new ProcrastinationSystem();

  it('wander augmente procrastination de 0.2', () => {
    const citizens = [makeCitizen({ currentAction: 'wander', procrastination: 0 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeCloseTo(0.2);
  });

  it('relax augmente procrastination de 0.1 et réduit burnout de 0.1', () => {
    const citizens = [makeCitizen({ currentAction: 'relax', procrastination: 0, burnout: 50 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeCloseTo(0.1);
    expect(citizens[0].burnout).toBeCloseTo(49.9);
  });

  it('work réduit procrastination de 0.3', () => {
    const citizens = [makeCitizen({ currentAction: 'work', procrastination: 50 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeCloseTo(49.7);
  });

  it('burnout augmente de 0.2 si stress > 70 et energy < 30', () => {
    const citizens = [makeCitizen({ stress: 71, energy: 29, burnout: 0, currentAction: '' })];
    system.update(citizens);
    expect(citizens[0].burnout).toBeCloseTo(0.2);
  });

  it('burnout n\'augmente pas si stress <= 70', () => {
    const citizens = [makeCitizen({ stress: 70, energy: 20, burnout: 0, currentAction: '' })];
    system.update(citizens);
    expect(citizens[0].burnout).toBe(0);
  });

  it('burnout n\'augmente pas si energy >= 30', () => {
    const citizens = [makeCitizen({ stress: 80, energy: 30, burnout: 0, currentAction: '' })];
    system.update(citizens);
    expect(citizens[0].burnout).toBe(0);
  });

  it('procrastination ne descend pas sous 0', () => {
    const citizens = [makeCitizen({ currentAction: 'work', procrastination: 0 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBe(0);
  });

  it('procrastination ne dépasse pas 100', () => {
    const citizens = [makeCitizen({ currentAction: 'wander', procrastination: 99.9 })];
    system.update(citizens);
    expect(citizens[0].procrastination).toBeLessThanOrEqual(100);
  });

  it('burnout ne descend pas sous 0', () => {
    const citizens = [makeCitizen({ currentAction: 'relax', burnout: 0 })];
    system.update(citizens);
    expect(citizens[0].burnout).toBe(0);
  });
});
