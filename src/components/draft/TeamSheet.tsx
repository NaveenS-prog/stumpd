import React from 'react';
import { SlotDefinition } from '../../types/game';
import { Player } from '../../types/player';

interface TeamSheetProps {
  slots: SlotDefinition[];
  picks: Player[];
  currentSlotIndex: number;
  captainId: string | null;
  onSelectCaptain: (playerId: string) => void;
  onOpenReorder?: () => void;
}

export const TeamSheet: React.FC<TeamSheetProps> = ({
  slots,
  picks,
  currentSlotIndex,
  captainId,
  onSelectCaptain,
  onOpenReorder,
}) => {
  const isComplete = picks.length === slots.length;

  return (
    <div className="w-full bg-turf-900 border border-turf-700/80 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-turf-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
            Starting XI Team Sheet
          </h2>
          <span className="text-xs text-turf-300">
            {picks.length}/11 Positions Selected
          </span>
        </div>

        {isComplete && onOpenReorder && (
          <button
            type="button"
            onClick={onOpenReorder}
            className="py-1.5 px-3 rounded-lg bg-gold-400 hover:bg-gold-300 text-turf-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Tactical Order
          </button>
        )}
      </div>

      <div className="space-y-2">
        {slots.map((slot, idx) => {
          const pickedPlayer = picks[idx];
          const isCurrent = idx === currentSlotIndex;
          const isCaptain = pickedPlayer && pickedPlayer.id === captainId;

          if (pickedPlayer) {
            return (
              <div
                key={slot.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-turf-950 border border-turf-700/80 hover:border-turf-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-turf-800 flex items-center justify-center font-mono font-bold text-xs text-gold-400">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {pickedPlayer.name}
                      </span>
                      {isCaptain && (
                        <span className="px-1.5 py-0.2 rounded bg-gold-400 text-turf-950 font-black text-[10px] uppercase">
                          (C)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-turf-400 flex items-center gap-2">
                      <span>{slot.name}</span>
                      <span>•</span>
                      <span>{pickedPlayer.country}</span>
                      <span>•</span>
                      <span>{pickedPlayer.primaryRole}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-white font-semibold">
                      {pickedPlayer.battingRating}
                    </span>
                    <span className="text-turf-500">/</span>
                    <span className="text-gold-400 font-semibold">
                      {pickedPlayer.bowlingRating}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCaptain(pickedPlayer.id)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      isCaptain
                        ? 'bg-gold-400 text-turf-950 shadow-sm'
                        : 'bg-turf-800 hover:bg-turf-700 text-turf-300 border border-turf-700'
                    }`}
                  >
                    {isCaptain ? 'Captain' : 'Make (C)'}
                  </button>
                </div>
              </div>
            );
          }

          // Empty Slot Placeholder
          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border border-dashed transition-all ${
                isCurrent
                  ? 'border-gold-400/80 bg-gold-400/5'
                  : 'border-turf-800/80 bg-turf-950/40 text-turf-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-turf-900 border border-turf-800 flex items-center justify-center font-mono font-bold text-xs text-turf-400">
                  {idx + 1}
                </span>
                <div>
                  <span className={`text-sm font-medium ${isCurrent ? 'text-gold-300 font-bold' : 'text-turf-400'}`}>
                    {slot.name}
                  </span>
                  <p className="text-[10px] text-turf-400/80">
                    {slot.description}
                  </p>
                </div>
              </div>

              {isCurrent && (
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest animate-pulse font-semibold">
                  On the Clock
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
