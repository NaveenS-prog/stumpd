import React, { useState, useEffect } from 'react';
import { Player } from '../../types/player';

interface LiveSimProgressProps {
  isSimulating: boolean;
  opponentName: string;
  venueName?: string;
  userXI?: Player[];
  onSkip?: () => void;
}

export const LiveSimProgress: React.FC<LiveSimProgressProps> = ({
  isSimulating,
  opponentName,
  venueName = 'Home Ground',
  userXI = [],
  onSkip,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Pick a clutch player with trait or anomaly if available
  const clutchStar = userXI.find((p) => p.isAnomaly || p.trait) || userXI[0];

  useEffect(() => {
    if (!isSimulating) {
      setPhaseIndex(0);
      return;
    }

    const t1 = setTimeout(() => setPhaseIndex(1), 700);
    const t2 = setTimeout(() => setPhaseIndex(2), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSimulating]);

  if (!isSimulating) return null;

  const phases = [
    {
      title: 'Powerplay Firestorm (Overs 1–6)',
      tag: 'PHASE 1 • AGGRESSION',
      commentary: `Openers unleashing aerial shots over mid-on against ${opponentName}'s pace attack.`,
      metric: 'Projected Target: 185+ Runs',
    },
    {
      title: `Middle Overs Squeeze (${venueName})`,
      tag: 'PHASE 2 • TACTICAL CHESS',
      commentary: `Spinners controlling the drift and finding turn on the deck. Fielders saving vital boundaries!`,
      metric: 'Required Run Rate climbing: 9.8 RPO',
    },
    {
      title: '🔥 Final 2 Overs: Clutch Climax!',
      tag: 'PHASE 3 • DEATH OVERS',
      commentary: clutchStar?.trait
        ? `⚡ ${clutchStar.name} activates ${clutchStar.trait.name.toUpperCase()}! Pierces the gap for a clutch boundary!`
        : clutchStar?.isAnomaly
        ? `🌟 GOD-MODE ANOMALY ${clutchStar.name} (${clutchStar.anomalySeason}) unleashes maximum firepower!`
        : `16 runs needed off 10 balls. Ice-cold nerve in the final death overs!`,
      metric: 'Target: 22 needed off 12 balls',
    },
  ];

  const currentPhase = phases[phaseIndex] || phases[0];

  return (
    <div className="bg-gradient-to-b from-turf-900 via-turf-950 to-turf-900 border-2 border-gold-400/70 rounded-2xl p-4 sm:p-6 md:p-8 my-4 sm:my-6 text-center shadow-[0_0_30px_rgba(234,179,8,0.25)] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow pulse */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-gold-400/10 blur-3xl pointer-events-none" />

      {/* Skip Button */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-3 right-3 text-[10px] sm:text-[11px] font-mono font-bold text-turf-300 hover:text-gold-400 bg-turf-800 hover:bg-turf-700 px-2.5 sm:px-3 py-1.5 rounded-lg border border-turf-600 transition-all flex items-center gap-1 shadow-sm"
        >
          <span>⚡ Skip to Result</span>
        </button>
      )}

      {/* Stage Badge */}
      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-gold-400 font-extrabold px-2.5 sm:px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/30 mb-2 sm:mb-3 animate-pulse">
        {currentPhase.tag}
      </span>

      {/* Phase Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-wide uppercase font-mono mb-2">
        {currentPhase.title}
      </h3>

      {/* Dynamic Commentary Ticker */}
      <div className="bg-turf-950/80 border border-turf-700 rounded-xl px-4 py-3 max-w-lg mx-auto my-2 w-full text-center">
        <p className="text-xs md:text-sm text-turf-200 font-mono leading-relaxed">
          {currentPhase.commentary}
        </p>
      </div>

      {/* Live Metric */}
      <p className="text-xs font-mono font-bold text-gold-400 mt-2">
        📊 {currentPhase.metric}
      </p>

      {/* Progress Multi-Bar */}
      <div className="w-full max-w-md grid grid-cols-3 gap-2 mt-5">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            phaseIndex >= 0 ? 'bg-gold-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-turf-800'
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            phaseIndex >= 1 ? 'bg-gold-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-turf-800'
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            phaseIndex >= 2 ? 'bg-gold-400 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-turf-800'
          }`}
        />
      </div>
    </div>
  );
};
