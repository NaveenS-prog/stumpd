import { describe, it, expect, vi } from 'vitest';
import { getUniversalLeaderboard, saveToUniversalLeaderboard, getGameStats } from '../../src/utils/storage';

describe('Storage resilience under private browsing / quota errors', () => {
  it('does not throw and falls back to in-memory state when localStorage throws', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('QuotaExceededError / SecurityError');
    });

    expect(() => {
      saveToUniversalLeaderboard({
        teamName: 'Incognito XI',
        mode: 'International',
        totalScore: 900,
        grade: 'S',
        matchesWon: 7,
        totalMatches: 7,
        captainName: 'Dhoni',
        date: '2026-11-23',
        synergiesCount: 2,
        isInvincible: true,
      });
    }).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it('reads from in-memory fallback if localStorage.getItem throws', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => {
      throw new Error('SecurityError in private browsing');
    });

    expect(() => getUniversalLeaderboard()).not.toThrow();
    expect(Array.isArray(getUniversalLeaderboard())).toBe(true);

    expect(() => getGameStats()).not.toThrow();
    expect(getGameStats().gamesPlayed).toBeDefined();

    localStorage.getItem = originalGetItem;
  });
});
