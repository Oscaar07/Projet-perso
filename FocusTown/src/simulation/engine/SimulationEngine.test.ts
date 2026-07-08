import { describe, it, expect } from 'vitest';
import { SimulationEngine } from './SimulationEngine';

describe('SimulationEngine', () => {
  it('exécute un tick sans erreur', () => {
    const engine = new SimulationEngine();
    expect(() => engine.tick()).not.toThrow();
  });

  it('retourne un snapshot valide après tick', () => {
    const engine = new SimulationEngine();
    const snapshot = engine.tick();
    expect(snapshot).toHaveProperty('tick');
    expect(snapshot).toHaveProperty('citizens');
    expect(snapshot).toHaveProperty('buildings');
    expect(snapshot).toHaveProperty('time');
    expect(snapshot).toHaveProperty('day');
    expect(snapshot).toHaveProperty('weather');
    expect(snapshot).toHaveProperty('cityMoney');
    expect(Array.isArray(snapshot.citizens)).toBe(true);
    expect(Array.isArray(snapshot.buildings)).toBe(true);
  });

  it('les citoyens ont des besoins qui évoluent sur plusieurs ticks', () => {
    const engine = new SimulationEngine();
    for (let i = 0; i < 10; i++) engine.tick();
    const state = engine.getState();
    for (const c of state.citizens) {
      expect(c.hunger).toBeLessThan(100);
      expect(c.hygiene).toBeLessThan(100);
    }
  });

  it('le temps progresse avec les ticks', () => {
    const engine = new SimulationEngine();
    const t0 = engine.getState().time;
    engine.tick();
    const t1 = engine.getState().time;
    expect(t1).not.toBe(t0);
  });

  it('getState retourne le même état sans muter', () => {
    const engine = new SimulationEngine();
    const s1 = engine.getState();
    const s2 = engine.getState();
    expect(s1.tick).toBe(s2.tick);
    expect(s1.citizens.length).toBe(s2.citizens.length);
  });

  it('exportState / importState fait un roundtrip', () => {
    const engine = new SimulationEngine();
    for (let i = 0; i < 5; i++) engine.tick();
    const exported = engine.exportState();
    const engine2 = new SimulationEngine();
    engine2.importState(exported);
    const state1 = engine.getState();
    const state2 = engine2.getState();
    expect(state1.day).toBe(state2.day);
    expect(state1.citizens.length).toBe(state2.citizens.length);
    expect(state1.cityMoney).toBe(state2.cityMoney);
  });

  it('addBuilding ajoute un bâtiment', () => {
    const engine = new SimulationEngine();
    engine.addBuilding('house', 5, 5);
    const state = engine.getState();
    const added = state.buildings.find(b => b.x === 5 && b.y === 5);
    expect(added).toBeDefined();
    expect(added?.type).toBe('house');
  });

  it('addRoad ajoute une route', () => {
    const engine = new SimulationEngine();
    engine.addRoad(3, 7);
    const state = engine.getState();
    const road = state.tiles.find(t => t.x === 3 && t.y === 7 && t.type === 'road');
    expect(road).toBeDefined();
  });

  it('addZone ajoute une zone résidentielle', () => {
    const engine = new SimulationEngine();
    engine.addZone('residential', 8, 4);
    const state = engine.getState();
    const zone = state.tiles.find(t => t.x === 8 && t.y === 4 && t.zoneType === 'residential');
    expect(zone).toBeDefined();
  });

  it('setProductivitySummary affecte le mood des citoyens', () => {
    const engine = new SimulationEngine();
    engine.setProductivitySummary({
      focusSeconds: 3600,
      distractionSeconds: 0,
      idleSeconds: 0,
      breakSeconds: 0,
      totalTrackedSeconds: 3600,
      averageProductivityScore: 0.9,
    });
    const before = engine.getState().citizens[0].mood;
    engine.tick();
    engine.tick();
    const after = engine.getState().citizens[0].mood;
    // productivity influence should increase mood
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('ne crashe pas après 100 ticks', () => {
    const engine = new SimulationEngine();
    for (let i = 0; i < 100; i++) {
      engine.tick();
    }
    const state = engine.getState();
    expect(state.tick).toBe(100);
    expect(state.citizens.length).toBeGreaterThan(0);
  });
});
