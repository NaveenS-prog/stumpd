import React, { useState } from 'react';
import { GameMode } from '../../types/game';
import { StoredGameStats } from '../../utils/storage';

interface HomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  stats: StoredGameStats;
  isDailyLocked: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  stats,
  isDailyLocked,
  isMuted,
  onToggleMute,
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      {/* Top Bar with Sound Toggle */}
      <div className="flex items-center justify-between py-2 mb-6">
        <span className="text-xs font-mono uppercase text-gold-400 font-bold tracking-widest">
          Stumpd. Web Edition
        </span>
        <button
          type="button"
          onClick={onToggleMute}
          className="px-3 py-1.5 rounded-lg bg-turf-900 border border-turf-700 text-xs font-mono text-turf-300 hover:text-white flex items-center gap-1.5 transition-all"
        >
          <span>{isMuted ? '🔇 Unmute' : '🔊 Sound FX'}</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="text-center py-8 px-4 bg-gradient-to-b from-turf-900 via-turf-950 to-turf-900 border border-turf-700/80 rounded-3xl shadow-2xl mb-8 relative overflow-hidden">
        <div className="text-5xl md:text-6xl mb-3">🏏</div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-wider uppercase font-mono">
          STUMPD<span className="text-gold-400">.</span>
        </h1>
        <p className="text-sm md:text-base text-turf-300 max-w-lg mx-auto mt-2 leading-relaxed">
          11-Slot Cricket Drafting & Tactical Tournament Campaign. Spin reels, engineer team balance, and outsmart historic cricket dynasties.
        </p>

        {/* Career Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mt-6 pt-6 border-t border-turf-800/80">
          <div className="bg-turf-950/60 p-2.5 rounded-xl border border-turf-800">
            <span className="text-[10px] font-mono text-turf-400 uppercase block">
              Tournaments Won
            </span>
            <span className="text-xl font-black text-gold-400">
              {stats.tournamentsWon}
            </span>
          </div>
          <div className="bg-turf-950/60 p-2.5 rounded-xl border border-turf-800">
            <span className="text-[10px] font-mono text-turf-400 uppercase block">
              Matches Won
            </span>
            <span className="text-xl font-black text-white">
              {stats.matchesWon}
            </span>
          </div>
          <div className="bg-turf-950/60 p-2.5 rounded-xl border border-turf-800">
            <span className="text-[10px] font-mono text-turf-400 uppercase block">
              Current Streak
            </span>
            <span className="text-xl font-black text-gold-400">
              {stats.currentStreak} 🔥
            </span>
          </div>
          <div className="bg-turf-950/60 p-2.5 rounded-xl border border-turf-800">
            <span className="text-[10px] font-mono text-turf-400 uppercase block">
              Best Streak
            </span>
            <span className="text-xl font-black text-white">
              {stats.maxStreak}
            </span>
          </div>
        </div>
      </div>

      {/* Game Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Mode 1: Spin Mode */}
        <div className="bg-turf-900 border border-turf-700 hover:border-gold-400/70 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎰</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-400/20 text-gold-300 border border-gold-400/30">
                Standard
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spin Mode</h3>
            <p className="text-xs text-turf-300 leading-relaxed mb-4">
              The classic tournament gauntlet. 11 slot constraints, 3 tactical mulligans, and a 7-match campaign against iconic teams.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('Spin Mode')}
            className="w-full py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Play Spin Mode
          </button>
        </div>

        {/* Mode 2: Daily Stumpd */}
        <div className="bg-turf-900 border border-turf-700 hover:border-gold-400/70 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">📅</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Daily Lock
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Daily Stumpd</h3>
            <p className="text-xs text-turf-300 leading-relaxed mb-4">
              Synchronized global seed. Zero mulligans. One shot per day to win the tournament and share your emoji grid.
            </p>
          </div>
          <button
            type="button"
            disabled={isDailyLocked}
            onClick={() => onStartGame('Daily Stumpd')}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            {isDailyLocked ? 'Completed Today ✓' : 'Play Daily Stumpd'}
          </button>
        </div>

        {/* Mode 3: Practice Mode */}
        <div className="bg-turf-900 border border-turf-700 hover:border-gold-400/70 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎯</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Sandbox
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Practice Draft</h3>
            <p className="text-xs text-turf-300 leading-relaxed mb-4">
              Unlimited mulligans and casual experimentation. Test team balance synergies and scout the 500+ player roster.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartGame('Practice Mode')}
            className="w-full py-3 rounded-xl bg-turf-800 hover:bg-turf-700 text-white font-bold text-xs uppercase tracking-wider border border-turf-600 transition-all shadow-md active:scale-95"
          >
            Practice Draft
          </button>
        </div>
      </div>

      {/* Rules & Tactical Guide Accordion */}
      <div className="bg-turf-900 border border-turf-700 rounded-2xl p-5 shadow-lg">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm font-bold text-white uppercase font-mono">
            📖 How to Play & Tactical Guide
          </span>
          <span className="text-gold-400 text-sm font-mono font-bold">
            {showRules ? 'Hide ▲' : 'Read ▼'}
          </span>
        </button>

        {showRules && (
          <div className="mt-4 pt-4 border-t border-turf-800 space-y-3 text-xs text-turf-300 leading-relaxed">
            <p>
              <strong className="text-white">1. Slot Constraints:</strong> For each of the 11 positions, the slot reels spin a Country or IPL Franchise and an Era (1980s to 2020s). Only eligible players matching the slot role, team, and era can be drafted.
            </p>
            <p>
              <strong className="text-white">2. Team Balance Bonuses:</strong> A well-balanced cricket team receives up to +11% performance boosts for having at least 1 Wicketkeeper, 1 Spinner, 2 Strike Pacers, and 1 All-rounder.
            </p>
            <p>
              <strong className="text-white">3. Pitch Counterplay:</strong> Match venues alter ratings dramatically! Chepauk rewards Spinners (+20%), Lord's rewards Pacers (+20%), and Chinnaswamy boosts Power Hitters (+15%).
            </p>
            <p>
              <strong className="text-white">4. Captain Bonus:</strong> Designate your team captain to award them a +10% boost to both batting and bowling prowess.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
