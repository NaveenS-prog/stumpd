import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UniversalScoreboardModal } from '../../src/components/scoreboard/UniversalScoreboardModal';
import { ResultsScreen } from '../../src/components/results/ResultsScreen';
import { Player } from '../../src/types/player';
import { MatchResult } from '../../src/types/tournament';
import { clearUniversalLeaderboard, saveToUniversalLeaderboard, getUniversalLeaderboard } from '../../src/utils/storage';
import { isSupabaseConfigured, submitToGlobalLeaderboard } from '../../src/services/supabase';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import playersData from '../../src/data/players.json';

vi.mock('../../src/services/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  fetchGlobalLeaderboard: vi.fn(async () => ({ data: [], error: null })),
  submitToGlobalLeaderboard: vi.fn(async () => ({ data: null, error: null })),
}));

const mockedIsSupabaseConfigured = vi.mocked(isSupabaseConfigured);
const mockedSubmitToGlobalLeaderboard = vi.mocked(submitToGlobalLeaderboard);

describe('Universal Scoreboard & Team Naming Flow', () => {
  const allPlayers = playersData as unknown as Player[];
  const userXI = allPlayers.slice(0, 11);
  const captainId = userXI[0].id;

  const sampleMatchResults: MatchResult[] = [
    {
      won: true,
      margin: 'Won by 18 runs',
      userScore: { runs: 185, wickets: 4, overs: 20 },
      opponentScore: { runs: 167, wickets: 8, overs: 20 },
      topPerformers: [],
      playerOfTheMatch: {
        playerId: userXI[0].id,
        playerName: userXI[0].name,
        runsScored: 75,
      },
    },
  ];

  const sampleOpponents = [INTERNATIONAL_OPPONENTS[0]];

  beforeEach(() => {
    clearUniversalLeaderboard();
    vi.clearAllMocks();
    mockedIsSupabaseConfigured.mockReset();
    mockedIsSupabaseConfigured.mockReturnValue(false);
    mockedSubmitToGlobalLeaderboard.mockReset();
    mockedSubmitToGlobalLeaderboard.mockResolvedValue({ data: null, error: null });
  });

  it('renders clean empty state in UniversalScoreboardModal when no teams exist', () => {
    render(<UniversalScoreboardModal isOpen={true} onClose={vi.fn()} />);

    // Default tab is global leaderboard, which prompts configuration when not connected
    expect(screen.getByText(/Universal Leaderboard Network/i)).toBeInTheDocument();

    // Click on local tab "My Best Teams"
    const localTabButton = screen.getByRole('button', { name: /My Best Teams/i });
    fireEvent.click(localTabButton);

    expect(screen.getByText(/My Best Teams Awaiting Its First Champion/i)).toBeInTheDocument();
    expect(screen.getByText(/No user teams saved yet/i)).toBeInTheDocument();
  });

  it('renders saved user teams in UniversalScoreboardModal and highlights only highlightEntryId', () => {
    const firstEntry = saveToUniversalLeaderboard({
      teamName: 'Bangalore Blasters',
      creatorName: 'Naveen',
      mode: 'IPL',
      totalScore: 925,
      grade: 'S',
      matchesWon: 7,
      totalMatches: 7,
      captainName: 'Virat Kohli',
      date: '2026-11-23',
      synergiesCount: 2,
      isInvincible: true,
    });
    saveToUniversalLeaderboard({
      teamName: 'Chennai Twin',
      creatorName: 'MSD',
      mode: 'IPL',
      totalScore: 925,
      grade: 'S',
      matchesWon: 6,
      totalMatches: 7,
      captainName: 'MS Dhoni',
      date: '2026-11-23',
      synergiesCount: 2,
      isInvincible: false,
    });

    render(
      <UniversalScoreboardModal
        isOpen={true}
        onClose={vi.fn()}
        highlightEntryId={firstEntry.id}
      />
    );

    // Switch to My Best Teams tab
    const localTabButton = screen.getByRole('button', { name: /My Best Teams/i });
    fireEvent.click(localTabButton);

    const highlightedRow = screen.getByText('Bangalore Blasters').closest('div[class*="border-amber-400"]');
    const nonHighlightedRow = screen.getByText('Chennai Twin').closest('div[class*="border-amber-400"]');
    expect(highlightedRow).not.toBeNull();
    expect(nonHighlightedRow).toBeNull();

    expect(screen.getByText('Bangalore Blasters')).toBeInTheDocument();
    expect(screen.getByText(/By Naveen/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 7-0 Invincible/i)).toBeInTheDocument();
    expect(screen.getAllByText('925')).toHaveLength(2);
  });

  it('allows user to customize team name and save XI on ResultsScreen', () => {
    render(
      <ResultsScreen
        userXI={userXI}
        captainId={captainId}
        matchResults={sampleMatchResults}
        opponents={sampleOpponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    // Initial check: not saved yet
    expect(getUniversalLeaderboard()).toHaveLength(0);
    expect(screen.getByText(/Name Your XI & Save to Scoreboard/i)).toBeInTheDocument();

    const teamNameInput = screen.getByPlaceholderText(/e.g. Mumbai Mavericks/i);
    const coachInput = screen.getByPlaceholderText(/Captain Cool/i);

    fireEvent.change(teamNameInput, { target: { value: 'Delhi Dominators' } });
    fireEvent.change(coachInput, { target: { value: 'Master Tactician' } });

    const saveButton = screen.getByRole('button', { name: /Save XI to Scoreboard/i });
    fireEvent.click(saveButton);

    // Should now be saved in storage and confirmed on screen
    const stored = getUniversalLeaderboard();
    expect(stored).toHaveLength(1);
    expect(stored[0].teamName).toBe('Delhi Dominators');
    expect(stored[0].creatorName).toBe('Master Tactician');

    expect(screen.getByText(/✓ Saved to Database!/i)).toBeInTheDocument();
    expect(screen.getByText(/Rank #1/i)).toBeInTheDocument();
  });

  it('saves Practice Mode runs locally without calling submitToGlobalLeaderboard and shows a local-only note', () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);

    render(
      <ResultsScreen
        userXI={userXI}
        captainId={captainId}
        matchResults={sampleMatchResults}
        opponents={sampleOpponents}
        gameMode="Practice Mode"
        onPlayAgain={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Save XI to Scoreboard/i }));

    expect(getUniversalLeaderboard()).toHaveLength(1);
    expect(mockedSubmitToGlobalLeaderboard).not.toHaveBeenCalled();
    expect(screen.getByText(/local-only/i)).toBeInTheDocument();
  });

  it('saves 0-1 runs locally without calling submitToGlobalLeaderboard and shows a local-only note', () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);
    const zeroWinResults: MatchResult[] = [
      {
        won: false,
        margin: 'Lost by 10 runs',
        userScore: { runs: 150, wickets: 8, overs: 20 },
        opponentScore: { runs: 160, wickets: 5, overs: 20 },
        topPerformers: [],
      },
    ];

    render(
      <ResultsScreen
        userXI={userXI}
        captainId={captainId}
        matchResults={zeroWinResults}
        opponents={sampleOpponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Save XI to Scoreboard/i }));

    expect(getUniversalLeaderboard()).toHaveLength(1);
    expect(mockedSubmitToGlobalLeaderboard).not.toHaveBeenCalled();
    expect(screen.getByText(/local-only/i)).toBeInTheDocument();
  });

  it('shows cloud sync error and working Retry Cloud Sync button when global submission fails', async () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);
    mockedSubmitToGlobalLeaderboard
      .mockResolvedValueOnce({ data: null, error: new Error('Rate limit exceeded') })
      .mockResolvedValueOnce({
        data: {
          id: 'global-123',
          teamName: 'International XI',
          mode: 'International',
          totalScore: 800,
          grade: 'A',
          matchesWon: 1,
          totalMatches: 1,
          captainName: userXI[0].name,
          synergiesCount: 0,
          isInvincible: false,
          createdAt: '2026-11-26T00:00:00Z',
        },
        error: null,
      });

    const onOpenScoreboard = vi.fn();

    render(
      <ResultsScreen
        userXI={userXI}
        captainId={captainId}
        matchResults={sampleMatchResults}
        opponents={sampleOpponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
        onOpenScoreboard={onOpenScoreboard}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Save XI to Scoreboard/i }));

    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry Cloud Sync/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/Saved & Published to Global/i)).toBeInTheDocument();
    });
    expect(mockedSubmitToGlobalLeaderboard).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button', { name: /View Scoreboard/i }));
    expect(onOpenScoreboard).toHaveBeenCalledWith('global-123');
  });

  it('guards against double-clicking Save XI to Scoreboard', async () => {
    mockedIsSupabaseConfigured.mockReturnValue(true);
    let resolveSubmit!: (value: { data: null; error: null }) => void;
    mockedSubmitToGlobalLeaderboard.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <ResultsScreen
        userXI={userXI}
        captainId={captainId}
        matchResults={sampleMatchResults}
        opponents={sampleOpponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save XI to Scoreboard/i });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(getUniversalLeaderboard()).toHaveLength(1);
    expect(mockedSubmitToGlobalLeaderboard).toHaveBeenCalledTimes(1);

    resolveSubmit({ data: null, error: null });
    await waitFor(() => {
      expect(mockedSubmitToGlobalLeaderboard).toHaveBeenCalledTimes(1);
    });
  });
});
