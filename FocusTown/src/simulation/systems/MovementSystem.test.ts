import { describe, it, expect } from 'vitest';
import { MovementSystem } from './MovementSystem';
import { PathfindingGrid } from './PathfindingGrid';
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

describe('MovementSystem', () => {
  const system = new MovementSystem();

  function makeGrid(): PathfindingGrid {
    return new PathfindingGrid();
  }

  it('avance d\'une case le long du chemin', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }, { x: 2, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].x).toBe(1);
    expect(citizens[0].y).toBe(0);
    expect(citizens[0].path).toHaveLength(1);
  });

  it('incrémente movingTicks en se déplaçant', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }], movingTicks: 5 })];
    system.update(citizens, grid);
    expect(citizens[0].movingTicks).toBe(6);
  });

  it('met facingDirection à droite quand on va à droite', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].facingDirection).toBe('right');
  });

  it('met facingDirection à gauche quand on va à gauche', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 1, y: 0, path: [{ x: 0, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].facingDirection).toBe('left');
  });

  it('met facingDirection en bas quand on va en bas', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 0, y: 1 }] })];
    system.update(citizens, grid);
    expect(citizens[0].facingDirection).toBe('down');
  });

  it('met facingDirection en haut quand on va en haut', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 1, path: [{ x: 0, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].facingDirection).toBe('up');
  });

  it('met à jour prevX et prevY avant le déplacement', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].prevX).toBe(0);
    expect(citizens[0].prevY).toBe(0);
  });

  it('remet movingTicks à 0 quand il n\'y a pas de chemin', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [], movingTicks: 5 })];
    system.update(citizens, grid);
    expect(citizens[0].movingTicks).toBe(0);
  });

  it('arrondit les positions à l\'entier', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0.7, y: 0.3, path: [{ x: 1, y: 0 }] })];
    system.update(citizens, grid);
    expect(Number.isInteger(citizens[0].x)).toBe(true);
    expect(Number.isInteger(citizens[0].y)).toBe(true);
  });

  it('met à jour la grille d\'occupation', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }] })];
    system.update(citizens, grid);
    expect(grid.getEffectiveCost(0, 0)).toBe(1);
    expect(grid.getEffectiveCost(1, 0)).toBeGreaterThan(1);
  });

  it('supprime le waypoint utilisé du chemin', () => {
    const grid = makeGrid();
    const citizens = [makeCitizen({ x: 0, y: 0, path: [{ x: 1, y: 0 }, { x: 2, y: 0 }] })];
    system.update(citizens, grid);
    expect(citizens[0].path[0]).toEqual({ x: 2, y: 0 });
  });
});
