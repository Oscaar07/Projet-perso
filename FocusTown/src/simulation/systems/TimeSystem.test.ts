import { describe, it, expect } from 'vitest';
import { TimeSystem } from './TimeSystem';

describe('TimeSystem', () => {
  const system = new TimeSystem();

  it('progresse le temps de 0.1h par tick', () => {
    const next = system.update({ time: 6, day: 1, weather: 'sunny' });
    expect(next.time).toBe(6.1);
    expect(next.day).toBe(1);
  });

  it('passe au jour suivant après 24h', () => {
    const next = system.update({ time: 23.9, day: 1, weather: 'sunny' });
    expect(next.time).toBe(0);
    expect(next.day).toBe(2);
  });

  it('retourne toujours un weather valide', () => {
    const validWeathers = ['sunny', 'rain', 'fog', 'storm'];
    for (let i = 0; i < 100; i++) {
      const next = system.update({ time: 23.9, day: 1, weather: 'sunny' });
      expect(validWeathers).toContain(next.weather);
    }
  });
});
