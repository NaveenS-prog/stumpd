import React from 'react';
import { Player, PlayerRole } from '../../types/player';
import { GameMode } from '../../types/game';

interface CandidateCardProps {
  player: Player;
  onSelect: (player: Player) => void;
  disabled?: boolean;
  gameMode?: GameMode;
  synergyLinks?: {
    synergy: { id: string; name: string };
    willComplete: boolean;
    activePartners: string[];
  }[];
}

function getRoleBadge(role: PlayerRole): string {
  switch (role) {
    case 'Opener':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'TopOrder':
    case 'MiddleOrder':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'Finisher':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'Allrounder':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40';
    case 'Wicketkeeper':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'Spinner':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Pacer':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-turf-800 text-turf-200 border-turf-700';
  }
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  player,
  onSelect,
  disabled = false,
  gameMode = 'International',
  synergyLinks = [],
}) => {
  const isIPL = gameMode === 'IPL';

  return (
    <div
      onClick={() => !disabled && onSelect(player)}
      className="group relative bg-[#0A1813] hover:bg-[#12261E] border border-[#1F3F32] hover:border-gold-400/70 rounded-xl p-3 sm:p-4 transition-all duration-150 cursor-pointer shadow-md flex items-center justify-between gap-3"
    >
      {/* Left: Player Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase font-mono ${getRoleBadge(
              player.primaryRole
            )}`}
          >
            {player.primaryRole}
          </span>

          {player.trait && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono bg-amber-400/20 text-amber-300 border-amber-400/40 flex items-center gap-1"
              title={`${player.trait.name}: ${player.trait.description}`}
            >
              <span>⚡</span> {player.trait.name}
            </span>
          )}

          {synergyLinks.map((link, idx) => (
            <span
              key={idx}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono flex items-center gap-1 ${
                link.willComplete
                  ? 'bg-amber-400 text-black border-amber-300 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
              title={`Synergy partner of ${link.activePartners.join(', ')}`}
            >
              <span>✨</span> {link.willComplete ? 'Synergy Complete' : 'Synergy Link'}: {link.synergy.name}
            </span>
          ))}

          {isIPL ? (
            <>
              {player.iplCareers && player.iplCareers.length > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gold-400/20 text-gold-300 border border-gold-400/30">
                  {player.iplCareers.map((c) => c.franchise).join(', ')}
                </span>
              )}
              <span className="text-[10px] text-turf-400 font-mono">
                {player.country}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-turf-300 font-mono font-semibold">
                {player.country}
              </span>
              <span className="text-[10px] text-turf-400 font-mono">
                • {player.internationalEras?.length ? player.internationalEras.join(', ') : player.eras?.[0] || 'Modern'}
              </span>
            </>
          )}
        </div>

        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-gold-300 transition-colors truncate">
          {player.name}
        </h4>

        <div className="text-[11px] text-turf-400 mt-0.5 flex items-center gap-2">
          <span>{player.battingHand === 'Left' ? 'Left-hand' : 'Right-hand'}</span>
          {player.bowlingType && player.bowlingType !== 'None' && (
            <span>• {player.bowlingType}</span>
          )}
        </div>
      </div>

      {/* Right: Dual Ratings & Draft Action */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex flex-col items-end text-right font-mono">
          <span className="text-xs text-white font-bold leading-tight">
            BAT <span className="text-white">{player.battingRating}</span>
          </span>
          <span className="text-xs text-gold-400 font-bold leading-tight mt-0.5">
            BOWL <span className="text-gold-400">{player.bowlingRating}</span>
          </span>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(player);
          }}
          className="py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-sm"
        >
          Draft
        </button>
      </div>
    </div>
  );
};
