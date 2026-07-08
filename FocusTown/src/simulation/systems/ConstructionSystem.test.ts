import { describe, it, expect, vi } from 'vitest';
import { ConstructionSystem } from './ConstructionSystem';
import type { Tile } from '../world/Tiles';
import type { Building } from '../entities/Building';

describe('ConstructionSystem', () => {
  const system = new ConstructionSystem();

  function makeTile(x: number, y: number, type: 'grass' | 'road' = 'grass'): Tile {
    return { x, y, type, movementCost: type === 'road' ? 1 : 5 };
  }

  function makeBuildings(): Building[] {
    return [];
  }

  it('addBuilding construit une maison sur de l\'herbe', () => {
    const tiles = [makeTile(5, 5)];
    const buildings = makeBuildings();
    const result = system.addBuilding({ type: 'house', x: 5, y: 5, buildings, tiles, cityMoney: 200 });
    expect(result.buildings).toHaveLength(1);
    expect(result.buildings[0].type).toBe('house');
    expect(result.cityMoney).toBe(100);
  });

  it('addBuilding ne construit pas si pas assez d\'argent', () => {
    const tiles = [makeTile(5, 5)];
    const buildings = makeBuildings();
    const result = system.addBuilding({ type: 'house', x: 5, y: 5, buildings, tiles, cityMoney: 50 });
    expect(result.buildings).toHaveLength(0);
    expect(result.cityMoney).toBe(50);
  });

  it('addBuilding ne construit pas si un bâtiment existe déjà', () => {
    const tiles = [makeTile(5, 5)];
    const buildings: Building[] = [{
      id: 'existing', type: 'house', x: 5, y: 5, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    }];
    const result = system.addBuilding({ type: 'house', x: 5, y: 5, buildings, tiles, cityMoney: 200 });
    expect(result.buildings).toHaveLength(1);
  });

  it('addBuilding ne construit pas si pas sur de l\'herbe', () => {
    const tiles = [makeTile(5, 5, 'road')];
    const buildings = makeBuildings();
    const result = system.addBuilding({ type: 'house', x: 5, y: 5, buildings, tiles, cityMoney: 200 });
    expect(result.buildings).toHaveLength(0);
  });

  it('addBuilding ne construit pas si la tile n\'existe pas', () => {
    const tiles: Tile[] = [];
    const buildings = makeBuildings();
    const result = system.addBuilding({ type: 'house', x: 99, y: 99, buildings, tiles, cityMoney: 200 });
    expect(result.buildings).toHaveLength(0);
  });

  it('addRoad construit une route', () => {
    const tiles = [makeTile(5, 5)];
    const result = system.addRoad({ x: 5, y: 5, cityMoney: 100, tiles, buildings: [] });
    expect(result.tiles[0].type).toBe('road');
    expect(result.tiles[0].movementCost).toBe(1);
    expect(result.cityMoney).toBe(75);
  });

  it('addRoad ne construit pas si pas assez d\'argent', () => {
    const tiles = [makeTile(5, 5)];
    const result = system.addRoad({ x: 5, y: 5, cityMoney: 10, tiles, buildings: [] });
    expect(result.tiles[0].type).toBe('grass');
    expect(result.cityMoney).toBe(10);
  });

  it('addZone définit une zone résidentielle', () => {
    const tiles = [makeTile(5, 5)];
    const result = system.addZone({ type: 'residential', x: 5, y: 5, tiles, cityMoney: 100, buildings: [] });
    expect(result.tiles[0].zoneType).toBe('residential');
  });

  it('addZone ne fait rien si tile n\'est pas de l\'herbe', () => {
    const tiles = [makeTile(5, 5, 'road')];
    const result = system.addZone({ type: 'residential', x: 5, y: 5, tiles, cityMoney: 100, buildings: [] });
    expect(result.tiles[0].zoneType).toBeUndefined();
  });

  it('autoBuildZones construit dans les zones résidentielles', () => {
    const tiles = [makeTile(5, 5)];
    tiles[0].zoneType = 'residential';
    const buildings: Building[] = [];
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const result = system.autoBuildZones({ tiles, buildings, cityMoney: 1000 });
    expect(result.buildings.length).toBeGreaterThanOrEqual(1);
    vi.restoreAllMocks();
  });

  it('autoBuildZones ne construit pas si déjà un bâtiment', () => {
    const tiles = [makeTile(5, 5)];
    tiles[0].zoneType = 'residential';
    const buildings: Building[] = [{
      id: 'existing', type: 'house', x: 5, y: 5, capacity: 4, comfort: 50, cleanliness: 100, maxResidents: 4,
    }];
    const result = system.autoBuildZones({ tiles, buildings, cityMoney: 1000 });
    expect(result.buildings).toHaveLength(1);
  });
});
