import { describe, it, expect } from 'vitest';
import { simulateMatch, calculatePitchAdjustedRatings } from '../../src/engine/simulator';
import { OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Tactical Match Simulation Engine', () => {
  const sampleUserXI: Player[] = playersData.slice(0, 11) as Player[];
  const dustbowlVenue = VENUES.find((v) => v.pitchType === 'Dustbowl')!;
  const greenSeamerVenue = VENUES.find((v) => v.pitchType === 'GreenSeamer')!;

  it('boosts spinners on dustbowls and pacers on green seamers', () => {
    const dustbowlAdj = calculatePitchAdjustedRatings(sampleUserXI, dustbowlVenue);
    const seamerAdj = calculatePitchAdjustedRatings(sampleUserXI, greenSeamerVenue);

    const spinner = sampleUserXI.find((p) => p.primaryRole === 'Spinner')!;
    const pacer = sampleUserXI.find((p) => p.primaryRole === 'Pacer')!;

    if (spinner) {
      expect(dustbowlAdj.bowlingRatings[spinner.id]).toBeGreaterThan(seamerAdj.bowlingRatings[spinner.id]);
    }
    if (pacer) {
      expect(seamerAdj.bowlingRatings[pacer.id]).toBeGreaterThan(dustbowlAdj.bowlingRatings[pacer.id]);
    }
  });

  it('produces complete match results with scorecards and realistic totals', () => {
    const opp = OPPONENTS[0];
    const result = simulateMatch(sampleUserXI, opp, dustbowlVenue, sampleUserXI[0].id);

    expect(typeof result.won).toBe('boolean');
    expect(result.userScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.userScore.wickets).toBeLessThanOrEqual(10);
    expect(result.opponentScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.topPerformers.length).toBeGreaterThanOrEqual(1);
    expect(result.playerOfTheMatch).toBeDefined();
    expect(typeof result.margin).toBe('string');
  });
});
