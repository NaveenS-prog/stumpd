import { describe, it, expect } from 'vitest';
import { getDailyDateString, getDailySeed, createSeededRandom } from '../../src/engine/dailySeed';
import { simulateMatch } from '../../src/engine/simulator';
import { Player } from '../../src/types/player';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';
import playersData from '../../src/data/players.json';

describe('IST Daily Date calculation & Determinism', () => {
  it('correctly shifts date past 18:30 UTC into next day IST', () => {
    // 2026-11-23 18:35:00 UTC = 2026-11-24 00:05:00 IST
    const eveningUTC = new Date('2026-11-23T18:35:00.000Z');
    expect(getDailyDateString(eveningUTC)).toBe('2026-11-24');

    // 2026-11-23 18:25:00 UTC = 2026-11-23 23:55:00 IST
    const earlierUTC = new Date('2026-11-23T18:25:00.000Z');
    expect(getDailyDateString(earlierUTC)).toBe('2026-11-23');
  });

  it('produces identical match scorecards for identical seeded PRNG', () => {
    const allPlayers = playersData as unknown as Player[];
    const userXI = allPlayers.slice(0, 11);
    const opponent = INTERNATIONAL_OPPONENTS[0];
    const venue = VENUES[0];

    const seed = getDailySeed('2026-11-24');
    const rng1 = createSeededRandom(seed);
    const rng2 = createSeededRandom(seed);

    const match1 = simulateMatch(userXI, opponent, venue, userXI[0].id, rng1);
    const match2 = simulateMatch(userXI, opponent, venue, userXI[0].id, rng2);

    expect(match1.won).toBe(match2.won);
    expect(match1.userScore.runs).toBe(match2.userScore.runs);
    expect(match1.userScore.wickets).toBe(match2.userScore.wickets);
    expect(match1.opponentScore.runs).toBe(match2.opponentScore.runs);
    expect(match1.opponentScore.wickets).toBe(match2.opponentScore.wickets);
    expect(match1.margin).toBe(match2.margin);
  });
});
