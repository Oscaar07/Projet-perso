import { describe, it, expect } from 'vitest';
import { createCitizen } from './CitizenFactory';
import type { Building } from './Building';

const home: Building = { id: 'home-1', type: 'house', x: 2, y: 3, capacity: 4, comfort: 50, cleanliness: 50 };
const office: Building = { id: 'off-1', type: 'office', x: 10, y: 8, capacity: 10, comfort: 50, cleanliness: 50 };
const restaurant: Building = { id: 'rest-1', type: 'restaurant', x: 7, y: 7, capacity: 8, comfort: 50, cleanliness: 50 };

describe('CitizenFactory', () => {
  it('crée un citoyen avec tous les champs requis', () => {
    const c = createCitizen({ name: 'Alice', home, workplace: office, restaurant });
    expect(c.id).toBeDefined();
    expect(c.name).toBe('Alice');
    expect(c.x).toBe(2);
    expect(c.y).toBe(3);
  });

  it('assigne un job valide', () => {
    const c = createCitizen({ name: 'Bob', home });
    const validJobs = ['developer', 'artist', 'engineer', 'merchant', 'scientist'];
    expect(validJobs).toContain(c.job);
  });

  it('initialise les jauges à 100', () => {
    const c = createCitizen({ name: 'Charlie', home });
    expect(c.energy).toBe(100);
    expect(c.hunger).toBe(100);
    expect(c.mood).toBe(100);
    expect(c.money).toBe(100);
    expect(c.hygiene).toBe(100);
    expect(c.fun).toBe(100);
    expect(c.health).toBe(100);
  });

  it('initialise les états à 0', () => {
    const c = createCitizen({ name: 'Dave', home });
    expect(c.stress).toBe(0);
    expect(c.motivation).toBe(100);
    expect(c.procrastination).toBe(0);
    expect(c.burnout).toBe(0);
    expect(c.movingTicks).toBe(0);
  });

  it('initialise les tableaux vides', () => {
    const c = createCitizen({ name: 'Eve', home });
    expect(c.memories).toEqual([]);
    expect(c.relationships).toEqual([]);
    expect(c.path).toEqual([]);
  });

  it('initialise les traits de personnalité entre 0 et 1', () => {
    const c = createCitizen({ name: 'Frank', home });
    expect(c.personality.diligence).toBeGreaterThanOrEqual(0);
    expect(c.personality.diligence).toBeLessThanOrEqual(1);
    expect(c.personality.sociability).toBeGreaterThanOrEqual(0);
    expect(c.personality.sociability).toBeLessThanOrEqual(1);
    expect(c.personality.laziness).toBeGreaterThanOrEqual(0);
    expect(c.personality.laziness).toBeLessThanOrEqual(1);
  });

  it('assigne le workplace à home si non fourni', () => {
    const c = createCitizen({ name: 'Grace', home });
    expect(c.workX).toBe(home.x);
    expect(c.workY).toBe(home.y);
  });

  it('assigne le restaurant à home si non fourni', () => {
    const c = createCitizen({ name: 'Heidi', home, workplace: office });
    expect(c.restaurantX).toBe(home.x);
    expect(c.restaurantY).toBe(home.y);
  });
});
