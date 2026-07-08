import { describe, it, expect } from 'vitest';
import { UtilityAI } from './UtilityAI';
import type { Citizen } from '../entities/Citizen';

function makeCitizen(overrides?: Partial<Citizen>): Citizen {
  return {
    id: 'test-id',
    name: 'Test',
    x: 0, y: 0, prevX: 0, prevY: 0,
    energy: 100, hunger: 100, hygiene: 100, fun: 100,
    money: 100, health: 100, isSick: false,
    mood: 100, stress: 0, motivation: 100,
    procrastination: 0, burnout: 0,
    anxiety: 0, discipline: 50, confidence: 50, perfectionism: 50,
    relationships: [],
    emotionalState: 'neutral',
    job: 'developer',
    homeX: 0, homeY: 0, workX: 5, workY: 5,
    restaurantX: 3, restaurantY: 3,
    targetX: 5, targetY: 5, path: [],
    currentAction: '',
    chronotype: 'morning',
    workDesire: 0, sleepDesire: 0,
    personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 },
    memories: [],
    habits: { work: 0, relax: 0, socialize: 0, wander: 0 },
    movingTicks: 0,
    facingDirection: 'down',
    ...overrides,
  };
}

describe('UtilityAI', () => {
  const ai = new UtilityAI();

  it('retourne 6 actions possibles', () => {
    const citizen = makeCitizen();
    const scores = ai.evaluate(citizen);
    expect(scores).toHaveLength(6);
  });

  it('chaque action a un type et un score', () => {
    const citizen = makeCitizen();
    const scores = ai.evaluate(citizen);
    for (const action of scores) {
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('score');
      expect(typeof action.score).toBe('number');
    }
  });

  it('choisit eat quand la faim est critique', () => {
    const citizen = makeCitizen({ hunger: 5, energy: 100, sleepDesire: 0 });
    const best = ai.getBestAction(citizen);
    expect(best.type).toBe('eat');
  });

  it('choisit sleep quand l\'énergie est épuisée', () => {
    const citizen = makeCitizen({ energy: 5, hunger: 100, sleepDesire: 50 });
    const best = ai.getBestAction(citizen);
    expect(best.type).toBe('sleep');
  });

  it('le score de sleep est élevé sous stress et faible énergie', () => {
    const citizen = makeCitizen({ energy: 10, stress: 80, sleepDesire: 30 });
    const scores = ai.evaluate(citizen);
    const sleepScore = scores.find(a => a.type === 'sleep')!.score;
    const workScore = scores.find(a => a.type === 'work')!.score;
    expect(sleepScore).toBeGreaterThan(workScore);
  });

  it('le score de socialize augmente avec la sociabilité', () => {
    const lonely = makeCitizen({ personality: { diligence: 0.5, sociability: 0.1, laziness: 0.5 }, mood: 50, memories: [] });
    const social = makeCitizen({ personality: { diligence: 0.5, sociability: 0.9, laziness: 0.5 }, mood: 50, memories: [] });
    const lonelyScores = ai.evaluate(lonely);
    const socialScores = ai.evaluate(social);
    const lonelySocial = lonelyScores.find(a => a.type === 'socialize')!.score;
    const socialSocial = socialScores.find(a => a.type === 'socialize')!.score;
    expect(socialSocial).toBeGreaterThan(lonelySocial);
  });
});
