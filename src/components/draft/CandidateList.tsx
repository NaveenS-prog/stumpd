import React from 'react';
import { Player } from '../../types/player';
import { CandidateCard } from './CandidateCard';

interface CandidateListProps {
  candidates: Player[];
  onSelectPlayer: (player: Player) => void;
  isSpinning?: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onSelectPlayer,
  isSpinning = false,
}) => {
  if (isSpinning) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-turf-900/50 border border-turf-800 rounded-xl">
        <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-mono text-gold-300 uppercase tracking-widest animate-pulse">
          Spinning Reels... Scouting Candidates
        </p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="w-full py-12 text-center bg-turf-900/50 border border-turf-800 rounded-xl">
        <p className="text-turf-400 text-sm">
          No candidates available. Spin the reels or use a mulligan!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-turf-200">
          Available Candidates ({candidates.length})
        </h3>
        <span className="text-xs text-turf-400">Select 1 player to fill the slot</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {candidates.map((player) => (
          <CandidateCard
            key={player.id}
            player={player}
            onSelect={onSelectPlayer}
          />
        ))}
      </div>
    </div>
  );
};
