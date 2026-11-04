import React from 'react';

interface TrophyHeroProps {
  isChampion: boolean;
  isFinalist: boolean;
  winsCount: number;
  totalMatches: number;
}

export const TrophyHero: React.FC<TrophyHeroProps> = ({
  isChampion,
  isFinalist,
  winsCount,
  totalMatches,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-turf-900 via-turf-950 to-turf-900 border border-gold-400/50 rounded-3xl p-8 text-center shadow-2xl mb-8">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Icon */}
      <div className="text-6xl md:text-7xl mb-4 animate-bounce">
        {isChampion ? '🏆' : isFinalist ? '🥈' : '🎖️'}
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold block mb-1">
        Tournament Conclusion
      </span>

      <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase">
        {isChampion
          ? 'World Champions!'
          : isFinalist
          ? 'Tournament Finalists'
          : 'Campaign Complete'}
      </h1>

      <p className="text-sm md:text-base text-turf-300 max-w-md mx-auto mt-2 leading-relaxed">
        {isChampion
          ? 'Your tactically engineered XI conquered historical cricket dynasties across all venues!'
          : isFinalist
          ? 'An exceptional tournament run reaching the final stage against world-class opposition.'
          : 'A valiant effort in the tournament gauntlet. Build back stronger in your next draft.'}
      </p>

      {/* Record Badge */}
      <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-turf-900 border border-gold-400/40 text-gold-400 font-mono text-sm font-bold shadow-md">
        <span>{winsCount} Wins</span>
        <span>•</span>
        <span>{totalMatches - winsCount} Losses</span>
      </div>
    </div>
  );
};
