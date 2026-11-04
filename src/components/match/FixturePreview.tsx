import React from 'react';
import { OpponentTeam, Venue } from '../../types/tournament';
import { Player } from '../../types/player';

interface FixturePreviewProps {
  matchNumber: number;
  totalMatches: number;
  opponent: OpponentTeam;
  venue: Venue;
  userXI: Player[];
}

export const FixturePreview: React.FC<FixturePreviewProps> = ({
  matchNumber,
  totalMatches,
  opponent,
  venue,
  userXI,
}) => {
  const avgUserBatting = Math.round(
    userXI.reduce((acc, p) => acc + p.battingRating, 0) / userXI.length
  );
  const avgUserBowling = Math.round(
    userXI.reduce((acc, p) => acc + p.bowlingRating, 0) / userXI.length
  );

  return (
    <div className="bg-turf-900 border border-turf-700/80 rounded-xl p-5 shadow-xl mb-4">
      <div className="flex items-center justify-between pb-3 border-b border-turf-800 mb-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-gold-400 font-bold tracking-widest">
            Campaign Fixture {matchNumber} of {totalMatches} • {venue.name}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
            User XI <span className="text-turf-500 font-normal">vs</span> {opponent.name}
          </h2>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-turf-800 text-turf-300 border border-turf-700">
          {opponent.era} Squad
        </span>
      </div>

      {/* Opponent Intel Card */}
      <div className="bg-turf-950/80 border border-turf-800 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-base font-bold text-white">
              {opponent.name}
            </h3>
            <p className="text-xs text-turf-400 mt-0.5">
              {opponent.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono my-3 pt-2 border-t border-turf-900">
          <div>
            <span className="text-turf-500 block text-[10px] uppercase">Leader</span>
            <span className="text-white font-bold">{`Captain: ${opponent.captain}`}</span>
          </div>
          <div>
            <span className="text-turf-500 block text-[10px] uppercase">Danger Man</span>
            <span className="text-gold-400 font-bold">{opponent.keyPlayer}</span>
          </div>
        </div>

        {/* Strengths Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-turf-900">
          {opponent.strengths.map((str) => (
            <span
              key={str}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-turf-800/80 text-turf-300 border border-turf-700"
            >
              ★ {str}
            </span>
          ))}
        </div>
      </div>

      {/* User Team Scouting Summary */}
      <div className="grid grid-cols-2 gap-3 bg-turf-950/40 border border-turf-800/60 rounded-xl p-3 text-center">
        <div>
          <span className="text-[10px] font-mono uppercase text-turf-400 block">
            Your XI Avg Batting
          </span>
          <span className="text-lg font-black text-white">{avgUserBatting}</span>
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-turf-400 block">
            Your XI Avg Bowling
          </span>
          <span className="text-lg font-black text-gold-400">{avgUserBowling}</span>
        </div>
      </div>
    </div>
  );
};
