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
  const hasSpun = Boolean(currentTeam || currentEra);

  return (
    <div className="w-full bg-[#12261E] border border-[#1F3F32] rounded-2xl p-4 sm:p-5 shadow-2xl mb-5">
      {/* Wheels Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        {/* Team Reel */}
        <div className="bg-[#0A1813] border border-[#1F3F32] rounded-xl p-3 sm:p-4 text-center flex flex-col items-center justify-center min-h-[90px] sm:min-h-[105px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-turf-400 mb-1">
            Team / Nation
          </span>
          <div
            className={`text-lg sm:text-xl font-bold tracking-wide transition-all ${
              isSpinning
                ? 'text-gold-400 animate-pulse blur-[0.5px]'
                : currentTeam
                ? 'text-white'
                : 'text-turf-500'
            }`}
          >
            {currentTeam || '—'}
          </div>
        </div>

        {/* Era Reel */}
        <div className="bg-[#0A1813] border border-[#1F3F32] rounded-xl p-3 sm:p-4 text-center flex flex-col items-center justify-center min-h-[90px] sm:min-h-[105px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-turf-400 mb-1">
            Era
          </span>
          <div
            className={`text-lg sm:text-xl font-bold tracking-wide transition-all ${
              isSpinning
                ? 'text-gold-400 animate-pulse blur-[0.5px]'
                : currentEra
                ? 'text-gold-400'
                : 'text-turf-500'
            }`}
          >
            {currentEra || '—'}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      {!hasSpun ? (
        <button
          type="button"
          onClick={onSpin}
          disabled={isSpinning}
          className="w-full py-3.5 px-4 rounded-xl bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-lg shadow-gold-400/10 flex items-center justify-center gap-2"
        >
          <span>{isSpinning ? '🎡 Spinning Reels...' : '🎡 Spin for this slot'}</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMulligan}
            disabled={isSpinning || mulligansRemaining <= 0 || disableMulligan}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A1813] hover:bg-[#152e24] disabled:opacity-40 disabled:cursor-not-allowed border border-gold-400/40 text-gold-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>🔄 Mulligan Reel</span>
            <span className="px-1.5 py-0.5 rounded bg-turf-900 text-gold-300 font-mono text-[11px] border border-gold-400/20">
              {mulligansRemaining} left
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
