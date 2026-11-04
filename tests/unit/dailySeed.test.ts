import { describe, it, expect, beforeEach } from 'vitest';
import { getDailySeed, createSeededRandom, getDailyDateString } from '../../src/engine/dailySeed';
import {
  getGameStats,
  recordTournamentFinish,
  isDailyCompletedToday,
  markDailyCompletedToday,
} from '../../src/utils/storage';

describe('Daily Seed & Deterministic PRNG', () => {
  it('generates reproducible pseudo-random numbers from the same calendar date seed', () => {
    const seed1 = getDailySeed('2026-11-04');
    const seed2 = getDailySeed('2026-11-04');
    expect(seed1).toBe(seed2);

    const prngA = createSeededRandom(seed1);
    const prngB = createSeededRandom(seed2);

    for (let i = 0; i < 20; i++) {
      expect(prngA()).toBeCloseTo(prngB(), 6);
    }
  });

  it('produces distinct seeds for different dates', () => {
    const seedToday = getDailySeed('2026-11-04');
    const seedTomorrow = getDailySeed('2026-11-05');
    expect(seedToday).not.toBe(seedTomorrow);
  });

  it('formats daily date string reliably as YYYY-MM-DD', () => {
    const dateStr = getDailyDateString(new Date('2026-11-04T12:00:00Z'));
    expect(dateStr).toBe('2026-11-04');
  });
});

describe('Local Storage Game Stats & Daily Lock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records tournament results and updates streak correctly', () => {
    const initialStats = getGameStats();
    expect(initialStats.gamesPlayed).toBe(0);

    recordTournamentFinish(true, 7);
    const statsAfterWin = getGameStats();
    expect(statsAfterWin.gamesPlayed).toBe(1);
    expect(statsAfterWin.tournamentsWon).toBe(1);
    expect(statsAfterWin.currentStreak).toBe(1);

    recordTournamentFinish(false, 4);
    const statsAfterLoss = getGameStats();
    expect(statsAfterLoss.gamesPlayed).toBe(2);
    expect(statsAfterLoss.tournamentsWon).toBe(1);
    expect(statsAfterLoss.currentStreak).toBe(0);
  });

  it('tracks daily completion lock per calendar day', () => {
    expect(isDailyCompletedToday('2026-11-04')).toBe(false);
    markDailyCompletedToday({ won: true, matchesWon: 7 }, '2026-11-04');
    expect(isDailyCompletedToday('2026-11-04')).toBe(true);
    expect(isDailyCompletedToday('2026-11-05')).toBe(false);
  });
});
