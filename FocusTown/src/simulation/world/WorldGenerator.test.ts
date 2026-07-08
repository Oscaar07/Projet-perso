import { describe, it, expect } from 'vitest';
import { WorldGenerator } from './WorldGenerator';

describe('WorldGenerator', () => {
  const generator = new WorldGenerator();

  it('génère 900 tiles (30x30)', () => {
    const tiles = generator.generate();
    expect(tiles).toHaveLength(900);
  });

  it('toutes les tiles sont initialement de l\'herbe ou de la route', () => {
    const tiles = generator.generate();
    tiles.forEach(t => {
      expect(['grass', 'road']).toContain(t.type);
    });
  });

  it('l\'axe y=6 est une route', () => {
    const tiles = generator.generate();
    const roadTiles = tiles.filter(t => t.y === 6);
    expect(roadTiles.length).toBe(30);
    roadTiles.forEach(t => {
      expect(t.type).toBe('road');
      expect(t.movementCost).toBe(1);
    });
  });

  it('les tiles d\'herbe ont movementCost=5', () => {
    const tiles = generator.generate();
    const grassTiles = tiles.filter(t => t.type === 'grass');
    expect(grassTiles.length).toBeGreaterThan(0);
    grassTiles.forEach(t => {
      expect(t.movementCost).toBe(5);
    });
  });

  it('toutes les coordonnées x et y sont dans la grille', () => {
    const tiles = generator.generate();
    tiles.forEach(t => {
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThan(30);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThan(30);
    });
  });

  it('chaque position a exactement une tile', () => {
    const tiles = generator.generate();
    const positions = tiles.map(t => `${t.x},${t.y}`);
    expect(new Set(positions).size).toBe(900);
  });
});
