import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../../types/player';
import { MatchResult, OpponentTeam } from '../../types/tournament';
import { TrophyHero } from './TrophyHero';
import { formatEmojiGrid, shareCampaignResult, generateTeamCanvasCard } from '../../utils/share';
import { calculateUniversalTeamScore } from '../../engine/teamScore';
import { getDailyDateString } from '../../engine/dailySeed';
import { saveToUniversalLeaderboard, getUniversalLeaderboard } from '../../utils/storage';
import { submitToGlobalLeaderboard, isSupabaseConfigured } from '../../services/supabase';
import { UniversalScoreboardModal } from '../scoreboard/UniversalScoreboardModal';
import { trackEvent } from '../../utils/analytics';

interface ResultsScreenProps {
  userXI: Player[];
  captainId: string | null;
  matchResults: MatchResult[];
  opponents: OpponentTeam[];
  gameMode: string;
  onPlayAgain: () => void;
  onOpenScoreboard?: (highlightEntryId?: string) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  userXI,
  captainId,
  matchResults,
  opponents,
  gameMode,
  onPlayAgain,
  onOpenScoreboard,
}) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle');
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [teamName, setTeamName] = useState(`${gameMode} XI`);
  const [creatorName, setCreatorName] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);
  const [isGlobalSynced, setIsGlobalSynced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [globalSyncError, setGlobalSyncError] = useState<string | null>(null);
  const [savedLocalId, setSavedLocalId] = useState<string | null>(null);
  const [savedGlobalId, setSavedGlobalId] = useState<string | null>(null);
  const submitLockRef = useRef(false);
  const syncInFlightRef = useRef(false);

  const winsCount = matchResults.filter((r) => r.won).length;
  const totalMatches = matchResults.length;
  const isEligibleForGlobal = gameMode !== 'Practice Mode' && winsCount >= 1;
  const isChampion = winsCount === totalMatches && totalMatches > 0;
  const isFinalist = !isChampion && winsCount >= 4;
  const isNearMiss = !isChampion && winsCount >= totalMatches - 2 && winsCount < totalMatches && totalMatches >= 5;

  const primaryLossIdx = matchResults.findIndex((r) => !r.won);
  const primaryLoss = primaryLossIdx !== -1 ? matchResults[primaryLossIdx] : null;
  const primaryLossOpponent = primaryLossIdx !== -1 ? opponents[primaryLossIdx] : null;

  const teamScore = calculateUniversalTeamScore(userXI, captainId);

  useEffect(() => {
    trackEvent('round_completed', {
      score: teamScore.totalScore,
      grade: teamScore.grade,
      matchesWon: winsCount,
      totalMatches,
    });
  }, []);

  const syncToCloud = async (
    overrideTeamName?: string,
    overrideCreatorName?: string
  ) => {
    if (
      !isEligibleForGlobal ||
      !isSupabaseConfigured() ||
      isGlobalSynced ||
      syncInFlightRef.current
    ) {
      return;
    }
    syncInFlightRef.current = true;

    const finalTeamName = overrideTeamName ?? (teamName.trim() || `${gameMode} XI`);
    const trimmedCreator =
      overrideCreatorName !== undefined ? overrideCreatorName : creatorName.trim() || undefined;

    setIsSyncingCloud(true);
    setGlobalSyncError(null);
    try {
      const { data, error } = await submitToGlobalLeaderboard({
        teamName: finalTeamName,
        creatorName: trimmedCreator,
        mode: gameMode,
        playerIds: userXI.map((p) => p.id),
        captainId: captainId || userXI[0]?.id || '',
        matchesWon: winsCount,
        totalMatches,
      });

      if (error || !data) {
        setGlobalSyncError(error?.message || 'Failed to sync score to global leaderboard');
      } else {
        setIsGlobalSynced(true);
        setSavedGlobalId(data.id);
      }
    } catch (err) {
      setGlobalSyncError(
        err instanceof Error ? err.message : 'Failed to sync score to global leaderboard'
      );
    } finally {
      syncInFlightRef.current = false;
      setIsSyncingCloud(false);
    }
  };

  const handleSaveToLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSaved || submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const finalTeamName = teamName.trim() || `${gameMode} XI`;
      const trimmedCreator = creatorName.trim() || undefined;
      const isInvincible = winsCount === totalMatches && totalMatches >= 7;
      const captain = userXI.find((p) => p.id === captainId);

      const savedEntry = saveToUniversalLeaderboard({
        teamName: finalTeamName,
        creatorName: trimmedCreator,
        mode: gameMode,
        totalScore: teamScore.totalScore,
        grade: teamScore.grade,
        matchesWon: winsCount,
        totalMatches: totalMatches,
        captainName: captain?.name || 'Unassigned',
        date: new Date().toLocaleDateString(),
        synergiesCount: Math.round(teamScore.synergyPoints / 30),
        isInvincible,
      });

      const leaderboard = getUniversalLeaderboard();
      const rank = leaderboard.findIndex((entry) => entry.id === savedEntry.id) + 1;
      setSavedLocalId(savedEntry.id);
      setSavedRank(rank > 0 ? rank : 1);
      setIsSaved(true);

      if (isEligibleForGlobal && isSupabaseConfigured()) {
        await syncToCloud(finalTeamName, trimmedCreator);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenScoreboard = () => {
    const highlightId = savedGlobalId || savedLocalId || undefined;
    if (onOpenScoreboard) {
      onOpenScoreboard(highlightId);
    } else {
      setIsScoreboardOpen(true);
    }
  };

  const avgRating = Math.round(
    userXI.reduce((acc, p) => acc + (p.battingRating + p.bowlingRating) / 2, 0) / userXI.length
  );

  const handleShareGrid = async () => {
    const outcomes = matchResults.map((r) => r.won);
    const allPerformers = matchResults.flatMap((r) => r.topPerformers || []);
    const mvp = allPerformers.length > 0 ? allPerformers[0].playerName : undefined;
    const todayStr = gameMode === 'Daily Stumpd' ? getDailyDateString() : undefined;
    const text = formatEmojiGrid(outcomes, gameMode, avgRating, todayStr, mvp);
    const result = await shareCampaignResult(text, `Stumpd ${gameMode} XI`);
    trackEvent('share_clicked', { status: result, mode: gameMode });
    if (result === 'shared' || result === 'copied') {
      setShareStatus(result);
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  };

  const handleDownloadCard = () => {
    const cardDataUrl = generateTeamCanvasCard(userXI, captainId, teamName.trim() || `${gameMode} XI`);
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
              onClick={() => {
                trackEvent('replay_clicked', { source: 'near_miss_card' });
                onPlayAgain();
              }}
              className="shrink-0 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 animate-pulse"
            >
              <span>⚡ Run It Back (Re-spin)</span>
            </button>
          </div>
        </div>
      )}

      {/* Universal Team Score & Rating Card */}
      <div className="bg-gradient-to-r from-[#12261E] via-[#0A1813] to-[#12261E] border-2 border-gold-400/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#1F3F32] mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-extrabold block mb-1">
              Universal Team Rating &amp; Balance
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {teamScore.totalScore}
                <span className="text-sm font-normal text-turf-400">/1000</span>
              </span>
              <span className="text-xs font-black font-mono px-2.5 py-1 rounded-full bg-gold-400 text-black shadow-md">
                GRADE {teamScore.grade}
              </span>
            </div>
            <p className="text-xs text-turf-300 mt-1 font-mono">
              Batting: {teamScore.battingIndex} • Bowling: {teamScore.bowlingIndex} • Balance: {teamScore.balanceIndex}%
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenScoreboard}
            className="w-full sm:w-auto shrink-0 px-4 sm:px-5 py-3 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>🏆 Universal Scoreboard</span>
          </button>
        </div>

        {/* Strengths & Vulnerabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {teamScore.strengths.length > 0 && (
            <div className="bg-turf-950/70 p-3 rounded-xl border border-emerald-900/40">
              <span className="font-mono font-bold text-emerald-400 uppercase text-[10px] block mb-1.5">
                Tactical Strengths
              </span>
              <ul className="space-y-1 text-turf-200 font-mono text-[11px]">
                {teamScore.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {teamScore.vulnerabilities.length > 0 && (
            <div className="bg-turf-950/70 p-3 rounded-xl border border-red-950/40">
              <span className="font-mono font-bold text-red-400 uppercase text-[10px] block mb-1.5">
                Tactical Vulnerabilities
              </span>
              <ul className="space-y-1 text-red-200/90 font-mono text-[11px]">
                {teamScore.vulnerabilities.map((v, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Name Your Drafted XI & Save to Scoreboard */}
      <div className="bg-gradient-to-r from-[#12261E] via-[#0A1813] to-[#12261E] border-2 border-gold-400/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-xl shrink-0">✍️</span>
          <div>
            <h3 className="text-white font-mono font-bold text-sm uppercase tracking-wide">
              {isSaved ? 'Squad Immortalized on the Scoreboard' : 'Name Your XI & Save to Scoreboard'}
            </h3>
            <p className="text-xs text-turf-300 font-mono">
              {isSaved
                ? isGlobalSynced
                  ? 'Saved to local browser database and published live to Universal Leaderboard!'
                  : !isEligibleForGlobal
                  ? 'Saved in local-only mode — Practice Mode and 0-win runs are stored on your device only.'
                  : isSyncingCloud
                  ? 'Saved locally! Syncing your verified squad to the Global Leaderboard...'
                  : globalSyncError
                  ? 'Saved to local browser database, but cloud sync failed. Retry below.'
                  : 'Saved to local browser database! Visible across refreshes.'
                : 'Give your drafted lineup a custom team name to rank it on the Universal Scoreboard.'}
            </p>
          </div>
        </div>

        {isSaved ? (
          <div className="bg-turf-950/80 border border-gold-400/40 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    {isGlobalSynced
                      ? '✓ Saved & Published to Global 🌍'
                      : isSyncingCloud
                      ? '✓ Saved Locally • ⏳ Syncing to Global...'
                      : '✓ Saved to Database!'}
                  </span>
                  <span className="bg-gold-400 text-black text-[10px] font-black font-mono px-2 py-0.5 rounded uppercase">
                    Rank #{savedRank}
                  </span>
                </div>
                <p className="text-xs text-turf-200 font-mono">
                  Team: <span className="text-white font-bold">{teamName.trim() || `${gameMode} XI`}</span>
                  {creatorName.trim() ? ` • Manager: ${creatorName.trim()}` : ''} • Score: <span className="text-gold-400 font-bold">{teamScore.totalScore} Pts</span> (Grade {teamScore.grade})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenScoreboard}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-black font-black text-xs uppercase tracking-wider font-mono transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <span>🏆 View Scoreboard</span>
                </button>
              </div>
            </div>

            {globalSyncError && (
              <div className="bg-red-950/50 border border-red-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono text-red-300">
                  ⚠️ Cloud sync error: {globalSyncError}
                </span>
                <button
                  type="button"
                  onClick={() => syncToCloud()}
                  disabled={isSyncingCloud}
                  className="shrink-0 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {isSyncingCloud ? '⏳ Retrying...' : '🔄 Retry Cloud Sync'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveToLeaderboard} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-turf-300 uppercase tracking-wider mb-1 font-semibold">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Mumbai Mavericks, Lahore Qalandars"
                  className="w-full bg-turf-950 border border-turf-700 focus:border-gold-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder:text-turf-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-turf-300 uppercase tracking-wider mb-1 font-semibold">
                  Manager / Coach Name (Optional)
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="e.g. Tactical Mastermind, Captain Cool"
                  className="w-full bg-turf-950 border border-turf-700 focus:border-gold-400 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder:text-turf-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-turf-400 font-mono">
                {isEligibleForGlobal
                  ? 'Persisted in local database • Ranks by composite 0–1000 score'
                  : 'Local-only mode: Practice Mode & 0-win runs are saved on this device only'}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || isSaved}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-turf-950 font-black text-xs uppercase tracking-wider font-mono transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <span>{isSubmitting ? '⏳ Saving...' : '💾 Save XI to Scoreboard'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {!onOpenScoreboard && (
        <UniversalScoreboardModal
          isOpen={isScoreboardOpen}
          onClose={() => setIsScoreboardOpen(false)}
          highlightEntryId={savedGlobalId || savedLocalId}
        />
      )}

      {/* Share Actions Bar */}
      <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl p-4 mb-6 sm:mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase text-gold-400 font-bold tracking-wider block">
            Share Your Achievement
          </span>
          <p className="text-xs text-turf-300">
            Export your campaign emoji grid or download high-res lineup card
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleShareGrid}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md min-h-[44px]"
          >
            <span>
              {shareStatus === 'shared'
                ? '✓ Shared!'
                : shareStatus === 'copied'
                ? '✓ Copied to Clipboard!'
                : '📋 Share Result'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-turf-800 hover:bg-turf-700 text-white font-bold text-xs uppercase tracking-wider border border-turf-600 transition-all flex items-center justify-center min-h-[44px]"
          >
            🖼️ Download Card
          </button>
        </div>
      </div>

      {/* Fixture Outcomes Grid */}
      <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-4">
          Campaign Scorecards ({winsCount}/{totalMatches} Won)
        </h3>
        <div className="space-y-3">
          {matchResults.map((result, idx) => {
            const opp = opponents[idx];

            return (
              <div
                key={opp ? opp.id : idx}
                className="flex items-center justify-between p-3 rounded-xl bg-turf-950 border border-turf-800 gap-2"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      result.won
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {result.won ? 'W' : 'L'}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white block truncate">
                      vs {opp ? opp.name : `Opponent ${idx + 1}`}
                    </span>
                    <span className="text-[11px] sm:text-xs text-turf-400 block truncate">{result.margin}</span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] sm:text-xs shrink-0">
                  <span className="text-white font-semibold">
                    {result.userScore.runs}/{result.userScore.wickets}
                  </span>
                  <span className="text-turf-500 mx-1 sm:mx-1.5">vs</span>
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
      <div className="bg-turf-900 border border-turf-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white mb-4">
          Drafted Playing XI
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {userXI.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-turf-950 border border-turf-800 text-xs font-mono gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-gold-400 font-bold shrink-0">{idx + 1}.</span>
                <span className="text-white font-medium truncate">
                  {player.name} {player.id === captainId ? '(C)' : ''}
                </span>
              </div>
              <span className="text-turf-400 shrink-0 text-[11px] sm:text-xs">
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
          onClick={() => {
            trackEvent('replay_clicked', { source: 'bottom_button' });
            onPlayAgain();
          }}
          className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-sm uppercase tracking-wider transition-all duration-150 active:scale-98 shadow-2xl hover:shadow-gold-400/30 min-h-[48px]"
        >
          Draft New XI & Play Again 🏏
        </button>
      </div>
    </div>
  );
};
