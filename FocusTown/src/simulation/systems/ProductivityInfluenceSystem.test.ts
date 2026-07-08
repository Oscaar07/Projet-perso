import { describe, it, expect } from 'vitest';
import { ProductivityInfluenceSystem } from './ProductivityInfluenceSystem';
import type { Citizen } from '../entities/Citizen';
import type { ProductivitySummary } from '../../productivity/types';

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

describe('ProductivityInfluenceSystem', () => {
  const system = new ProductivityInfluenceSystem();

  it('retourne des deltas nuls si totalTrackedSeconds <= 0', () => {
    const summary: ProductivitySummary = {
      focusSeconds: 0, distractionSeconds: 0, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 0, averageProductivityScore: 0,
    };
    const result = system.update([], summary);
    expect(result.cityMoneyDelta).toBe(0);
    expect(result.moodDelta).toBe(0);
  });

  it('focus augmente cityMoney et mood', () => {
    const citizens = [makeCitizen({ mood: 50, motivation: 50, stress: 50, burnout: 50 })];
    const summary: ProductivitySummary = {
      focusSeconds: 100, distractionSeconds: 0, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 50,
    };
    const result = system.update(citizens, summary);
    expect(result.cityMoneyDelta).toBe(10);
    expect(citizens[0].mood).toBeGreaterThan(50);
    expect(citizens[0].motivation).toBeGreaterThan(50);
    expect(citizens[0].stress).toBeLessThan(50);
  });

  it('distraction réduit cityMoney et augmente stress', () => {
    const citizens = [makeCitizen({ mood: 50, motivation: 50, stress: 50, burnout: 50 })];
    const summary: ProductivitySummary = {
      focusSeconds: 0, distractionSeconds: 100, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 50,
    };
    const result = system.update(citizens, summary);
    expect(result.cityMoneyDelta).toBe(-8);
    expect(citizens[0].stress).toBeGreaterThan(50);
    expect(citizens[0].mood).toBeLessThan(50);
  });

  it('idle réduit cityMoney et augmente burnout', () => {
    const citizens = [makeCitizen({ burnout: 0 })];
    const summary: ProductivitySummary = {
      focusSeconds: 0, distractionSeconds: 0, idleSeconds: 100, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 50,
    };
    const result = system.update(citizens, summary);
    expect(result.cityMoneyDelta).toBe(-3);
    expect(citizens[0].burnout).toBeGreaterThan(0);
  });

  it('score < 40 augmente stress et burnout', () => {
    const citizens = [makeCitizen({ stress: 0, burnout: 0 })];
    const summary: ProductivitySummary = {
      focusSeconds: 0, distractionSeconds: 100, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 30,
    };
    system.update(citizens, summary);
    expect(citizens[0].stress).toBeGreaterThan(0.6);
    expect(citizens[0].burnout).toBeGreaterThan(0.35);
  });

  it('score > 75 réduit stress et augmente motivation', () => {
    const citizens = [makeCitizen({ stress: 50, motivation: 50 })];
    const summary: ProductivitySummary = {
      focusSeconds: 100, distractionSeconds: 0, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 80,
    };
    system.update(citizens, summary);
    expect(citizens[0].stress).toBeLessThan(50);
    expect(citizens[0].motivation).toBeGreaterThan(50);
  });

  it('clamp mood, motivation, stress et burnout entre 0 et 100', () => {
    const citizens = [makeCitizen({ mood: 0, motivation: 0, stress: 100, burnout: 100 })];
    const summary: ProductivitySummary = {
      focusSeconds: 0, distractionSeconds: 100, idleSeconds: 0, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 50,
    };
    system.update(citizens, summary);
    expect(citizens[0].mood).toBeGreaterThanOrEqual(0);
    expect(citizens[0].motivation).toBeGreaterThanOrEqual(0);
    expect(citizens[0].stress).toBeLessThanOrEqual(100);
    expect(citizens[0].burnout).toBeLessThanOrEqual(100);
  });

  it('résultat mixte avec ratios variés', () => {
    const summary: ProductivitySummary = {
      focusSeconds: 50, distractionSeconds: 30, idleSeconds: 20, breakSeconds: 0,
      totalTrackedSeconds: 100, averageProductivityScore: 50,
    };
    const result = system.update([], summary);
    expect(result.cityMoneyDelta).toBeCloseTo(50 / 100 * 10 - 30 / 100 * 8 - 20 / 100 * 3);
  });
});
