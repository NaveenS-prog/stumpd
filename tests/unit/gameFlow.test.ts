import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    const remainingPlayers = (playersData as Player[])
      .filter((p) => p.id !== pickedCandidate.id)
      .slice(0, 10);
    for (const p of remainingPlayers) {
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

  it('transitions directly to draft phase without pre-draft opponent or venue gate', () => {
    const { result } = renderHook(() => useStumpdGame());

    // Click start mode -> transitions directly to draft!
    act(() => {
      result.current.startMode('International');
    });
    expect(result.current.screen).toBe('draft');
    expect(result.current.selectedOpponent).toBeDefined();
    expect(result.current.selectedVenue).toBeDefined();
  });

  it('prevents duplicate picks and caps drafted picks at 11', () => {
    const { result } = renderHook(() => useStumpdGame());

    act(() => {
      result.current.startMode('International');
    });

    const firstPlayer = playersData[0] as Player;
    act(() => {
      result.current.draftPlayer(firstPlayer);
    });
    act(() => {
      result.current.draftPlayer(firstPlayer);
    });

    expect(result.current.picks).toHaveLength(1);
    expect(result.current.currentSlotIndex).toBe(1);

    for (let i = 1; i < 11; i++) {
      const p = playersData[i] as Player;
      act(() => {
        result.current.draftPlayer(p);
      });
    }
    expect(result.current.picks).toHaveLength(11);

    const twelfthPlayer = playersData[11] as Player;
    act(() => {
      result.current.draftPlayer(twelfthPlayer);
    });

    expect(result.current.picks).toHaveLength(11);
    expect(new Set(result.current.picks.map((p) => p.id)).size).toBe(11);
  });

  it('guards spin/mulligan while spinning and clears active spin interval on resetGame', () => {
    vi.useFakeTimers();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', 'false');

    try {
      const { result, unmount } = renderHook(() => useStumpdGame());

      act(() => {
        result.current.startMode('International');
      });
      expect(result.current.mulligansRemaining).toBe(3);

      act(() => {
        result.current.spinReels();
      });
      expect(result.current.isSpinning).toBe(true);

      // Mulligan and spinReels should be no-ops while already spinning
      act(() => {
        result.current.mulligan();
        result.current.spinReels();
      });
      expect(result.current.mulligansRemaining).toBe(3);

      // Advance one tick so interval is actively updating reels
      act(() => {
        vi.advanceTimersByTime(55);
      });
      expect(result.current.currentTeam).not.toBeNull();

      // Reset game while spinning: clears interval so no stale reel updates fire
      act(() => {
        result.current.resetGame();
      });
      expect(result.current.screen).toBe('home');
      expect(result.current.currentTeam).toBeNull();
      expect(result.current.currentEra).toBeNull();
      expect(result.current.isSpinning).toBe(false);
      expect(vi.getTimerCount()).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.currentTeam).toBeNull();
      expect(result.current.currentEra).toBeNull();
      expect(result.current.isSpinning).toBe(false);

      // Spin again and unmount while spinning: interval is cleared on unmount
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      act(() => {
        result.current.startMode('International');
      });
      act(() => {
        result.current.spinReels();
      });
      const clearsBeforeUnmount = clearIntervalSpy.mock.calls.length;
      unmount();
      expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(clearsBeforeUnmount);
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      vi.useRealTimers();
    }
  });

  it('resolves pending browser simulation on skipSimulation and cancels simTimeoutRef on resetGame', () => {
    vi.useFakeTimers();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VITEST', 'false');

    try {
      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
      const { result, unmount } = renderHook(() => useStumpdGame());

      act(() => {
        result.current.startMode('International');
      });
      for (const p of (playersData as Player[]).slice(0, 11)) {
        act(() => {
          result.current.draftPlayer(p);
        });
      }
      act(() => {
        result.current.proceedToMatches();
      });

      // Start match simulation in browser mode: stays simulating for 1800ms
      const callsBeforeSim = setTimeoutSpy.mock.calls.length;
      act(() => {
        result.current.playCurrentMatch();
      });
      expect(result.current.isSimulating).toBe(true);
      expect(result.current.lastResult).toBeNull();
      expect(result.current.matchResults).toHaveLength(0);
      const simCallIndex = setTimeoutSpy.mock.calls.findIndex(
        (call, idx) => idx >= callsBeforeSim && call[1] === 1800
      );
      expect(simCallIndex).toBeGreaterThanOrEqual(callsBeforeSim);
      const simTimerId = setTimeoutSpy.mock.results[simCallIndex]?.value;

      // Skip simulation commits immediately and cancels timer
      act(() => {
        result.current.skipSimulation();
      });
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.lastResult).not.toBeNull();
      expect(result.current.matchResults).toHaveLength(1);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(simTimerId);

      // Advancing timers after skipSimulation must not duplicate match result
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.matchResults).toHaveLength(1);

      // Start a new campaign simulation and resetGame mid-simulation
      act(() => {
        result.current.startMode('International');
      });
      for (const p of (playersData as Player[]).slice(0, 11)) {
        act(() => {
          result.current.draftPlayer(p);
        });
      }
      act(() => {
        result.current.proceedToMatches();
      });
      const callsBeforeResetSim = setTimeoutSpy.mock.calls.length;
      act(() => {
        result.current.playCurrentMatch();
      });
      expect(result.current.isSimulating).toBe(true);
      const resetSimCallIndex = setTimeoutSpy.mock.calls.findIndex(
        (call, idx) => idx >= callsBeforeResetSim && call[1] === 1800
      );
      expect(resetSimCallIndex).toBeGreaterThanOrEqual(callsBeforeResetSim);
      const resetSimTimerId = setTimeoutSpy.mock.results[resetSimCallIndex]?.value;

      // resetGame cancels pending simTimeoutRef so stale result never commits
      act(() => {
        result.current.resetGame();
      });
      expect(result.current.screen).toBe('home');
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.lastResult).toBeNull();
      expect(result.current.matchResults).toHaveLength(0);
      expect(clearTimeoutSpy).toHaveBeenCalledWith(resetSimTimerId);

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(result.current.lastResult).toBeNull();
      expect(result.current.matchResults).toHaveLength(0);

      // Also verify natural 1800ms completion in browser mode
      act(() => {
        result.current.startMode('International');
      });
      for (const p of (playersData as Player[]).slice(0, 11)) {
        act(() => {
          result.current.draftPlayer(p);
        });
      }
      act(() => {
        result.current.proceedToMatches();
      });
      act(() => {
        result.current.playCurrentMatch();
      });
      expect(result.current.isSimulating).toBe(true);
      act(() => {
        vi.advanceTimersByTime(1799);
      });
      expect(result.current.isSimulating).toBe(true);
      expect(result.current.lastResult).toBeNull();
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.lastResult).not.toBeNull();
      expect(result.current.lastResult?.userBatsFirst).toBe(result.current.tossOutcome.userBatsFirst);

      // Also verify unmount clears pending simTimeoutRef
      act(() => {
        result.current.startMode('International');
      });
      for (const p of (playersData as Player[]).slice(0, 11)) {
        act(() => {
          result.current.draftPlayer(p);
        });
      }
      act(() => {
        result.current.proceedToMatches();
      });
      act(() => {
        result.current.playCurrentMatch();
      });
      const clearsBeforeUnmount = clearTimeoutSpy.mock.calls.length;
      unmount();
      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(clearsBeforeUnmount);
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      vi.useRealTimers();
    }
  });

  it('keeps Daily Stumpd tossOutcome and match result deterministic across runs', () => {
    const runDailyOnce = () => {
      localStorage.clear();
      const { result, unmount } = renderHook(() => useStumpdGame());
      act(() => {
        result.current.startMode('daily');
      });
      for (const p of (playersData as Player[]).slice(0, 11)) {
        act(() => {
          result.current.draftPlayer(p);
        });
      }
      act(() => {
        result.current.proceedToMatches();
      });
      const toss = result.current.tossOutcome;
      act(() => {
        result.current.playCurrentMatch();
      });
      const match = result.current.lastResult!;
      unmount();
      return { toss, match };
    };

    const run1 = runDailyOnce();
    const run2 = runDailyOnce();

    expect(run1.toss).toBeDefined();
    expect(typeof run1.toss.userBatsFirst).toBe('boolean');
    expect(run1.match.userBatsFirst).toBe(run1.toss.userBatsFirst);
    expect(run1.toss).toEqual(run2.toss);
    expect(run1.match.won).toBe(run2.match.won);
    expect(run1.match.userScore).toEqual(run2.match.userScore);
    expect(run1.match.opponentScore).toEqual(run2.match.opponentScore);
    expect(run1.match.margin).toBe(run2.match.margin);
  });
});
