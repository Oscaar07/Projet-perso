import { describe, it, expect } from 'vitest';
import { MemorySystem } from './MemorySystem';
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

describe('MemorySystem', () => {
  const system = new MemorySystem();

  it('crée un souvenir social si mood > 80', () => {
    const citizens = [makeCitizen({ mood: 90, stress: 0, tick: 0 })];
    system.update(citizens, 42);
    expect(citizens[0].memories).toHaveLength(1);
    expect(citizens[0].memories[0].type).toBe('social');
    expect(citizens[0].memories[0].value).toBe(10);
    expect(citizens[0].memories[0].timestamp).toBe(42);
  });

  it('crée un souvenir de travail si stress > 80', () => {
    const citizens = [makeCitizen({ mood: 50, stress: 90 })];
    system.update(citizens, 100);
    expect(citizens[0].memories).toHaveLength(1);
    expect(citizens[0].memories[0].type).toBe('work');
    expect(citizens[0].memories[0].value).toBe(-10);
  });

  it('crée les deux souvenirs si mood > 80 ET stress > 80', () => {
    const citizens = [makeCitizen({ mood: 90, stress: 90 })];
    system.update(citizens, 1);
    expect(citizens[0].memories).toHaveLength(2);
    expect(citizens[0].memories[0].type).toBe('social');
    expect(citizens[0].memories[1].type).toBe('work');
  });

  it('ne crée aucun souvenir si mood <= 80 et stress <= 80', () => {
    const citizens = [makeCitizen({ mood: 80, stress: 80 })];
    system.update(citizens, 1);
    expect(citizens[0].memories).toHaveLength(0);
  });

  it('oublie les souvenirs de plus de 500 ticks', () => {
    const oldMemory = { type: 'social' as const, value: 10, timestamp: 0 };
    const citizens = [makeCitizen({ mood: 50, stress: 50, memories: [oldMemory] })];
    system.update(citizens, 501);
    expect(citizens[0].memories).toHaveLength(0);
  });

  it('garde les souvenirs de moins de 500 ticks', () => {
    const recentMemory = { type: 'social' as const, value: 10, timestamp: 100 };
    const citizens = [makeCitizen({ mood: 50, stress: 50, memories: [recentMemory] })];
    system.update(citizens, 500);
    expect(citizens[0].memories).toHaveLength(1);
  });

  it('supprime le plus vieux souvenir si > 30', () => {
    const memories = Array.from({ length: 31 }, (_, i) => ({
      type: 'social' as const, value: 10, timestamp: 200 + i,
    }));
    const citizens = [makeCitizen({ mood: 50, stress: 50, memories })];
    system.update(citizens, 400);
    expect(citizens[0].memories).toHaveLength(30);
    expect(citizens[0].memories.every(m => m.timestamp !== 200)).toBe(true);
  });
});
