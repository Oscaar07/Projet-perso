import { describe, it, expect } from 'vitest';
import { PathfindingGrid } from './PathfindingGrid';
import type { Tile } from '../world/Tiles';
import type { Building } from '../entities/Building';

describe('PathfindingGrid', () => {
  it('initialise avec movementCost=1 et occupancy=0', () => {
    const grid = new PathfindingGrid();
    expect(grid.getEffectiveCost(5, 5)).toBe(1);
  });

  it('getEffectiveCost retourne Infinity pour les coordonnées hors limites', () => {
    const grid = new PathfindingGrid();
    expect(grid.getEffectiveCost(-1, 0)).toBe(Infinity);
    expect(grid.getEffectiveCost(0, -1)).toBe(Infinity);
    expect(grid.getEffectiveCost(30, 0)).toBe(Infinity);
    expect(grid.getEffectiveCost(0, 30)).toBe(Infinity);
  });

  it('rebuild applique les movementCost des tiles', () => {
    const grid = new PathfindingGrid();
    const tiles: Tile[] = [{ x: 5, y: 5, type: 'road', movementCost: 1 }];
    grid.rebuild(tiles, []);
    expect(grid.getEffectiveCost(5, 5)).toBe(1);
  });

  it('rebuild ajoute +15 pour les bâtiments', () => {
    const grid = new PathfindingGrid();
    const tiles: Tile[] = [{ x: 5, y: 5, type: 'grass', movementCost: 5 }];
    const buildings: Building[] = [{
      id: 'b1', type: 'house', x: 5, y: 5, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    }];
    grid.rebuild(tiles, buildings);
    expect(grid.getEffectiveCost(5, 5)).toBe(20);
  });

  it('occupy incrémente l\'occupation', () => {
    const grid = new PathfindingGrid();
    grid.occupy(3, 3);
    expect(grid.getEffectiveCost(3, 3)).toBeGreaterThan(1);
  });

  it('vacate décrémente l\'occupation', () => {
    const grid = new PathfindingGrid();
    grid.occupy(3, 3);
    grid.occupy(3, 3);
    grid.vacate(3, 3);
    const costWithOne = grid.getEffectiveCost(3, 3);
    grid.vacate(3, 3);
    expect(grid.getEffectiveCost(3, 3)).toBeLessThan(costWithOne);
  });

  it('vacate ne descend pas sous 0', () => {
    const grid = new PathfindingGrid();
    grid.vacate(3, 3);
    grid.vacate(3, 3);
    expect(grid.getEffectiveCost(3, 3)).toBe(1);
  });

  it('occupy/vacate hors limites ne fait rien', () => {
    const grid = new PathfindingGrid();
    expect(() => grid.occupy(-1, 0)).not.toThrow();
    expect(() => grid.vacate(30, 0)).not.toThrow();
  });

  it('rebuild ignore les tiles hors limites', () => {
    const grid = new PathfindingGrid();
    const tiles: Tile[] = [{ x: -1, y: 0, type: 'grass', movementCost: 99 }];
    expect(() => grid.rebuild(tiles, [])).not.toThrow();
  });

  it('getEffectiveCost inclut TRAFFIC_PENALTY * occupancy', () => {
    const grid = new PathfindingGrid();
    grid.occupy(3, 3);
    grid.occupy(3, 3);
    const cost = grid.getEffectiveCost(3, 3);
    expect(cost).toBe(1 + 2 * 2);
  });
});
