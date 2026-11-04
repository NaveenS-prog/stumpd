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
    <div className="w-full bg-[#12261E] border border-[#1F3F32] rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#1F3F32] mb-3">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
            Starting XI Team Sheet
          </h3>
          <span className="text-xs text-turf-400 font-mono">
            {picks.length}/11 Positions Selected
          </span>
        </div>

        {isComplete && onOpenReorder && (
          <button
            type="button"
            onClick={onOpenReorder}
            className="py-1 px-3 rounded-lg bg-gold-400 hover:bg-gold-300 text-turf-950 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Tactical Order
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {slots.map((slot, idx) => {
          const pickedPlayer = picks[idx];
          const isCurrent = idx === currentSlotIndex;
          const isCaptain = pickedPlayer && pickedPlayer.id === captainId;

          if (pickedPlayer) {
            return (
              <div
                key={slot.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0A1813] border border-[#1F3F32] hover:border-gold-400/40 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-5 font-mono text-gold-400 font-bold text-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white truncate">
                        {pickedPlayer.name}
                      </span>
                      {isCaptain && (
                        <span className="px-1 rounded bg-gold-400 text-turf-950 font-black text-[9px] uppercase">
                          C
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-turf-400 truncate">
                      {slot.name} • {pickedPlayer.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-2">
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-white font-semibold">
                      {pickedPlayer.battingRating}
                    </span>
                    <span className="text-turf-500 mx-0.5">/</span>
                    <span className="text-gold-400 font-semibold">
                      {pickedPlayer.bowlingRating}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCaptain(pickedPlayer.id)}
                    aria-label={`Make ${pickedPlayer.name} captain`}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                      isCaptain
                        ? 'bg-gold-400 text-turf-950'
                        : 'bg-[#152e24] hover:bg-turf-800 text-turf-300 border border-turf-700'
                    }`}
                  >
                    {isCaptain ? 'Captain' : 'Make (C)'}
                  </button>
                </div>
              </div>
            );
          }

          // Empty Slot Row
          return (
            <div
              key={slot.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                isCurrent
                  ? 'border-gold-400/80 bg-gold-400/10 text-gold-300 font-semibold'
                  : 'border-[#1F3F32]/50 bg-[#0A1813]/40 text-turf-500'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 font-mono text-center shrink-0">
                  {idx + 1}
                </span>
                <span className={isCurrent ? 'text-gold-300 font-bold' : 'text-turf-400'}>
                  {slot.name}
                </span>
              </div>

              {isCurrent && (
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest animate-pulse">
                  Spinning Now
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
