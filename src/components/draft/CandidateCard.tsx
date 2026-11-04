import React from 'react';
import { Player } from '../../types/player';

interface CandidateCardProps {
  player: Player;
  onSelect: (player: Player) => void;
  disabled?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  player,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="relative group bg-gradient-to-b from-turf-900 to-turf-950 border border-turf-700/70 hover:border-gold-400/80 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Top Header: Country / Era / Role */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-turf-800 text-turf-300 border border-turf-700">
            {player.country}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-400/15 text-gold-300 border border-gold-400/30">
            {player.eras?.[0] || 'Modern'}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-turf-700/60 text-white">
            {player.primaryRole}
          </span>
        </div>

        {/* Player Name */}
        <h3 className="text-base font-bold text-white tracking-wide group-hover:text-gold-300 transition-colors">
          {player.name}
        </h3>

        {/* Handedness & Bowling Details */}
        <div className="text-[11px] text-turf-300/90 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
          <span>{player.battingHand === 'Left' ? 'Left-hand Bat' : 'Right-hand Bat'}</span>
          {player.bowlingType && <span>• {player.bowlingType}</span>}
        </div>

        {/* IPL Franchise Tag if applicable */}
        {player.franchise && player.franchise.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {player.franchise.map((ipl) => (
              <span
                key={ipl}
                className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-turf-800/80 text-turf-300 border border-turf-700"
              >
                {ipl}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ratings & Draft Action */}
      <div className="mt-4 pt-3 border-t border-turf-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Batting Rating */}
          <div className="flex flex-col items-center justify-center bg-turf-950/80 border border-turf-700 px-2 py-1 rounded-md min-w-[44px]">
            <span className="text-[9px] font-mono uppercase text-turf-400 font-semibold leading-none">
              BAT
            </span>
            <span className="text-sm font-black text-white leading-tight">
              {player.battingRating}
            </span>
          </div>

          {/* Bowling Rating */}
          <div className="flex flex-col items-center justify-center bg-turf-950/80 border border-turf-700 px-2 py-1 rounded-md min-w-[44px]">
            <span className="text-[9px] font-mono uppercase text-turf-400 font-semibold leading-none">
              BOWL
            </span>
            <span className="text-sm font-black text-gold-400 leading-tight">
              {player.bowlingRating}
            </span>
          </div>
        </div>

        {/* Draft Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(player)}
          className="flex-1 py-2 px-3 rounded-lg bg-gold-400 hover:bg-gold-300 disabled:opacity-50 disabled:cursor-not-allowed text-turf-950 font-black text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md hover:shadow-gold-400/20"
        >
          Draft
        </button>
      </div>
    </div>
  );
};
