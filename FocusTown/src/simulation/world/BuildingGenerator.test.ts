import { describe, it, expect } from 'vitest';
import { BuildingGenerator } from './BuildingGenerator';

describe('BuildingGenerator', () => {
  const generator = new BuildingGenerator();

  it('génère 20 bâtiments', () => {
    const buildings = generator.generate();
    expect(buildings).toHaveLength(20);
  });

  it('génère 8 maisons', () => {
    const buildings = generator.generate();
    expect(buildings.filter(b => b.type === 'house')).toHaveLength(8);
  });

  it('génère 6 offices', () => {
    const buildings = generator.generate();
    expect(buildings.filter(b => b.type === 'office')).toHaveLength(6);
  });

  it('génère 6 restaurants', () => {
    const buildings = generator.generate();
    expect(buildings.filter(b => b.type === 'restaurant')).toHaveLength(6);
  });

  it('les maisons sont dans la zone y 1-4', () => {
    const buildings = generator.generate();
    const houses = buildings.filter(b => b.type === 'house');
    houses.forEach(h => {
      expect(h.y).toBeGreaterThanOrEqual(1);
      expect(h.y).toBeLessThanOrEqual(4);
    });
  });

  it('les offices sont dans la zone y 7-12', () => {
    const buildings = generator.generate();
    const offices = buildings.filter(b => b.type === 'office');
    offices.forEach(o => {
      expect(o.y).toBeGreaterThanOrEqual(7);
      expect(o.y).toBeLessThanOrEqual(12);
    });
  });

  it('les restaurants sont dans la zone y 14-19', () => {
    const buildings = generator.generate();
    const restaurants = buildings.filter(b => b.type === 'restaurant');
    restaurants.forEach(r => {
      expect(r.y).toBeGreaterThanOrEqual(14);
      expect(r.y).toBeLessThanOrEqual(19);
    });
  });

  it('pas de chevauchement de positions', () => {
    const buildings = generator.generate();
    const positions = buildings.map(b => `${b.x},${b.y}`);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('les maisons ont maxResidents=4', () => {
    const buildings = generator.generate();
    buildings.filter(b => b.type === 'house').forEach(h => {
      expect(h.maxResidents).toBe(4);
    });
  });

  it('les x sont dans la grille (1-28)', () => {
    const buildings = generator.generate();
    buildings.forEach(b => {
      expect(b.x).toBeGreaterThanOrEqual(1);
      expect(b.x).toBeLessThanOrEqual(28);
    });
  });
});
