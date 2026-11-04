import React from 'react';

interface LiveSimProgressProps {
  isSimulating: boolean;
  opponentName: string;
}

export const LiveSimProgress: React.FC<LiveSimProgressProps> = ({
  isSimulating,
  opponentName,
}) => {
  if (!isSimulating) return null;

  return (
    <div className="bg-turf-900 border border-gold-400/50 rounded-2xl p-8 my-6 text-center shadow-2xl flex flex-col items-center justify-center">
      <div className="relative mb-4">
        {/* Animated Cricket Ball */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-800 to-red-600 border-2 border-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce">
          <div className="w-full h-0.5 border-t border-dashed border-white/60 rotate-45" />
        </div>
        <div className="absolute -inset-1 rounded-full border border-gold-400/40 animate-ping" />
      </div>

      <h3 className="text-lg font-black text-white tracking-wide uppercase font-mono">
        Match In Progress...
      </h3>
      <p className="text-xs text-gold-400 font-mono mt-1 animate-pulse">
        Simulating 40 overs of high-stakes T20 action vs {opponentName}
      </p>

      <div className="w-48 h-1.5 bg-turf-950 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gold-400 animate-[pulse_1s_infinite] w-full" />
      </div>
    </div>
  );
};
