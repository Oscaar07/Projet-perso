import { describe, it, expect } from 'vitest';
import { PathfindingSystem } from './PathfindingSystem';
import { PathfindingGrid } from './PathfindingGrid';
import type { Citizen } from '../entities/Citizen';
import type { Tile } from '../world/Tiles';
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

function makeGrid(): PathfindingGrid {
  const grid = new PathfindingGrid();
  const tiles: Tile[] = [];
  for (let x = 0; x < 30; x++) {
    for (let y = 0; y < 30; y++) {
      tiles.push({ x, y, type: 'grass', movementCost: 5 });
    }
  }
  grid.rebuild(tiles, []);
  return grid;
}

describe('PathfindingSystem', () => {
  const system = new PathfindingSystem();

  it('trouve un chemin entre deux points', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, targetX: 2, targetY: 0, path: [] })];
    system.update(citizens, grid);
    expect(citizens[0].path.length).toBeGreaterThan(0);
  });

  it('chemin = [target] si déjà sur la cible', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 5, y: 5, targetX: 5, targetY: 5, path: [] })];
    system.update(citizens, grid);
    expect(citizens[0].path).toEqual([{ x: 5, y: 5 }]);
  });

  it('ne recalcule pas si un chemin existe déjà', () => {
    const grid = makeGrid();
    const existingPath = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const citizens = [makeCitizen({ x: 0, y: 0, targetX: 2, targetY: 0, path: existingPath })];
    system.update(citizens, grid);
    expect(citizens[0].path).toBe(existingPath);
  });

  it('contourne les obstacles (coût Infinity)', () => {
    const grid = makeGrid();
    const buildings: Building[] = [{
      id: 'wall', type: 'house', x: 1, y: 0, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    }];
    grid.rebuild([], buildings);
    const citizens = [makeCitizen({ x: 0, y: 0, targetX: 2, targetY: 0, path: [] })];
    system.update(citizens, grid);
    expect(citizens[0].path.length).toBeGreaterThan(0);
    expect(citizens[0].path.some(p => p.x === 1 && p.y === 0)).toBe(false);
  });

  it('préfère les routes (movementCost plus bas)', () => {
    const grid = new PathfindingGrid();
    const tiles: Tile[] = [];
    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 30; y++) {
        tiles.push({ x, y, type: 'grass', movementCost: 5 });
      }
    }
    tiles.push({ x: 1, y: 0, type: 'road', movementCost: 1 });
    tiles.push({ x: 2, y: 0, type: 'road', movementCost: 1 });
    grid.rebuild(tiles, []);
    const citizens = [makeCitizen({ x: 0, y: 0, targetX: 3, targetY: 0, path: [] })];
    system.update(citizens, grid);
    expect(citizens[0].path.length).toBeGreaterThan(0);
  });

  it('trouve un chemin sur toute la grille', () => {
    const grid = new PathfindingGrid();
    const tiles: Tile[] = [];
    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 30; y++) {
        tiles.push({ x, y, type: 'grass', movementCost: 5 });
      }
    }
    grid.rebuild(tiles, []);
    const citizens = [makeCitizen({ x: 0, y: 0, targetX: 5, targetY: 5, path: [] })];
    system.update(citizens, grid);
    expect(citizens[0].path.length).toBeGreaterThan(0);
  });
});
