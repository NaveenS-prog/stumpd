import React, { useState } from 'react';
import { MatchResult } from '../../types/tournament';

interface BoxScoreCardProps {
  result: MatchResult;
  userTeamName?: string;
  opponentName: string;
}

export const BoxScoreCard: React.FC<BoxScoreCardProps> = ({
  result,
  userTeamName = 'User XI',
  opponentName,
}) => {
  const [showDetailedScorecard, setShowDetailedScorecard] = useState(false);

  return (
    <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl my-4">
      {/* Victory / Defeat Header */}
      <div className="text-center pb-3 sm:pb-4 border-b border-turf-800">
        <span
          className={`inline-block text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${
            result.won
              ? 'bg-gold-400 text-turf-950 shadow-md'
              : 'bg-red-500/20 text-red-400 border border-red-500/40'
          }`}
        >
          {result.won ? 'VICTORY' : 'DEFEAT'}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white">{result.margin}</h2>
      </div>

      {/* Main Scores Comparison */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4 sm:my-6">
        {/* User Inning */}
        <div className="bg-turf-950 border border-turf-800 rounded-xl p-3 sm:p-4 text-center">
          <span className="text-xs font-mono text-turf-400 uppercase tracking-wider block mb-1 truncate">
            {userTeamName}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {result.userScore.runs}/{result.userScore.wickets}
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-turf-400">
            ({result.userScore.overs} Overs)
          </span>
        </div>

        {/* Opponent Inning */}
        <div className="bg-turf-950 border border-turf-800 rounded-xl p-3 sm:p-4 text-center">
          <span className="text-xs font-mono text-turf-400 uppercase tracking-wider block mb-1 truncate">
            {opponentName}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gold-400">
            {result.opponentScore.runs}/{result.opponentScore.wickets}
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono text-turf-400">
            ({result.opponentScore.overs} Overs)
          </span>
        </div>
      </div>

      {/* Player of the Match */}
      {result.playerOfTheMatch && (
        <div className="bg-gradient-to-r from-turf-950 via-turf-800/80 to-turf-950 border border-gold-400/40 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏅</span>
            <div>
              <span className="text-[10px] font-mono uppercase text-gold-400 font-bold tracking-widest block">
                Player of the Match
              </span>
              <span className="text-sm font-bold text-white">
                {result.playerOfTheMatch.playerName}
              </span>
            </div>
          </div>
          <div className="text-right text-xs font-mono">
            {result.playerOfTheMatch.runsScored !== undefined && result.playerOfTheMatch.runsScored > 0 && (
              <span className="text-white font-bold block">
                {result.playerOfTheMatch.runsScored} runs
              </span>
            )}
            {result.playerOfTheMatch.wicketsTaken !== undefined && result.playerOfTheMatch.wicketsTaken > 0 && (
              <span className="text-gold-400 font-bold block">
                {result.playerOfTheMatch.wicketsTaken} wkts
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Performers Grid */}
      {result.topPerformers && result.topPerformers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-turf-300 mb-2">
            Top Match Performers
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {result.topPerformers.map((perf) => (
              <div
                key={perf.playerId}
                className="bg-turf-950/70 border border-turf-800 rounded-lg p-2.5 text-center"
              >
                <span className="text-xs font-bold text-white block truncate">
                  {perf.playerName}
                </span>
                <div className="text-[11px] font-mono text-turf-300 mt-1">
                  {perf.runsScored ? `${perf.runsScored}r ` : ''}
                  {perf.wicketsTaken ? `${perf.wicketsTaken}w` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Detailed Scorecard */}
      <div className="pt-2 border-t border-turf-800 text-center">
        <button
          type="button"
          onClick={() => setShowDetailedScorecard(!showDetailedScorecard)}
          className="text-xs font-mono text-gold-400 hover:text-gold-300 underline uppercase tracking-wider"
        >
          {showDetailedScorecard ? 'Hide Detailed Scorecard' : 'View Detailed Scorecard'}
        </button>
      </div>

      {showDetailedScorecard && result.userScorecard && (
        <div className="mt-4 pt-4 border-t border-turf-800 space-y-4">
          <div>
            <h5 className="text-xs font-mono font-bold text-white uppercase mb-2">
              {userTeamName} Batting
            </h5>
            <div className="space-y-1">
              {result.userScorecard.map((bat) => (
                <div
                  key={bat.playerId}
                  className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-turf-950/50"
                >
                  <span className="text-white">{bat.playerName}</span>
                  <span className="text-gold-400 font-bold">
                    {bat.runsScored} ({bat.ballsFaced}b, {bat.fours}x4, {bat.sixes}x6)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
