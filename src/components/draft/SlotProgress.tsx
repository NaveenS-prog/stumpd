import { SlotDefinition } from '../../types/game';
import { Player } from '../../types/player';

interface SlotProgressProps {
  slots: SlotDefinition[];
  currentSlotIndex: number;
  picks: Player[];
}

export const SlotProgress: React.FC<SlotProgressProps> = ({
  slots,
  currentSlotIndex,
  picks,
}) => {
  const currentSlot = slots[currentSlotIndex] || slots[slots.length - 1];
  const percentComplete = Math.round((picks.length / slots.length) * 100);

  return (
    <section
      role="region"
      aria-label="Draft Progress"
      className="w-full bg-turf-900 border border-turf-700/60 rounded-xl p-3.5 sm:p-4 shadow-lg mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-gold-400 font-semibold">
            {`Draft Phase • Slot ${Math.min(currentSlotIndex + 1, slots.length)}/11`}
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-wide">
            {currentSlot ? currentSlot.name : 'Draft Completed'}
          </h2>
          <p className="text-xs text-turf-300 mt-0.5 line-clamp-1 sm:line-clamp-none">
            {currentSlot?.description}
          </p>
        </div>
        <div className="text-right shrink-0 ml-3">
          <span className="text-xl sm:text-2xl font-black text-gold-400">
            {picks.length}
            <span className="text-turf-400 text-xs sm:text-sm font-normal">/11</span>
          </span>
          <p className="text-[9px] sm:text-[10px] text-turf-400 uppercase tracking-wider">Picks In</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Draft slots completion percentage"
        className="w-full h-1.5 bg-turf-950 rounded-full overflow-hidden mb-3"
      >
        <div
          className="h-full bg-gradient-to-r from-turf-400 via-gold-400 to-gold-300 transition-all duration-300 ease-out"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* 11 Micro Slot Chips with Mobile Scroll Overflow Protection */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 sm:overflow-visible">
        <div className="grid grid-cols-11 gap-1 min-w-[340px] sm:min-w-0">
          {slots.map((slot, idx) => {
            const isFilled = idx < picks.length;
            const isCurrent = idx === currentSlotIndex;
            const pickedPlayer = picks[idx];

            return (
              <div
                key={slot.id}
                title={`${slot.name}: ${isFilled ? pickedPlayer?.name : 'Pending'}`}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-md border text-center transition-all ${
                  isCurrent
                    ? 'border-gold-400 bg-gold-400/15 shadow-[0_0_10px_rgba(229,169,59,0.25)] ring-1 ring-gold-400/50'
                    : isFilled
                    ? 'border-turf-500 bg-turf-800/80 text-turf-200'
                    : 'border-turf-800 bg-turf-950/60 text-turf-600'
                }`}
              >
                <span className={`text-[9px] font-mono font-bold leading-tight ${isCurrent ? 'text-gold-300' : ''}`}>
                  {idx + 1}
                </span>
                <span className="text-[8px] truncate max-w-full leading-tight font-sans mt-0.5 opacity-90">
                  {isFilled ? pickedPlayer?.name.split(' ').pop() : slot.shortName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
