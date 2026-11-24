import React, { useState } from 'react';
import { Player } from '../../types/player';

interface LineupReorderModalProps {
  isOpen: boolean;
  players: Player[];
  captainId: string | null;
  onSelectCaptain: (id: string) => void;
  onReorder: (players: Player[]) => void;
  onClose: () => void;
}

export const LineupReorderModal: React.FC<LineupReorderModalProps> = ({
  isOpen,
  players,
  captainId,
  onSelectCaptain,
  onReorder,
  onClose,
}) => {
  const [ordered, setOrdered] = useState<Player[]>([...players]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...ordered];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setOrdered(next);
  };

  const moveDown = (index: number) => {
    if (index >= ordered.length - 1) return;
    const next = [...ordered];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setOrdered(next);
  };

  const handleSave = () => {
    onReorder(ordered);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lineup-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
    >
      <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-turf-800 mb-4">
          <div>
            <h2 id="lineup-modal-title" className="text-base sm:text-lg font-bold text-white uppercase font-mono">
              Tactical Lineup & Captain
            </h2>
            <p className="text-xs text-turf-300">
              Set batting order 1-11 and designate your Captain (+10% all-round boost)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lineup modal"
            className="text-turf-400 hover:text-white text-lg font-bold p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {ordered.map((player, idx) => {
            const isCaptain = player.id === captainId;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-turf-950 border border-turf-800 gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-turf-800 text-gold-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {player.name}
                      </span>
                      {isCaptain && (
                        <span className="text-[9px] sm:text-[10px] bg-gold-400 text-turf-950 font-black px-1.5 py-0.2 rounded shrink-0">
                          (C)
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-turf-400 block truncate">
                      {player.primaryRole} • Bat {player.battingRating} / Bowl {player.bowlingRating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="w-8 h-8 rounded bg-turf-800 hover:bg-turf-700 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition-all"
                    aria-label="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === ordered.length - 1}
                    className="w-8 h-8 rounded bg-turf-800 hover:bg-turf-700 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition-all"
                    aria-label="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectCaptain(player.id)}
                    className={`px-2 sm:px-2.5 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all min-h-[32px] ${
                      isCaptain
                        ? 'bg-gold-400 text-turf-950'
                        : 'bg-turf-800 hover:bg-turf-700 text-turf-300'
                    }`}
                  >
                    Captain
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-turf-800 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-turf-800 hover:bg-turf-700 text-turf-300 font-bold text-xs uppercase min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider min-h-[44px] flex items-center justify-center"
          >
            Confirm Starting XI
          </button>
        </div>
      </div>
    </div>
  );
};
