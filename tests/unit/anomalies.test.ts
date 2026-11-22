import { describe, it, expect } from 'vitest';
import playersData from '../../src/data/players.json';
import { Player } from '../../src/types/player';

describe('Player Anomalies (God-Mode Single Seasons)', () => {
  const players = playersData as unknown as Player[];

  it('includes verified anomaly players with valid metadata', () => {
    const anomalies = players.filter((p) => p.isAnomaly);
    expect(anomalies.length).toBeGreaterThanOrEqual(6);

    for (const anomaly of anomalies) {
      expect(anomaly.isAnomaly).toBe(true);
      expect(typeof anomaly.anomalySeason).toBe('string');
      expect(typeof anomaly.anomalyBadge).toBe('string');
      expect(anomaly.anomalyBadge!.length).toBeGreaterThan(0);
    }
  });

  it('verifies iconic cricket anomalies like 2016 Kohli and 2013 Gayle', () => {
    const kohli = players.find((p) => p.id === 'virat-kohli');
    expect(kohli?.isAnomaly).toBe(true);
    expect(kohli?.anomalySeason).toBe('2016');
    expect(kohli?.anomalyBadge).toContain('973-Run God Mode');

    const gayle = players.find((p) => p.id === 'chris-gayle');
    expect(gayle?.isAnomaly).toBe(true);
    expect(gayle?.anomalySeason).toBe('2013');
    expect(gayle?.anomalyBadge).toContain('175* Universe Boss');

    const warne = players.find((p) => p.id === 'shane-warne');
    expect(warne?.isAnomaly).toBe(true);
    expect(warne?.anomalySeason).toBe('1993');

    const maxwell = players.find((p) => p.id === 'glenn-maxwell');
    expect(maxwell?.isAnomaly).toBe(true);
    expect(maxwell?.anomalySeason).toBe('2023');
  });
});
