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
  const isInvincible = isChampion && winsCount === totalMatches && totalMatches >= 7;
  const isNearMiss = !isChampion && winsCount === totalMatches - 1 && totalMatches >= 5;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center shadow-2xl mb-6 sm:mb-8 border-2 transition-all ${
        isInvincible
          ? 'bg-gradient-to-b from-[#1C1805] via-turf-950 to-[#1C1805] border-gold-400 shadow-[0_0_35px_rgba(234,179,8,0.4)]'
          : isNearMiss
          ? 'bg-gradient-to-b from-[#1E0D10] via-turf-950 to-turf-900 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
          : 'bg-gradient-to-b from-turf-900 via-turf-950 to-turf-900 border-gold-400/50'
      }`}
    >
      {/* Background glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isInvincible
            ? 'bg-gold-400/20'
            : isNearMiss
            ? 'bg-red-500/15'
            : 'bg-gold-400/10'
        }`}
      />

      {/* Hero Icon */}
      <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">
        {isInvincible ? '👑 🏆 👑' : isChampion ? '🏆' : isNearMiss ? '💔 🥈' : isFinalist ? '🥈' : '🎖️'}
      </div>

      <span
        className={`text-[10px] sm:text-xs font-mono uppercase tracking-widest font-extrabold block mb-1 ${
          isInvincible
            ? 'text-gold-300 animate-pulse'
            : isNearMiss
            ? 'text-red-400'
            : 'text-gold-400'
        }`}
      >
        {isInvincible
          ? '🌟 THE INVINCIBLE GAUNTLET ACHIEVED'
          : isNearMiss
          ? '💔 AGONIZING NEAR-MISS HEARTBREAK'
          : 'Tournament Conclusion'}
      </span>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wide uppercase font-mono">
        {isInvincible
          ? 'INVINCIBLE 7-0 CHAMPIONS!'
          : isChampion
          ? 'World Champions!'
          : isNearMiss
          ? 'One Win From Immortality!'
          : isFinalist
          ? 'Tournament Finalists'
          : 'Campaign Complete'}
      </h1>

      <p className="text-sm md:text-base text-turf-300 max-w-md mx-auto mt-2 leading-relaxed">
        {isInvincible
          ? 'FLAWLESS PERFECTION! Your tactically engineered XI swept every historical dynasty without dropping a single match!'
          : isNearMiss
          ? 'Heartbreak! Just 1 single match kept you from the coveted Invincible 7-0 crown. Spin again and run it back!'
          : isChampion
          ? 'Your tactically engineered XI conquered historical cricket dynasties across all venues!'
          : isFinalist
          ? 'An exceptional tournament run reaching the final stage against world-class opposition.'
          : 'A valiant effort in the tournament gauntlet. Build back stronger in your next draft.'}
      </p>

      {/* Record Badge */}
      <div
        className={`inline-flex items-center gap-2 mt-6 px-5 py-2 rounded-full border font-mono text-sm font-bold shadow-md ${
          isInvincible
            ? 'bg-gold-400/20 border-gold-400 text-gold-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
            : isNearMiss
            ? 'bg-red-500/20 border-red-500/50 text-red-300'
            : 'bg-turf-900 border-gold-400/40 text-gold-400'
        }`}
      >
        <span>{winsCount} Wins</span>
        <span>•</span>
        <span>{totalMatches - winsCount} Losses</span>
        {isInvincible && <span className="text-xs bg-gold-400 text-black px-2 py-0.5 rounded font-black ml-1">100% PERFECT</span>}
      </div>
    </div>
  );
};
