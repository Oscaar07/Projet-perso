import { describe, it, expect } from 'vitest';
import { ScheduleSystem } from './ScheduleSystem';
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

describe('ScheduleSystem', () => {
  const system = new ScheduleSystem();

  describe('chronotype morning', () => {
    it('workDesire = 40 entre 7h et 17h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', workDesire: 0 })];
      system.update(citizens, 10);
      expect(citizens[0].workDesire).toBe(40);
    });

    it('workDesire = 0 en dehors de 7h-17h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', workDesire: 99 })];
      system.update(citizens, 22);
      expect(citizens[0].workDesire).toBe(0);
    });

    it('sleepDesire = 60 à minuit', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', sleepDesire: 0 })];
      system.update(citizens, 0);
      expect(citizens[0].sleepDesire).toBe(60);
    });

    it('sleepDesire = 60 à 21h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', sleepDesire: 0 })];
      system.update(citizens, 21);
      expect(citizens[0].sleepDesire).toBe(60);
    });

    it('sleepDesire = 0 à 7h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', sleepDesire: 0 })];
      system.update(citizens, 7);
      expect(citizens[0].sleepDesire).toBe(0);
    });

    it('sleepDesire = 0 à 20h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', sleepDesire: 0 })];
      system.update(citizens, 20);
      expect(citizens[0].sleepDesire).toBe(0);
    });

    it('hunger augmente entre 12h et 13h', () => {
      const citizens = [makeCitizen({ chronotype: 'morning', hunger: 50 })];
      system.update(citizens, 12.5);
      expect(citizens[0].hunger).toBeGreaterThan(50);
    });
  });

  describe('chronotype night', () => {
    it('workDesire = 40 entre 10h et 20h', () => {
      const citizens = [makeCitizen({ chronotype: 'night', workDesire: 0 })];
      system.update(citizens, 15);
      expect(citizens[0].workDesire).toBe(40);
    });

    it('sleepDesire = 60 entre 1h et 9h', () => {
      const citizens = [makeCitizen({ chronotype: 'night', sleepDesire: 0 })];
      system.update(citizens, 5);
      expect(citizens[0].sleepDesire).toBe(60);
    });

    it('sleepDesire = 0 en dehors de 1h-9h', () => {
      const citizens = [makeCitizen({ chronotype: 'night', sleepDesire: 99 })];
      system.update(citizens, 12);
      expect(citizens[0].sleepDesire).toBe(0);
    });

    it('hunger augmente entre 12h et 13h', () => {
      const citizens = [makeCitizen({ chronotype: 'night', hunger: 50 })];
      system.update(citizens, 12);
      expect(citizens[0].hunger).toBeGreaterThan(50);
    });
  });
});
