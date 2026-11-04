import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PitchCard } from '../../src/components/match/PitchCard';
import { FixturePreview } from '../../src/components/match/FixturePreview';
import { TossBanner } from '../../src/components/match/TossBanner';
import { BoxScoreCard } from '../../src/components/match/BoxScoreCard';
import { MatchScreen } from '../../src/components/match/MatchScreen';
import { VENUES } from '../../src/data/venues';
import { OPPONENTS } from '../../src/data/opponents';
import { Player } from '../../src/types/player';
import { MatchResult } from '../../src/types/tournament';
import playersData from '../../src/data/players.json';

describe('Match UI Components', () => {
  const venue = VENUES[0];
  const opponent = OPPONENTS[0];
  const sampleUserXI: Player[] = playersData.slice(0, 11) as Player[];

  const sampleResult: MatchResult = {
    won: true,
    userScore: { runs: 188, wickets: 4, overs: 20 },
    opponentScore: { runs: 172, wickets: 8, overs: 20 },
    margin: 'Won by 16 runs',
    playerOfTheMatch: {
      playerId: sampleUserXI[0].id,
      playerName: sampleUserXI[0].name,
      runsScored: 78,
      wicketsTaken: 0,
    },
    topPerformers: [
      {
        playerId: sampleUserXI[0].id,
        playerName: sampleUserXI[0].name,
        runsScored: 78,
        wicketsTaken: 0,
      },
    ],
  };

  it('renders pitch condition details and tactical boosts', () => {
    render(<PitchCard venue={venue} />);
    expect(screen.getByText(venue.name)).toBeDefined();
    expect(screen.getByText(venue.pitchDescription)).toBeDefined();
  });

  it('renders fixture preview with opponent strengths and captain', () => {
    render(
      <FixturePreview
        matchNumber={1}
        totalMatches={7}
        opponent={opponent}
        venue={venue}
        userXI={sampleUserXI}
      />
    );
    expect(screen.getByText(opponent.name)).toBeDefined();
    expect(screen.getByText(`Captain: ${opponent.captain}`)).toBeDefined();
  });

  it('renders toss banner with coin toss outcome', () => {
    render(
      <TossBanner
        winner="User"
        decision="bat"
        venueName={venue.name}
      />
    );
    expect(screen.getByText(/elected to bat/i)).toBeDefined();
  });

  it('renders box score card with scores and player of the match', () => {
    render(
      <BoxScoreCard
        result={sampleResult}
        userTeamName="User XI"
        opponentName={opponent.name}
      />
    );
    expect(screen.getByText('188/4')).toBeDefined();
    expect(screen.getByText('172/8')).toBeDefined();
    expect(screen.getByText('Won by 16 runs')).toBeDefined();
    expect(screen.getAllByText(sampleUserXI[0].name).length).toBeGreaterThanOrEqual(1);
  });

  it('renders complete match screen and triggers onPlayMatch', () => {
    const onPlay = vi.fn();
    const onNext = vi.fn();

    render(
      <MatchScreen
        matchIndex={0}
        totalMatches={7}
        opponent={opponent}
        venue={venue}
        userXI={sampleUserXI}
        captainId={sampleUserXI[0].id}
        lastResult={null}
        isSimulating={false}
        onPlayMatch={onPlay}
        onNextMatch={onNext}
      />
    );

    const playBtn = screen.getByRole('button', { name: /play match/i });
    fireEvent.click(playBtn);
    expect(onPlay).toHaveBeenCalledTimes(1);
  });
});
