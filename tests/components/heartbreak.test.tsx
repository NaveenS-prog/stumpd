import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TrophyHero } from '../../src/components/results/TrophyHero';
import { ResultsScreen } from '../../src/components/results/ResultsScreen';
import { formatEmojiGrid } from '../../src/utils/share';
import { MatchResult } from '../../src/types/tournament';
import { Player } from '../../src/types/player';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import playersData from '../../src/data/players.json';

describe('Invincible 7-0 & Heartbreak Near-Miss System', () => {
  const sampleUserXI: Player[] = playersData.slice(0, 11) as Player[];
  const opponents = INTERNATIONAL_OPPONENTS;
  const originalShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share');

  afterEach(() => {
    if (originalShareDescriptor) {
      Object.defineProperty(navigator, 'share', originalShareDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'share');
    }
  });

  it('renders Invincible 7-0 Trophy styling when undefeated', () => {
    render(
      <TrophyHero
        isChampion={true}
        isFinalist={false}
        winsCount={7}
        totalMatches={7}
      />
    );

    expect(screen.getByText(/INVINCIBLE 7-0 CHAMPIONS/i)).toBeDefined();
    expect(screen.getByText(/100% PERFECT/i)).toBeDefined();
  });

  it('renders Near-Miss Heartbreak styling when 6-1', () => {
    render(
      <TrophyHero
        isChampion={false}
        isFinalist={true}
        winsCount={6}
        totalMatches={7}
      />
    );

    expect(screen.getByText(/One Win From Immortality/i)).toBeDefined();
    expect(screen.getByText(/AGONIZING NEAR-MISS HEARTBREAK/i)).toBeDefined();
  });

  it('displays Heartbreak breakdown card in ResultsScreen for a 6-1 campaign', () => {
    const onPlayAgain = vi.fn();
    const matchResults: MatchResult[] = [
      { won: true, userScore: { runs: 180, wickets: 3, overs: 20 }, opponentScore: { runs: 160, wickets: 8, overs: 20 }, margin: 'Won by 20 runs', topPerformers: [] },
      { won: true, userScore: { runs: 175, wickets: 4, overs: 20 }, opponentScore: { runs: 155, wickets: 7, overs: 20 }, margin: 'Won by 20 runs', topPerformers: [] },
      { won: false, userScore: { runs: 162, wickets: 9, overs: 20 }, opponentScore: { runs: 168, wickets: 4, overs: 19.2 }, margin: 'Lost by 6 runs', topPerformers: [] }, // Primary Loss
      { won: true, userScore: { runs: 190, wickets: 2, overs: 20 }, opponentScore: { runs: 170, wickets: 6, overs: 20 }, margin: 'Won by 20 runs', topPerformers: [] },
      { won: true, userScore: { runs: 185, wickets: 5, overs: 20 }, opponentScore: { runs: 165, wickets: 8, overs: 20 }, margin: 'Won by 20 runs', topPerformers: [] },
      { won: true, userScore: { runs: 178, wickets: 4, overs: 20 }, opponentScore: { runs: 150, wickets: 9, overs: 20 }, margin: 'Won by 28 runs', topPerformers: [] },
      { won: true, userScore: { runs: 200, wickets: 3, overs: 20 }, opponentScore: { runs: 180, wickets: 7, overs: 20 }, margin: 'Won by 20 runs', topPerformers: [] },
    ];

    render(
      <ResultsScreen
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={onPlayAgain}
      />
    );

    expect(screen.getByText(/The Match That Broke Perfection/i)).toBeDefined();
    expect(screen.getAllByText(/Lost by 6 runs/i).length).toBeGreaterThanOrEqual(1);

    const replayBtn = screen.getByText(/Run It Back \(Re-spin\)/i);
    fireEvent.click(replayBtn);
    expect(onPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('formats Invincible and Heartbreak share card emoji grids', () => {
    const perfectOutcomes = [true, true, true, true, true, true, true];
    const perfectShare = formatEmojiGrid(perfectOutcomes, 'International Tour', 94, '2026-11-22', 'Virat Kohli', 2);
    expect(perfectShare).toContain('INVINCIBLE 7-0');
    expect(perfectShare).toContain('👑 MVP: Virat Kohli');
    expect(perfectShare).toContain('✨ Chemistry Synergies: 2 Active');

    const nearMissOutcomes = [true, true, true, true, true, true, false];
    const nearMissShare = formatEmojiGrid(nearMissOutcomes, 'IPL Championship', 90);
    expect(nearMissShare).toContain('🥈 Finalists (6-1 Heartbreak)');
  });

  it('shows 6-1 Final loss heartbreak card with singular Loss and One Win From Immortality', () => {
    const matchResults: MatchResult[] = [
      ...Array.from({ length: 6 }, () => ({
        won: true,
        userScore: { runs: 180, wickets: 4, overs: 20 },
        opponentScore: { runs: 160, wickets: 7, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [],
      })),
      {
        won: false,
        userScore: { runs: 165, wickets: 8, overs: 20 },
        opponentScore: { runs: 170, wickets: 5, overs: 19.4 },
        margin: 'Lost by 5 wickets',
        topPerformers: [],
      },
    ];

    render(
      <ResultsScreen
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.getByText(/One Win From Immortality!/i)).toBeDefined();
    expect(screen.getByText(/The Match That Broke Perfection/i)).toBeDefined();
    expect(screen.getByText(/6 Wins • 1 Loss/i)).toBeDefined();
  });

  it('shows Semi-Final Exit (5-1) card without 6-1 or One Win From Immortality copy', () => {
    const matchResults: MatchResult[] = [
      ...Array.from({ length: 5 }, () => ({
        won: true,
        userScore: { runs: 175, wickets: 4, overs: 20 },
        opponentScore: { runs: 155, wickets: 8, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [],
      })),
      {
        won: false,
        userScore: { runs: 150, wickets: 9, overs: 20 },
        opponentScore: { runs: 154, wickets: 4, overs: 18.5 },
        margin: 'Lost by 6 wickets',
        topPerformers: [],
      },
    ];

    const { container } = render(
      <ResultsScreen
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.getByText(/Semi-Final Exit \(5-1\)/i)).toBeDefined();
    expect(screen.queryByText(/One Win From Immortality!/i)).toBeNull();
    expect(container.textContent).not.toContain('6-1');
  });

  it('shows neither Heartbreak nor Semi-Final Exit card for 4-1 exit', () => {
    const matchResults: MatchResult[] = [
      ...Array.from({ length: 4 }, () => ({
        won: true,
        userScore: { runs: 175, wickets: 4, overs: 20 },
        opponentScore: { runs: 155, wickets: 8, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [],
      })),
      {
        won: false,
        userScore: { runs: 140, wickets: 10, overs: 19.1 },
        opponentScore: { runs: 172, wickets: 5, overs: 20 },
        margin: 'Lost by 32 runs',
        topPerformers: [],
      },
    ];

    render(
      <ResultsScreen
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    expect(screen.queryByText(/The Match That Broke Perfection/i)).toBeNull();
    expect(screen.queryByText(/Semi-Final Exit \(5-1\)/i)).toBeNull();
    expect(screen.queryByText(/One Win From Immortality!/i)).toBeNull();
  });

  it('shares campaign result with active synergies and user-only aggregated MVP', async () => {
    const allPlayers = playersData as Player[];
    const kohli = allPlayers.find((p) => p.id === 'virat-kohli')!;
    const abd = allPlayers.find((p) => p.id === 'ab-de-villiers')!;
    const others = allPlayers.filter((p) => p.id !== 'virat-kohli' && p.id !== 'ab-de-villiers').slice(0, 9);
    const synergyXI = [kohli, abd, ...others];

    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const matchResults: MatchResult[] = [
      {
        won: true,
        userScore: { runs: 180, wickets: 4, overs: 20 },
        opponentScore: { runs: 160, wickets: 7, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [
          { playerId: 'opp-superstar', playerName: 'Opponent Legend', runsScored: 150 },
          { playerId: kohli.id, playerName: kohli.name, runsScored: 60 },
        ],
        userScorecard: [
          { playerId: kohli.id, playerName: kohli.name, runsScored: 60 },
          { playerId: abd.id, playerName: abd.name, runsScored: 45 },
        ],
        userBowling: [
          { playerId: others[0].id, playerName: others[0].name, wicketsTaken: 2 },
        ],
      },
      {
        won: true,
        userScore: { runs: 190, wickets: 3, overs: 20 },
        opponentScore: { runs: 170, wickets: 8, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [
          { playerId: 'opp-superstar-2', playerName: 'Opponent Bowler', wicketsTaken: 5 },
          { playerId: abd.id, playerName: abd.name, runsScored: 55 },
        ],
        userScorecard: [
          { playerId: abd.id, playerName: abd.name, runsScored: 55 },
        ],
        userBowling: [
          { playerId: others[0].id, playerName: others[0].name, wicketsTaken: 3 },
        ],
      },
    ];

    render(
      <ResultsScreen
        userXI={synergyXI}
        captainId={kohli.id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    const shareButton = screen.getByRole('button', { name: /Share Result/i });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(shareMock).toHaveBeenCalledTimes(1);
    const sharedText: string = shareMock.mock.calls[0][0].text;
    expect(sharedText).toMatch(/✨ Chemistry Synergies: [1-9]\d* Active/);
    expect(sharedText).toContain(`👑 MVP: ${others[0].name}`);
    expect(sharedText).not.toContain('Opponent Legend');
    expect(sharedText).not.toContain('Opponent Bowler');
  });

  it('filters out opponent IDs when falling back to topPerformers-only match fixtures', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const matchResults: MatchResult[] = [
      {
        won: true,
        userScore: { runs: 185, wickets: 4, overs: 20 },
        opponentScore: { runs: 165, wickets: 8, overs: 20 },
        margin: 'Won by 20 runs',
        topPerformers: [
          { playerId: 'opp-1', playerName: 'Opponent Ace', runsScored: 110 },
          { playerId: sampleUserXI[3].id, playerName: sampleUserXI[3].name, runsScored: 58 },
        ],
      },
    ];

    render(
      <ResultsScreen
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        matchResults={matchResults}
        opponents={opponents}
        gameMode="International"
        onPlayAgain={vi.fn()}
      />
    );

    const shareButton = screen.getByRole('button', { name: /Share Result/i });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(shareMock).toHaveBeenCalledTimes(1);
    const sharedText: string = shareMock.mock.calls[0][0].text;
    expect(sharedText).toContain(`👑 MVP: ${sampleUserXI[3].name}`);
    expect(sharedText).not.toContain('Opponent Ace');
  });
});
