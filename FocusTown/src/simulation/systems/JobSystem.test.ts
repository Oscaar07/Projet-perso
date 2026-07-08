import { describe, it, expect } from 'vitest';
import { JobSystem } from './JobSystem';
import type { Citizen } from '../entities/Citizen';

function makeCitizen(overrides?: Partial<Citizen>): Citizen {
  return {
    id: 'test', name: 'T', x: 0, y: 0, prevX: 0, prevY: 0,
    energy: 100, hunger: 100, hygiene: 100, fun: 100,
    money: 0, health: 100, isSick: false,
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

describe('JobSystem', () => {
  const system = new JobSystem();

  it('developer gagne 1000 + bonus et perd energy', () => {
    const citizens = [makeCitizen({ job: 'developer', money: 0, energy: 100, motivation: 100, personality: { diligence: 0, sociability: 0.5, laziness: 0.5 } })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(1000);
    expect(citizens[0].money).toBeLessThan(1010);
    expect(citizens[0].energy).toBeCloseTo(99.96);
  });

  it('artist gagne 800 + bonus et gagne mood', () => {
    const citizens = [makeCitizen({ job: 'artist', money: 0, mood: 50 })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(800);
    expect(citizens[0].mood).toBeCloseTo(50.05);
  });

  it('engineer gagne 1200 + bonus et perd energy', () => {
    const citizens = [makeCitizen({ job: 'engineer', money: 0, energy: 100 })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(1200);
    expect(citizens[0].energy).toBeCloseTo(99.97);
  });

  it('merchant gagne 1000 + bonus et gagne mood', () => {
    const citizens = [makeCitizen({ job: 'merchant', money: 0, mood: 50 })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(1000);
    expect(citizens[0].mood).toBeCloseTo(50.02);
  });

  it('scientist gagne 1500 + bonus et perd energy', () => {
    const citizens = [makeCitizen({ job: 'scientist', money: 0, energy: 100 })];
    system.update(citizens);
    expect(citizens[0].money).toBeGreaterThan(1500);
    expect(citizens[0].energy).toBeCloseTo(99.95);
  });

  it('isSick réduit l\'efficacité à 30%', () => {
    const citizens = [makeCitizen({ job: 'developer', money: 0, isSick: true, motivation: 100, personality: { diligence: 0, sociability: 0.5, laziness: 0.5 } })];
    system.update(citizens);
    const sickMoney = citizens[0].money;

    const healthy = [makeCitizen({ job: 'developer', money: 0, isSick: false, motivation: 100, personality: { diligence: 0, sociability: 0.5, laziness: 0.5 } })];
    system.update(healthy);

    expect(sickMoney).toBeLessThan(healthy[0].money);
  });

  it('job inconnu donne 0 salaire', () => {
    const citizens = [makeCitizen({ job: 'unknown' as any, money: 0 })];
    system.update(citizens);
    expect(citizens[0].money).toBe(0);
  });

  it('energy ne descend pas sous 0', () => {
    const citizens = [makeCitizen({ job: 'developer', energy: 0 })];
    system.update(citizens);
    expect(citizens[0].energy).toBe(0);
  });

  it('mood ne dépasse pas 100', () => {
    const citizens = [makeCitizen({ job: 'artist', mood: 100 })];
    system.update(citizens);
    expect(citizens[0].mood).toBe(100);
  });
});
