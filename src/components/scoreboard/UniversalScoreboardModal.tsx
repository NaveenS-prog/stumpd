import React from 'react';
import { getUniversalLeaderboard } from '../../utils/storage';

interface UniversalScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserScore?: number;
}

export const UniversalScoreboardModal: React.FC<UniversalScoreboardModalProps> = ({
  isOpen,
  onClose,
  currentUserScore,
}) => {
  if (!isOpen) return null;

  const leaderboard = getUniversalLeaderboard();

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'S+':
        return 'bg-amber-400 text-black border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]';
      case 'S':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'A':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'B':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-turf-800 text-turf-300 border-turf-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0A1813] border-2 border-gold-400/60 rounded-3xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1F3F32] mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-mono uppercase tracking-wide">
                Universal Scoreboard
              </h2>
              <span className="text-xs text-turf-400 font-mono">
                All-Time Playing XI Power Rankings (0–1000 Scale)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-turf-900 border border-turf-700 text-turf-300 hover:text-white transition-all text-xs font-mono"
          >
            ✕ Close
          </button>
        </div>

        {/* Scoreboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {leaderboard.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-turf-950/60 rounded-2xl border border-dashed border-turf-800 my-4">
              <span className="text-4xl mb-3">🏏</span>
              <h3 className="text-white font-mono font-bold text-sm sm:text-base mb-1">
                Scoreboard Awaiting Its First Champion
              </h3>
              <p className="text-turf-400 text-xs font-mono max-w-md leading-relaxed">
                No user teams saved yet. Complete a campaign, name your custom drafted XI on the results screen, and save it to immortalize your squad on the universal leaderboard!
              </p>
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const isHighlight =
                currentUserScore !== undefined && entry.totalScore === currentUserScore;

              return (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isHighlight
                      ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                      : idx === 0
                      ? 'bg-gradient-to-r from-[#172517] via-[#241F0A] to-[#172517] border-gold-400/50 shadow-md'
                      : 'bg-[#12261E] border-[#1F3F32]'
                  }`}
                >
                  {/* Rank & Team Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-gold-400 text-black shadow-md'
                          : idx === 1
                          ? 'bg-slate-300 text-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-turf-800 text-turf-300'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate font-mono">
                          {entry.teamName}
                        </span>
                        {entry.creatorName && (
                          <span className="text-[10px] font-mono text-gold-400/90 bg-gold-400/10 px-1.5 py-0.5 rounded border border-gold-400/20">
                            By {entry.creatorName}
                          </span>
                        )}
                        {entry.isInvincible && (
                          <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.5 rounded bg-gold-400 text-black">
                            👑 7-0 Invincible
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-turf-400">
                          ({entry.mode})
                        </span>
                      </div>
                      <span className="text-[11px] text-turf-300 block truncate mt-0.5">
                        Captain: {entry.captainName} • {entry.matchesWon}/{entry.totalMatches} W • {entry.date}
                      </span>
                    </div>
                  </div>

                  {/* Score & Grade */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                      <span className="text-base sm:text-lg font-black text-gold-400 font-mono">
                        {entry.totalScore}
                      </span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase font-mono ${getGradeBadge(
                          entry.grade
                        )}`}
                      >
                        {entry.grade}
                      </span>
                    </div>
                    <span className="text-[9px] text-turf-400 font-mono block">
                      {entry.synergiesCount > 0 ? `✨ ${entry.synergiesCount} Synergies` : 'Team Power'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-3 border-t border-[#1F3F32] flex items-center justify-between text-[11px] font-mono text-turf-400">
          <span>Ranked by Composite Batting, Bowling &amp; Balance</span>
          <span className="text-gold-400 font-bold">Top Score: 1000 Pts</span>
        </div>
      </div>
    </div>
  );
};
