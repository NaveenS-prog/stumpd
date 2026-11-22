import React from 'react';
import { OpponentTeam, Venue, MatchResult } from '../../types/tournament';
import { Player } from '../../types/player';
import { FixturePreview } from './FixturePreview';
import { PitchCard } from './PitchCard';
import { TossBanner } from './TossBanner';
import { LiveSimProgress } from './LiveSimProgress';
import { BoxScoreCard } from './BoxScoreCard';

interface MatchScreenProps {
  matchIndex: number;
  totalMatches: number;
  opponent: OpponentTeam;
  venue: Venue;
  userXI: Player[];
  captainId: string | null;
  lastResult: MatchResult | null;
  isSimulating: boolean;
  onPlayMatch: () => void;
  onNextMatch: () => void;
}

export const MatchScreen: React.FC<MatchScreenProps> = ({
  matchIndex,
  totalMatches,
  opponent,
  venue,
  userXI,
  captainId: _captainId,
  lastResult,
  isSimulating,
  onPlayMatch,
  onNextMatch,
}) => {
  const isFinalMatch = matchIndex >= totalMatches - 1;

  return (
    <div className="w-full max-w-4xl mx-auto pb-12">
      {/* Top Match Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase text-gold-400 font-bold tracking-widest">
          Campaign Fixture {matchIndex + 1} of {totalMatches}
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-turf-900 text-turf-300 border border-turf-700">
          T20 Rules • 20 Overs
        </span>
      </div>

      {/* When match simulation is active */}
      {isSimulating && (
        <LiveSimProgress
          isSimulating={isSimulating}
          opponentName={opponent.name}
          venueName={venue.name}
          userXI={userXI}
        />
      )}

      {/* Before match simulation: Pre-match scouting */}
      {!isSimulating && !lastResult && (
        <div className="space-y-4">
          <FixturePreview
            matchNumber={matchIndex + 1}
            totalMatches={totalMatches}
            opponent={opponent}
            venue={venue}
            userXI={userXI}
          />

          <PitchCard venue={venue} />

          <TossBanner
            winner="User XI"
            decision="bat"
            venueName={venue.name}
          />

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onPlayMatch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-xl hover:shadow-gold-400/25"
            >
              Play Match vs {opponent.name}
            </button>
          </div>
        </div>
      )}

      {/* After match simulation: Post-match scorecard */}
      {!isSimulating && lastResult && (
        <div className="space-y-4">
          <BoxScoreCard
            result={lastResult}
            userTeamName="User XI"
            opponentName={opponent.name}
          />

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onNextMatch}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-xl hover:shadow-gold-400/25"
            >
              {lastResult.won
                ? isFinalMatch
                  ? 'View Championship Podium 🏆'
                  : 'Proceed to Next Fixture ➔'
                : 'View Campaign Summary ➔'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
