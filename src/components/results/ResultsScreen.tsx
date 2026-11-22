import React, { useState } from 'react';
import { Player } from '../../types/player';
import { MatchResult, OpponentTeam } from '../../types/tournament';
import { TrophyHero } from './TrophyHero';
import { formatEmojiGrid, copyToClipboard, generateTeamCanvasCard } from '../../utils/share';

interface ResultsScreenProps {
  userXI: Player[];
  captainId: string | null;
  matchResults: MatchResult[];
  opponents: OpponentTeam[];
  gameMode: string;
  onPlayAgain: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  userXI,
  captainId,
  matchResults,
  opponents,
  gameMode,
  onPlayAgain,
}) => {
  const [copied, setCopied] = useState(false);

  const winsCount = matchResults.filter((r) => r.won).length;
  const totalMatches = matchResults.length;
  const isChampion = winsCount === totalMatches && totalMatches > 0;
  const isFinalist = !isChampion && winsCount >= 4;
  const isNearMiss = !isChampion && winsCount >= totalMatches - 2 && winsCount < totalMatches && totalMatches >= 5;

  const primaryLossIdx = matchResults.findIndex((r) => !r.won);
  const primaryLoss = primaryLossIdx !== -1 ? matchResults[primaryLossIdx] : null;
  const primaryLossOpponent = primaryLossIdx !== -1 ? opponents[primaryLossIdx] : null;

  const avgRating = Math.round(
    userXI.reduce((acc, p) => acc + (p.battingRating + p.bowlingRating) / 2, 0) / userXI.length
  );

  const handleCopyGrid = async () => {
    const outcomes = matchResults.map((r) => r.won);
    const allPerformers = matchResults.flatMap((r) => r.topPerformers || []);
    const mvp = allPerformers.length > 0 ? allPerformers[0].playerName : undefined;
    const todayStr = gameMode === 'Daily Stumpd' ? new Date().toISOString().split('T')[0] : undefined;
    const text = formatEmojiGrid(outcomes, gameMode, avgRating, todayStr, mvp);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadCard = () => {
    const cardDataUrl = generateTeamCanvasCard(userXI, captainId, `${gameMode} XI`);
    if (cardDataUrl) {
      const link = document.createElement('a');
      link.download = `stumpd-playing-xi-${Date.now()}.png`;
      link.href = cardDataUrl;
      link.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-16">
      <TrophyHero
        isChampion={isChampion}
        isFinalist={isFinalist}
        winsCount={winsCount}
        totalMatches={totalMatches}
      />

      {/* Heartbreak Breakdown Card for 6-1 or 5-2 near-misses */}
      {isNearMiss && primaryLoss && (
        <div className="bg-gradient-to-r from-red-950/70 via-turf-900 to-red-950/70 border-2 border-red-500/60 rounded-2xl p-5 md:p-6 mb-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">💔</span>
                <span className="text-xs font-mono font-black uppercase text-red-400 tracking-wider">
                  The Match That Broke Perfection
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white font-mono">
                Fixture {primaryLossIdx + 1}: Defeat vs {primaryLossOpponent?.name || 'Dynasty Opponent'}
              </h4>
              <p className="text-xs text-turf-300 mt-1">
                Margin: <span className="text-red-400 font-semibold">{primaryLoss.margin}</span> • Score: User XI {primaryLoss.userScore.runs}/{primaryLoss.userScore.wickets} vs {primaryLoss.opponentScore.runs}/{primaryLoss.opponentScore.wickets}
              </p>
              <p className="text-xs text-amber-300/90 font-mono mt-2">
                💡 Tactical Lesson: 1 more clutch boundary or a second specialist bowler could have delivered the 7-0 Invincible Gauntlet.
              </p>
            </div>
            <button
              type="button"
              onClick={onPlayAgain}
              className="shrink-0 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 animate-pulse"
            >
              <span>⚡ Run It Back (Re-spin)</span>
            </button>
          </div>
        </div>
      )}

      {/* Share Actions Bar */}
      <div className="bg-turf-900 border border-turf-700 rounded-2xl p-4 mb-8 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase text-gold-400 font-bold tracking-wider block">
            Share Your Achievement
          </span>
          <p className="text-xs text-turf-300">
            Export your campaign emoji grid or download high-res lineup card
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyGrid}
            className="py-2.5 px-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
          >
            <span>{copied ? '✓ Copied to Clipboard!' : '📋 Share Result'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="py-2.5 px-4 rounded-xl bg-turf-800 hover:bg-turf-700 text-white font-bold text-xs uppercase tracking-wider border border-turf-600 transition-all"
          >
            🖼️ Download Card
          </button>
        </div>
      </div>

      {/* Fixture Outcomes Grid */}
      <div className="bg-turf-900 border border-turf-700 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-4">
          Campaign Scorecards ({winsCount}/{totalMatches} Won)
        </h3>
        <div className="space-y-3">
          {matchResults.map((result, idx) => {
            const opp = opponents[idx];

            return (
              <div
                key={opp ? opp.id : idx}
                className="flex items-center justify-between p-3 rounded-xl bg-turf-950 border border-turf-800"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      result.won
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {result.won ? 'W' : 'L'}
                  </span>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      vs {opp ? opp.name : `Opponent ${idx + 1}`}
                    </span>
                    <span className="text-xs text-turf-400">{result.margin}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-white font-semibold">
                    {result.userScore.runs}/{result.userScore.wickets}
                  </span>
                  <span className="text-turf-500 mx-1.5">vs</span>
                  <span className="text-gold-400 font-semibold">
                    {result.opponentScore.runs}/{result.opponentScore.wickets}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Playing XI Summary */}
      <div className="bg-turf-900 border border-turf-700 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-4">
          Drafted Playing XI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {userXI.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-turf-950 border border-turf-800 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="text-gold-400 font-bold">{idx + 1}.</span>
                <span className="text-white font-medium">
                  {player.name} {player.id === captainId ? '(C)' : ''}
                </span>
              </div>
              <span className="text-turf-400">
                BAT {player.battingRating} • BOWL {player.bowlingRating}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-2xl hover:shadow-gold-400/30"
        >
          Draft New XI & Play Again 🏏
        </button>
      </div>
    </div>
  );
};
