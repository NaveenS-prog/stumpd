import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    const nearMissOutcomes = [true, true, false, true, true, true, true];
    const nearMissShare = formatEmojiGrid(nearMissOutcomes, 'IPL Championship', 90);
    expect(nearMissShare).toContain('Heartbreak');
  });
});
