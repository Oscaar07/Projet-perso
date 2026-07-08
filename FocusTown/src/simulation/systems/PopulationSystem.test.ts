import { describe, it, expect, vi } from 'vitest';
import { PopulationSystem } from './PopulationSystem';
import type { Citizen } from '../entities/Citizen';
import type { Building } from '../entities/Building';

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

function makeHouse(id: string, overrides?: Partial<Building>): Building {
  return {
    id, type: 'house', x: 0, y: 0, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    ...overrides,
  };
}

function makeOffice(id: string): Building {
  return { id, type: 'office', x: 5, y: 5, capacity: 999, comfort: 50, cleanliness: 100 };
}

function makeRestaurant(id: string): Building {
  return { id, type: 'restaurant', x: 10, y: 10, capacity: 999, comfort: 50, cleanliness: 100 };
}

describe('PopulationSystem', () => {
  const system = new PopulationSystem();

  it('ne spawn pas si population >= populationCap', () => {
    const citizens = [makeCitizen({ id: '1' })];
    const buildings = [makeHouse('h1'), makeOffice('o1'), makeRestaurant('r1')];
    system.update(citizens, buildings, 1, 100);
    expect(citizens).toHaveLength(1);
  });

  it('ne spawn pas s\'il n\'y a pas d\'office', () => {
    const citizens: Citizen[] = [];
    const buildings = [makeHouse('h1'), makeRestaurant('r1')];
    system.update(citizens, buildings, 100, 100);
    expect(citizens).toHaveLength(0);
  });

  it('ne spawn pas s\'il n\'y a pas de restaurant', () => {
    const citizens: Citizen[] = [];
    const buildings = [makeHouse('h1'), makeOffice('o1')];
    system.update(citizens, buildings, 100, 100);
    expect(citizens).toHaveLength(0);
  });

  it('ne spawn pas si toutes les maisons sont pleines', () => {
    const fullHouse = makeHouse('h1', { maxResidents: 1 });
    const residents = [makeCitizen({ id: '1', homeId: 'h1' })];
    const buildings = [fullHouse, makeOffice('o1'), makeRestaurant('r1')];
    system.update(residents, buildings, 100, 100);
    expect(residents).toHaveLength(1);
  });

  it('spawn un citoyen quand les conditions sont réunies', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const citizens = [makeCitizen({ id: 'existing', name: 'Existing', mood: 100 })];
    const buildings = [makeHouse('h1', { maxResidents: 2 }), makeOffice('o1'), makeRestaurant('r1')];
    system.update(citizens, buildings, 100, 100);
    const newCitizen = citizens.find(c => c.id !== 'existing');
    expect(newCitizen).toBeDefined();
    expect(newCitizen!.homeId).toBe('h1');
    vi.restoreAllMocks();
  });

  it('le nouveau citoyen a un nom correct', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const citizens = [makeCitizen({ id: 'existing', name: 'Existing', mood: 100 })];
    const buildings = [
      makeHouse('h1', { maxResidents: 2 }),
      makeOffice('o1'),
      makeRestaurant('r1'),
    ];
    system.update(citizens, buildings, 100, 100);
    const newCitizen = citizens.find(c => c.id !== 'existing');
    expect(newCitizen).toBeDefined();
    expect(newCitizen!.name).toBe('Citizen 2');
    vi.restoreAllMocks();
  });
});
