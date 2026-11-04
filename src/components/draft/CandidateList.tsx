import React from 'react';
import { Player } from '../../types/player';
import { GameMode } from '../../types/game';
import { CandidateCard } from './CandidateCard';

interface CandidateListProps {
  candidates: Player[];
  onSelectPlayer: (player: Player) => void;
  isSpinning?: boolean;
  gameMode?: GameMode;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  onSelectPlayer,
  isSpinning = false,
  gameMode = 'International',
}) => {
  if (isSpinning) {
    return (
      <div className="w-full py-8 px-4 text-center bg-[#0A1813] border border-[#1F3F32] rounded-xl mb-6">
        <p className="text-xs font-mono text-gold-400 uppercase tracking-widest animate-pulse">
          ⚡ Spinning reels... scouting cricketers
        </p>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="w-full py-8 px-4 text-center bg-[#0A1813] border border-[#1F3F32] rounded-xl mb-6">
        <p className="text-xs text-turf-400 font-mono">
          Spin the reels above to discover eligible cricketers for this slot.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-turf-300">
          Available Candidates ({candidates.length})
        </span>
        <span className="text-[10px] text-turf-400 font-mono">
          Tap player to draft into XI
        </span>
      </div>

      <div className="space-y-2">
        {candidates.map((player) => (
          <CandidateCard
            key={player.id}
            player={player}
            onSelect={onSelectPlayer}
            gameMode={gameMode}
          />
        ))}
      </div>
    </div>
  );
};
