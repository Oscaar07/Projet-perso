import { describe, it, expect } from 'vitest';
import { EmotionSystem } from './EmotionSystem';
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

describe('EmotionSystem', () => {
  const system = new EmotionSystem();

  it('retourne burnout quand burnout > 70', () => {
    const citizens = [makeCitizen({ burnout: 71, anxiety: 0, mood: 100 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('burnout');
  });

  it('burnout a la priorité sur anxiety', () => {
    const citizens = [makeCitizen({ burnout: 71, anxiety: 80, mood: 100 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('burnout');
  });

  it('retourne anxious quand anxiety > 70', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 71, mood: 100 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('anxious');
  });

  it('retourne sad quand mood < 30', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 0, mood: 29 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('sad');
  });

  it('retourne happy quand mood > 70', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 0, mood: 71 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('happy');
  });

  it('retourne neutral quand aucun seuil atteint', () => {
    const citizens = [makeCitizen({ burnout: 50, anxiety: 50, mood: 50 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('neutral');
  });

  it('seuil exact burnout à 70 passe à happy (strict > 70)', () => {
    const citizens = [makeCitizen({ burnout: 70, anxiety: 0, mood: 100 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('happy');
  });

  it('seuil exact anxiety à 70 passe à happy (strict > 70)', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 70, mood: 100 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('happy');
  });

  it('seuil exact mood à 30 reste neutral (strict < 30)', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 0, mood: 30 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('neutral');
  });

  it('seuil exact mood à 70 donne neutral (strict > 70)', () => {
    const citizens = [makeCitizen({ burnout: 0, anxiety: 0, mood: 70 })];
    system.update(citizens);
    expect(citizens[0].emotionalState).toBe('neutral');
  });
});
