import { SlotDefinition } from '../../types/game';
import { Player } from '../../types/player';
import { getActiveSynergies } from '../../data/synergies';
import { calculateUniversalTeamScore } from '../../engine/teamScore';

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
  const activeSynergies = getActiveSynergies(picks);
  const teamScore = calculateUniversalTeamScore(picks, captainId);

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

      {/* Live Team Power Meter */}
      {picks.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-[#0A1813] border border-[#1F3F32]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-turf-400 font-bold">
              ⚡ Live Team Score &amp; Balance
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black font-mono text-gold-400">
                {teamScore.totalScore}/1000
              </span>
              <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-gold-400/20 text-gold-300 border border-gold-400/30">
                GRADE {teamScore.grade}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center">
            <div className="bg-turf-950/70 p-1 rounded border border-turf-800">
              <span className="text-turf-400 block">BAT</span>
              <span className="font-bold text-white">{teamScore.battingIndex}</span>
            </div>
            <div className="bg-turf-950/70 p-1 rounded border border-turf-800">
              <span className="text-turf-400 block">BOWL</span>
              <span className="font-bold text-white">{teamScore.bowlingIndex}</span>
            </div>
            <div className="bg-turf-950/70 p-1 rounded border border-turf-800">
              <span className="text-turf-400 block">BALANCE</span>
              <span className="font-bold text-white">{teamScore.balanceIndex}%</span>
            </div>
          </div>
        </div>
      )}

      {activeSynergies.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            <span>✨ Active Chemistry Synergies ({activeSynergies.length})</span>
          </div>
          <div className="space-y-1">
            {activeSynergies.map((syn) => (
              <div
                key={syn.id}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-transparent border border-amber-400/40 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <span>🤝</span> {syn.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                  {syn.battingBoost ? `+${Math.round(syn.battingBoost * 100)}% Bat ` : ''}
                  {syn.bowlingBoost ? `+${Math.round(syn.bowlingBoost * 100)}% Bowl` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      {pickedPlayer.trait && (
                        <span className="px-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-mono">
                          ⚡ {pickedPlayer.trait.name}
                        </span>
                      )}
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
