import React, { useState } from 'react';
import { GameMode } from '../../types/game';
import { StoredGameStats } from '../../utils/storage';

interface HomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  stats: StoredGameStats;
  isDailyLocked: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  stats,
  isDailyLocked,
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="text-center py-6 sm:py-8 px-3 sm:px-4 bg-gradient-to-b from-turf-900 via-turf-950 to-turf-900 border border-turf-700/80 rounded-2xl sm:rounded-3xl shadow-2xl mb-6 sm:mb-8 relative overflow-hidden">
        <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3">🏏</div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-wider uppercase font-mono">
          STUMPD<span className="text-gold-400">.</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-turf-300 max-w-lg mx-auto mt-2 leading-relaxed px-1">
          11-Slot Cricket Drafting & Tactical Tournament Gauntlet. Choose your ecosystem: conquer world cricket in <strong>International Tour</strong> or dominate the franchise league in <strong>IPL Championship</strong>.
        </p>

        {/* Career Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-xl mx-auto mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-turf-800/80">
          <div className="bg-turf-950/60 p-2 sm:p-2.5 rounded-xl border border-turf-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-turf-400 uppercase block">
              Tournaments Won
            </span>
            <span className="text-lg sm:text-xl font-black text-gold-400">
              {stats.tournamentsWon}
            </span>
          </div>
          <div className="bg-turf-950/60 p-2 sm:p-2.5 rounded-xl border border-turf-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-turf-400 uppercase block">
              Matches Won
            </span>
            <span className="text-lg sm:text-xl font-black text-white">
              {stats.matchesWon}
            </span>
          </div>
          <div className="bg-turf-950/60 p-2 sm:p-2.5 rounded-xl border border-turf-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-turf-400 uppercase block">
              Current Streak
            </span>
            <span className="text-lg sm:text-xl font-black text-gold-400">
              {stats.currentStreak} 🔥
            </span>
          </div>
          <div className="bg-turf-950/60 p-2 sm:p-2.5 rounded-xl border border-turf-800">
            <span className="text-[9px] sm:text-[10px] font-mono text-turf-400 uppercase block">
              Best Streak
            </span>
            <span className="text-lg sm:text-xl font-black text-white">
              {stats.maxStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Championship Tournaments (Featured Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6">
        {/* Mode 1: International Tour */}
        <div className="bg-gradient-to-br from-[#12261E] to-[#0A1813] border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-2xl sm:text-3xl shrink-0">🌍</span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate">
                10 Test Nations • 1980s–Modern
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-mono">
              International Tour
            </h3>
            <p className="text-xs text-turf-300 leading-relaxed mb-4">
              Spin reels for 10 Test Nations &amp; 5 decades of cricket. Draft legends like Viv Richards, Imran Khan, Tendulkar, and Ponting to conquer the 7-match World Gauntlet.
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-5 text-[9px] sm:text-[10px] font-mono text-emerald-400/90">
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">IND</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">AUS</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">ENG</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">WI</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">PAK</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">SA</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">NZ</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-emerald-500/20">SL</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('International')}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Play International Tour ➔</span>
          </button>
        </div>

        {/* Mode 2: IPL Championship */}
        <div className="bg-gradient-to-br from-[#1B1E12] to-[#0A1813] border-2 border-gold-400/50 hover:border-gold-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between transition-all duration-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-2xl group-hover:bg-gold-400/10 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-2xl sm:text-3xl shrink-0">⚡</span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 sm:px-2.5 py-1 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/40 truncate">
                10 Franchises • 4 IPL Eras
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-mono">
              IPL Championship
            </h3>
            <p className="text-xs text-turf-300 leading-relaxed mb-4">
              Pure franchise cricket. Spin reels for CSK, MI, RCB, KKR, RR, SRH, DC, PK, LSG, GT and authentic IPL eras (2008–Present). Face 7 legendary champion dynasties.
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-5 text-[9px] sm:text-[10px] font-mono text-gold-400/90">
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">CSK</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">MI</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">RCB</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">KKR</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">RR</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">SRH</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">DC</span>
              <span className="px-2 py-0.5 rounded bg-[#07110D] border border-gold-400/20">GT</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('IPL')}
            className="w-full py-3.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>Play IPL Championship ➔</span>
          </button>
        </div>
      </div>

      {/* Secondary Modes: Daily Challenge & Sandbox */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Mode 3: Daily Stumpd */}
        <div className="bg-turf-900 border border-turf-700 hover:border-purple-400/70 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 sm:gap-4 transition-all">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl shrink-0">📅</span>
              <h4 className="text-sm sm:text-base font-bold text-white font-mono truncate">Daily Stumpd</h4>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                Daily Seed
              </span>
            </div>
            <p className="text-xs text-turf-300 truncate">
              Global synchronized daily seed. Zero redrafts. One shot.
            </p>
          </div>
          <button
            type="button"
            disabled={isDailyLocked}
            onClick={() => onStartGame('Daily Stumpd')}
            className="shrink-0 py-2.5 px-3.5 sm:px-4 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 min-h-[44px]"
          >
            {isDailyLocked ? 'Done ✓' : 'Daily'}
          </button>
        </div>

        {/* Mode 4: Practice Draft */}
        <div className="bg-turf-900 border border-turf-700 hover:border-blue-400/70 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-3 sm:gap-4 transition-all">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl shrink-0">🎯</span>
              <h4 className="text-sm sm:text-base font-bold text-white font-mono truncate">Practice Draft</h4>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                Sandbox
              </span>
            </div>
            <p className="text-xs text-turf-300 truncate">
              Unlimited redrafts. Experiment with team balance synergies.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('Practice Mode')}
            className="shrink-0 py-2.5 px-3.5 sm:px-4 rounded-xl bg-turf-800 hover:bg-turf-700 text-white font-bold text-xs uppercase tracking-wider border border-turf-600 transition-all shadow-md active:scale-95 min-h-[44px]"
          >
            Sandbox
          </button>
        </div>
      </div>

      {/* Rules & Tactical Guide Accordion */}
      <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-lg">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between text-left min-h-[40px]"
        >
          <span className="text-xs sm:text-sm font-bold text-white uppercase font-mono pr-2">
            📖 How to Play &amp; Tactical Guide
          </span>
          <span className="text-gold-400 text-xs sm:text-sm font-mono font-bold shrink-0">
            {showRules ? 'Hide ▲' : 'Read ▼'}
          </span>
        </button>

        {showRules && (
          <div className="mt-4 pt-4 border-t border-turf-800 space-y-3 text-xs text-turf-300 leading-relaxed">
            <p>
              <strong className="text-white">1. Mode Separation:</strong> In <em>International Tour</em>, you draft from 10 Test Nations and 5 historic decades. In <em>IPL Championship</em>, you draft exclusively from cricketers who played for that IPL franchise during that IPL era—no international leakage!
            </p>
            <p>
              <strong className="text-white">2. Slot Constraints:</strong> For each of the 11 positions, the slot reels spin a Team and Era. Only eligible players matching the slot role, team, and era can be drafted.
            </p>
            <p>
              <strong className="text-white">3. Team Balance Bonuses:</strong> A well-balanced cricket team receives up to +11% performance boosts for having at least 1 Wicketkeeper, 1 Spinner, 2 Strike Pacers, and 1 All-rounder.
            </p>
            <p>
              <strong className="text-white">4. Pitch Counterplay:</strong> Match venues alter ratings dramatically! Chepauk rewards Spinners (+20%), Lord's rewards Pacers (+20%), and Chinnaswamy boosts Power Hitters (+15%).
            </p>
            <p>
              <strong className="text-white">5. Captain Bonus:</strong> Designate your team captain to award them a +10% boost to both batting and bowling prowess.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
