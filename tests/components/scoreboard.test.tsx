import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UniversalScoreboardModal } from '../../src/components/scoreboard/UniversalScoreboardModal';
import { ResultsScreen } from '../../src/components/results/ResultsScreen';
import { Player } from '../../src/types/player';
import { MatchResult } from '../../src/types/tournament';
import { clearUniversalLeaderboard, saveToUniversalLeaderboard, getUniversalLeaderboard } from '../../src/utils/storage';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import playersData from '../../src/data/players.json';

vi.mock('../../src/services/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  fetchGlobalLeaderboard: vi.fn(async () => ({ data: [], error: null })),
  submitToGlobalLeaderboard: vi.fn(async () => ({ data: null, error: null })),
}));

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

  it('renders saved user teams in UniversalScoreboardModal', () => {
    saveToUniversalLeaderboard({
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

    render(<UniversalScoreboardModal isOpen={true} onClose={vi.fn()} currentUserScore={925} />);

    // Switch to My Best Teams tab
    const localTabButton = screen.getByRole('button', { name: /My Best Teams/i });
    fireEvent.click(localTabButton);

    expect(screen.getByText('Bangalore Blasters')).toBeInTheDocument();
    expect(screen.getByText(/By Naveen/i)).toBeInTheDocument();
    expect(screen.getByText(/👑 7-0 Invincible/i)).toBeInTheDocument();
    expect(screen.getByText('925')).toBeInTheDocument();
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
    const coachInput = screen.getByPlaceholderText(/e.g. Coach Naveen/i);

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
});
