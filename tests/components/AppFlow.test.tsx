import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../../src/App';
import { createSeededRandom, hashString } from '../../src/engine/dailySeed';
import { soundEngine } from '../../src/engine/audio';
import { getEventCounts } from '../../src/utils/analytics';
import playersData from '../../src/data/players.json';
import { Player } from '../../src/types/player';

const allPlayers = playersData as Player[];

describe('Full AppFlow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    soundEngine.setMuted(false);
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.spyOn(Math, 'random').mockImplementation(
      createSeededRandom(hashString('stumpd-app-flow-e2e'))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    soundEngine.setMuted(false);
    localStorage.clear();
  });

  it('plays full International Tour end-to-end: home -> 11-slot draft -> reorder -> matches -> cloud sync retry & success', async () => {
    const submittedPayloads: Array<Record<string, unknown>> = [];
    let submitCallCount = 0;

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      if (url.includes('/api/submit-score')) {
        submitCallCount += 1;
        const parsedBody = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
        submittedPayloads.push(parsedBody);

        if (submitCallCount === 1) {
          return new Response(
            JSON.stringify({ error: 'Upstream leaderboard timeout' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({
            id: 'global-e2e-1',
            teamName: parsedBody.teamName ?? 'International XI',
            creatorName: parsedBody.creatorName ?? undefined,
            mode: parsedBody.mode ?? 'International',
            totalScore: 890,
            grade: 'S',
            matchesWon: parsedBody.matchesWon ?? 7,
            totalMatches: parsedBody.totalMatches ?? 7,
            captainName: 'Captain',
            synergiesCount: 1,
            isInvincible: true,
            createdAt: '2026-11-26T00:00:00.000Z',
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (url.includes('universal_leaderboard')) {
        return new Response(
          JSON.stringify([
            {
              id: 'global-e2e-1',
              team_name: 'E2E Invincibles',
              creator_name: 'Coach E2E',
              mode: 'International',
              total_score: 890,
              grade: 'S',
              matches_won: 7,
              total_matches: 7,
              captain_name: 'Captain',
              synergies_count: 1,
              is_invincible: true,
              created_at: '2026-11-26T00:00:00.000Z',
            },
          ]),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    // Home screen renders single sound toggle (no redundant HomeScreen top bar) and single mute analytics event
    expect(screen.getByRole('button', { name: /Play International Tour/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /sound|mute/i })).toHaveLength(1);
    expect(screen.queryByText(/Stumpd\. Dual Tournament Edition/i)).not.toBeInTheDocument();

    const muteEventsBefore = getEventCounts().mute_toggled ?? 0;
    const headerMuteBtn = screen.getByRole('button', { name: /Toggle Sound/i });
    fireEvent.click(headerMuteBtn);
    expect((getEventCounts().mute_toggled ?? 0) - muteEventsBefore).toBe(1);
    fireEvent.click(headerMuteBtn);
    expect((getEventCounts().mute_toggled ?? 0) - muteEventsBefore).toBe(2);

    // 1. Click Play International Tour -> goes straight to Draft (no MatchSetupScreen)
    fireEvent.click(screen.getByRole('button', { name: /Play International Tour/i }));
    expect(screen.queryByText(/Match Setup & Tactical Intel/i)).not.toBeInTheDocument();
    expect(screen.getByText('0/11 Positions Selected')).toBeInTheDocument();

    // 2. Spin and draft all 11 slots
    for (let slot = 0; slot < 11; slot++) {
      fireEvent.click(screen.getByRole('button', { name: /Spin for Nation & Era/i }));
      const draftButtons = screen.getAllByRole('button', { name: /^Draft$/i });
      expect(draftButtons.length).toBeGreaterThanOrEqual(1);
      fireEvent.click(draftButtons[0]);
    }

    expect(screen.getByText(/Playing XI Complete!/i)).toBeInTheDocument();
    expect(screen.getByText('11/11 Positions Selected')).toBeInTheDocument();

    const getTeamSheetOrder = () =>
      screen
        .getAllByRole('button', { name: /^Make .* captain$/i })
        .map((btn) => btn.getAttribute('aria-label')!.replace(/^Make /, '').replace(/ captain$/, ''));

    const initialOrder = getTeamSheetOrder();
    expect(initialOrder).toHaveLength(11);

    // 3. Open Adjust Lineup & Captain modal, assert all 11 players appear, move Slot 1 down, confirm
    fireEvent.click(screen.getByRole('button', { name: /Adjust Lineup & Captain/i }));
    const reorderDialog = screen.getByRole('dialog');
    expect(within(reorderDialog).getByText(/Tactical Lineup & Captain/i)).toBeInTheDocument();

    for (const playerName of initialOrder) {
      expect(within(reorderDialog).getByText(playerName)).toBeInTheDocument();
    }

    const moveDownButtons = within(reorderDialog).getAllByRole('button', { name: 'Move Down' });
    expect(moveDownButtons).toHaveLength(11);
    fireEvent.click(moveDownButtons[0]);

    fireEvent.click(within(reorderDialog).getByRole('button', { name: /Confirm Starting XI/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const updatedOrder = getTeamSheetOrder();
    expect(updatedOrder).toHaveLength(11);
    expect(updatedOrder[0]).toBe(initialOrder[1]);
    expect(updatedOrder[1]).toBe(initialOrder[0]);
    expect(updatedOrder.slice(2)).toEqual(initialOrder.slice(2));

    // 4. Enter Tournament Campaign and play matches through to ResultsScreen
    fireEvent.click(screen.getByRole('button', { name: /Enter Tournament Campaign/i }));
    expect(screen.getByText(/^Campaign Fixture 1 of 7$/i)).toBeInTheDocument();

    let reachedResults = false;
    for (let matchIdx = 0; matchIdx < 7; matchIdx++) {
      fireEvent.click(screen.getByRole('button', { name: /Play Match vs/i }));

      if (matchIdx === 0) {
        expect(screen.getByRole('button', { name: /View Detailed Scorecard/i })).toBeInTheDocument();
      }

      const nextFixtureBtn = screen.queryByRole('button', { name: /Proceed to Next Fixture/i });
      if (nextFixtureBtn) {
        fireEvent.click(nextFixtureBtn);
        continue;
      }

      const finishBtn =
        screen.queryByRole('button', { name: /View Championship Podium/i }) ||
        screen.queryByRole('button', { name: /View Campaign Summary/i });
      expect(finishBtn).not.toBeNull();
      fireEvent.click(finishBtn!);
      reachedResults = true;
      break;
    }

    expect(reachedResults).toBe(true);
    expect(screen.getByText(/Name Your XI & Save to Scoreboard/i)).toBeInTheDocument();

    // 5. Save XI and verify /api/submit-score failure -> Retry Cloud Sync -> success
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Mumbai Mavericks/i), {
      target: { value: 'E2E Invincibles' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Captain Cool/i), {
      target: { value: 'Coach E2E' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save XI to Scoreboard/i }));

    await waitFor(() => {
      expect(screen.getByText(/Upstream leaderboard timeout/i)).toBeInTheDocument();
    });
    const retryBtn = screen.getByRole('button', { name: /Retry Cloud Sync/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Saved & Published to Global/i)).toBeInTheDocument();
    });

    expect(submitCallCount).toBe(2);
    expect(submittedPayloads).toHaveLength(2);
    const expectedPlayerIds = updatedOrder.map(
      (name) => allPlayers.find((p) => p.name === name)!.id
    );
    expect(submittedPayloads[1].playerIds).toEqual(expectedPlayerIds);
    expect(submittedPayloads[1].captainId).toBe(allPlayers.find((p) => p.name === initialOrder[0])!.id);
    expect(submittedPayloads[1].teamName).toBe('E2E Invincibles');
    expect(submittedPayloads[1].creatorName).toBe('Coach E2E');
    expect(Number(submittedPayloads[1].matchesWon)).toBeGreaterThanOrEqual(1);

    // 6. Open Scoreboard via ResultsScreen and verify highlighted entry from single App modal
    fireEvent.click(screen.getByRole('button', { name: /View Scoreboard/i }));
    const scoreboardDialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(scoreboardDialog).getByText('E2E Invincibles')).toBeInTheDocument();
    });
    const highlightedRow = within(scoreboardDialog)
      .getByText('E2E Invincibles')
      .closest('div[class*="border-amber-400"]');
    expect(highlightedRow).not.toBeNull();
  });
});
