import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStumpdGame } from '../../src/hooks/useStumpdGame';
import playersData from '../../src/data/players.json';
import { Player } from '../../src/types/player';

describe('Game State Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages draft lifecycle through slots and into tournament fixtures', () => {
    const { result } = renderHook(() => useStumpdGame());
    expect(result.current.screen).toBe('home');

    // 1. Start Spin Mode
    act(() => {
      result.current.startMode('spin');
    });
    expect(result.current.screen).toBe('draft');
    expect(result.current.currentSlotIndex).toBe(0);
    expect(result.current.mulligansRemaining).toBe(3);

    // 2. Spin reels
    act(() => {
      result.current.spinReels();
    });
    expect(result.current.currentTeam).toBeDefined();
    expect(result.current.currentEra).toBeDefined();
    expect(result.current.currentCandidates.length).toBeGreaterThanOrEqual(1);

    // 3. Draft a candidate
    const pickedCandidate = result.current.currentCandidates[0];
    act(() => {
      result.current.draftPlayer(pickedCandidate);
    });
    expect(result.current.picks.length).toBe(1);
    expect(result.current.currentSlotIndex).toBe(1);

    // 4. Fill remaining 10 slots
    for (let i = 1; i < 11; i++) {
      const p = playersData[i] as Player;
      act(() => {
        result.current.draftPlayer(p);
      });
    }
    expect(result.current.picks.length).toBe(11);

    // 5. Transition to match campaign
    act(() => {
      result.current.proceedToMatches();
    });
    expect(result.current.screen).toBe('match');
    expect(result.current.currentMatchIndex).toBe(0);

    // 6. Simulate Match 1
    act(() => {
      result.current.playCurrentMatch();
    });
    expect(result.current.matchResults.length).toBe(1);
    expect(result.current.lastResult).toBeDefined();

    // 7. Advance to Match 2
    act(() => {
      result.current.nextMatch();
    });
    expect(result.current.currentMatchIndex).toBe(1);
  });

  it('configures daily mode with 0 mulligans and daily seed', () => {
    const { result } = renderHook(() => useStumpdGame());
    act(() => {
      result.current.startMode('daily');
    });
    expect(result.current.screen).toBe('draft');
    expect(result.current.mulligansRemaining).toBe(0);
  });
});
