import { describe, it, expect } from 'vitest';
import playersData from '../../src/data/players.json';
import { SLOTS } from '../../src/data/slots';
import { TEAMS } from '../../src/data/teams';
import { OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';

describe('Player & Tournament Datasets', () => {
  it('contains at least 500 valid player entries with dual ratings', () => {
    expect(playersData.length).toBeGreaterThanOrEqual(500);
    for (const p of playersData) {
      expect(p.id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.battingRating).toBeGreaterThanOrEqual(40);
      expect(p.battingRating).toBeLessThanOrEqual(99);
      expect(p.bowlingRating).toBeGreaterThanOrEqual(20);
      expect(p.bowlingRating).toBeLessThanOrEqual(99);
      expect(['Right', 'Left']).toContain(p.battingHand);
      expect(p.eras.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('defines 11 valid batting slots and 7 curated historical opponents', () => {
    expect(SLOTS.length).toBe(11);
    expect(OPPONENTS.length).toBe(7);
    expect(VENUES.length).toBeGreaterThanOrEqual(7);
    expect(TEAMS.length).toBeGreaterThanOrEqual(20); // 10 Nations + 10 IPL Teams
  });
});
