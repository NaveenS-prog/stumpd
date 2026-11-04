import React from 'react';
import { Era } from '../../types/player';

interface SpinWheelsProps {
  currentTeam: string | null;
  currentEra: Era | null;
  isSpinning: boolean;
  mulligansRemaining: number;
  onSpin: () => void;
  onMulligan: () => void;
  disableMulligan?: boolean;
}

export const SpinWheels: React.FC<SpinWheelsProps> = ({
  currentTeam,
  currentEra,
  isSpinning,
  mulligansRemaining,
  onSpin,
  onMulligan,
  disableMulligan = false,
}) => {
  return (
    <div className="w-full bg-turf-900 border border-turf-700 rounded-xl p-4 shadow-xl mb-6">
      <div className="text-center mb-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gold-400 font-bold">
          Slot Constraint Reels
        </span>
      </div>

      {/* The Two Slot Reels */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Team Reel */}
        <div className="relative overflow-hidden bg-turf-950 border-2 border-turf-700/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-inner">
          <span className="text-[10px] font-mono uppercase text-turf-400 tracking-wider mb-1">
            Country / Franchise
          </span>
          <div
            className={`text-lg md:text-xl font-black text-white text-center transition-all ${
              isSpinning ? 'animate-pulse blur-[1px]' : ''
            }`}
          >
            {currentTeam || 'Spin to Roll'}
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-400/50" />
        </div>

        {/* Era Reel */}
        <div className="relative overflow-hidden bg-turf-950 border-2 border-turf-700/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[96px] shadow-inner">
          <span className="text-[10px] font-mono uppercase text-turf-400 tracking-wider mb-1">
            Era
          </span>
          <div
            className={`text-lg md:text-xl font-black text-gold-400 text-center transition-all ${
              isSpinning ? 'animate-pulse blur-[1px]' : ''
            }`}
          >
            {currentEra || 'Spin to Roll'}
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gold-400/50" />
        </div>
      </div>

      {/* Actions: Spin and Mulligan */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSpin}
          disabled={isSpinning}
          className="flex-1 py-3 px-4 rounded-xl bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-lg hover:shadow-gold-400/20"
        >
          {isSpinning ? 'Spinning...' : 'Spin Slot Reels'}
        </button>

        <button
          type="button"
          onClick={onMulligan}
          disabled={isSpinning || mulligansRemaining <= 0 || disableMulligan}
          className="py-3 px-4 rounded-xl bg-turf-800 hover:bg-turf-700 disabled:opacity-40 disabled:cursor-not-allowed border border-turf-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <span>Mulligan</span>
          <span className="px-1.5 py-0.5 rounded bg-turf-950 text-gold-400 font-mono text-xs">
            {mulligansRemaining} left
          </span>
        </button>
      </div>
    </div>
  );
};
