import { describe, it, expect } from 'vitest';
import { SocialSystem } from './SocialSystem';
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

describe('SocialSystem', () => {
  const system = new SocialSystem();

  it('crée une relation entre citoyens proches', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    const c2 = makeCitizen({ id: '2', x: 1, y: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    system.update([c1, c2]);
    expect(c1.relationships).toHaveLength(1);
    expect(c1.relationships[0].citizenId).toBe('2');
    expect(c2.relationships[0].citizenId).toBe('1');
  });

  it('friendship augmente avec la sociabilité', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, personality: { diligence: 0.5, sociability: 1, laziness: 0.5 } });
    const c2 = makeCitizen({ id: '2', x: 1, y: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    system.update([c1, c2]);
    expect(c1.relationships[0].friendship).toBeCloseTo(0.02 - 0.01);
  });

  it('stress > 80 réduit la friendship', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, stress: 90, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    const c2 = makeCitizen({ id: '2', x: 1, y: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    system.update([c1, c2]);
    const highStressFriendship = c1.relationships[0].friendship;
    const c3 = makeCitizen({ id: '3', x: 0, y: 0, stress: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    const c4 = makeCitizen({ id: '4', x: 1, y: 0, personality: { diligence: 0.5, sociability: 0.5, laziness: 0.5 } });
    system.update([c3, c4]);
    expect(highStressFriendship).toBeLessThan(c4.relationships[0].friendship);
  });

  it('friendship peut devenir négative via la décroissance', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, relationships: [{ citizenId: '2', friendship: 0 }] });
    const c2 = makeCitizen({ id: '2', x: 5, y: 0 });
    system.update([c1, c2]);
    expect(c1.relationships[0].friendship).toBeCloseTo(-0.01);
  });

  it('proximité améliore le mood de 0.01', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, mood: 50 });
    const c2 = makeCitizen({ id: '2', x: 0, y: 1, mood: 50 });
    system.update([c1, c2]);
    expect(c1.mood).toBeCloseTo(50.01);
  });

  it('le mood converge vers celui du voisin', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, mood: 50 });
    const c2 = makeCitizen({ id: '2', x: 0, y: 1, mood: 80 });
    system.update([c1, c2]);
    expect(c1.mood).toBeGreaterThan(50);
    expect(c2.mood).toBeLessThan(80);
  });

  it('contagion du burnout si voisin burnout > 80', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, stress: 0, burnout: 90 });
    const c2 = makeCitizen({ id: '2', x: 0, y: 1, stress: 0 });
    system.update([c1, c2]);
    expect(c2.stress).toBeCloseTo(0.02);
  });

  it('pas d\'effet si citoyens éloignés (distance >= 2)', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, mood: 50 });
    const c2 = makeCitizen({ id: '2', x: 5, y: 0, mood: 50 });
    system.update([c1, c2]);
    expect(c1.relationships).toHaveLength(0);
    expect(c1.mood).toBe(50);
  });

  it('les amitiés se dégradent de 0.01 par tick', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, relationships: [{ citizenId: '2', friendship: 50 }] });
    const c2 = makeCitizen({ id: '2', x: 5, y: 0 });
    system.update([c1, c2]);
    expect(c1.relationships[0].friendship).toBeCloseTo(49.99);
  });

  it('le mood ne dépasse pas 100', () => {
    const c1 = makeCitizen({ id: '1', x: 0, y: 0, mood: 100 });
    const c2 = makeCitizen({ id: '2', x: 0, y: 1, mood: 100 });
    system.update([c1, c2]);
    expect(c1.mood).toBe(100);
  });
});
