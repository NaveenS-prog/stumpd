import { useState, useCallback, useRef, useEffect } from 'react';
import { Player, Era } from '../types/player';
import { GameMode, GamePhase } from '../types/game';
import { MatchResult } from '../types/tournament';
import { SLOTS } from '../data/slots';
import { OPPONENTS } from '../data/opponents';
import { VENUES } from '../data/venues';
import { draftMachine } from '../engine/draftMachine';
import { simulateMatch } from '../engine/simulator';
import { getDailySeed, createSeededRandom } from '../engine/dailySeed';
import {
  getGameStats,
  isDailyCompletedToday,
  markDailyCompletedToday,
  recordTournamentFinish,
  StoredGameStats,
} from '../utils/storage';
import { soundEngine } from '../engine/audio';
import { TEAMS } from '../data/teams';
import { ERAS } from '../engine/draftMachine';

export function useStumpdGame() {
  const [screen, setScreen] = useState<GamePhase>('home');
  const [gameMode, setGameMode] = useState<GameMode>('Spin Mode');
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [picks, setPicks] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [mulligansRemaining, setMulligansRemaining] = useState<number>(3);

  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [currentEra, setCurrentEra] = useState<Era | null>(null);
  const [currentCandidates, setCurrentCandidates] = useState<Player[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [stats, setStats] = useState<StoredGameStats>(() => getGameStats());
  const [isDailyLocked, setIsDailyLocked] = useState<boolean>(() => isDailyCompletedToday());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted());

  const dailyRngRef = useRef<(() => number) | null>(null);

  useEffect(() => {
    setStats(getGameStats());
    setIsDailyLocked(isDailyCompletedToday());
    setIsMuted(soundEngine.isMuted());
  }, []);

  const getRng = useCallback(() => {
    if (dailyRngRef.current) {
      return dailyRngRef.current;
    }
    return Math.random;
  }, []);

  const executeSpin = useCallback(
    (slotIdx: number, existingPicks: Player[]) => {
      const rng = getRng();
      const slotDef = SLOTS[slotIdx] || SLOTS[0];

      // In test runner or non-browser environments, resolve synchronously
      const isTestEnv =
        typeof process !== 'undefined' &&
        (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

      if (isTestEnv) {
        const spin = draftMachine.spinSlotReels(slotIdx, rng);
        setCurrentTeam(spin.team);
        setCurrentEra(spin.era);

        const eligible = draftMachine.getCandidatesForSlot(
          slotDef,
          spin.team,
          spin.era,
          existingPicks
        );
        setCurrentCandidates(eligible.slice(0, 4));
        setIsSpinning(false);
        return;
      }

      // In browser: rapid exciting tactile reel ticks
      setIsSpinning(true);
      let tickCount = 0;
      const interval = setInterval(() => {
        tickCount++;
        soundEngine.playReelTick(0.9 + tickCount * 0.08);

        const randomTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)].id;
        const randomEra = ERAS[Math.floor(Math.random() * ERAS.length)];
        setCurrentTeam(randomTeam);
        setCurrentEra(randomEra);

        if (tickCount >= 6) {
          clearInterval(interval);
          const spin = draftMachine.spinSlotReels(slotIdx, rng);
          setCurrentTeam(spin.team);
          setCurrentEra(spin.era);

          const eligible = draftMachine.getCandidatesForSlot(
            slotDef,
            spin.team,
            spin.era,
            existingPicks
          );
          setCurrentCandidates(eligible.slice(0, 4));
          setIsSpinning(false);
        }
      }, 55);
    },
    [getRng]
  );

  const startMode = useCallback((modeInput: string) => {
    let resolvedMode: GameMode = 'Spin Mode';
    let mulligans = 3;

    if (modeInput.toLowerCase().includes('daily')) {
      resolvedMode = 'Daily Stumpd';
      mulligans = 0;
      const seed = getDailySeed();
      dailyRngRef.current = createSeededRandom(seed);
    } else if (modeInput.toLowerCase().includes('practice')) {
      resolvedMode = 'Practice Mode';
      mulligans = 99;
      dailyRngRef.current = null;
    } else {
      resolvedMode = 'Spin Mode';
      mulligans = 3;
      dailyRngRef.current = null;
    }

    setGameMode(resolvedMode);
    setScreen('draft');
    setCurrentSlotIndex(0);
    setPicks([]);
    setCaptainId(null);
    setMulligansRemaining(mulligans);
    setMatchResults([]);
    setLastResult(null);
    setCurrentMatchIndex(0);

    // Reset reels so user spins for slot 0 explicitly!
    setCurrentTeam(null);
    setCurrentEra(null);
    setCurrentCandidates([]);
    setIsSpinning(false);
  }, []);

  const spinReels = useCallback(() => {
    executeSpin(currentSlotIndex, picks);
  }, [currentSlotIndex, executeSpin, picks]);

  const mulligan = useCallback(() => {
    if (mulligansRemaining <= 0) return;
    setMulligansRemaining((prev) => Math.max(0, prev - 1));
    executeSpin(currentSlotIndex, picks);
  }, [currentSlotIndex, executeSpin, mulligansRemaining, picks]);

  const draftPlayer = useCallback(
    (player: Player) => {
      soundEngine.playCardPick();

      const nextPicks = [...picks, player];
      setPicks(nextPicks);

      if (!captainId) {
        setCaptainId(player.id);
      }

      const nextSlot = currentSlotIndex + 1;
      setCurrentSlotIndex(nextSlot);

      // Reset wheels and candidates for the next slot!
      setCurrentTeam(null);
      setCurrentEra(null);
      setCurrentCandidates([]);
      setIsSpinning(false);
    },
    [captainId, currentSlotIndex, picks]
  );

  const setCaptain = useCallback((playerId: string) => {
    setCaptainId(playerId);
  }, []);

  const reorderLineup = useCallback((orderedPlayers: Player[]) => {
    setPicks(orderedPlayers);
  }, []);

  const proceedToMatches = useCallback(() => {
    setScreen('match');
    setCurrentMatchIndex(0);
    setLastResult(null);
  }, []);

  const playCurrentMatch = useCallback(() => {
    setIsSimulating(true);
    soundEngine.playBatCrack();

    const opponent = OPPONENTS[currentMatchIndex] || OPPONENTS[0];
    const venue = VENUES[currentMatchIndex % VENUES.length];
    const rng = getRng();

    const result = simulateMatch(picks, opponent, venue, captainId || undefined, rng);

    if (result.won) {
      soundEngine.playVictoryFanfare();
    } else {
      soundEngine.playLossSting();
    }

    setLastResult(result);
    setMatchResults((prev) => [...prev, result]);
    setIsSimulating(false);
  }, [captainId, currentMatchIndex, getRng, picks]);

  const nextMatch = useCallback(() => {
    if (!lastResult) return;

    if (lastResult.won) {
      const nextIdx = currentMatchIndex + 1;
      if (nextIdx >= OPPONENTS.length) {
        if (gameMode === 'Daily Stumpd') {
          markDailyCompletedToday({ won: true, matchesWon: 7 });
          setIsDailyLocked(true);
        } else {
          recordTournamentFinish(true, 7);
        }
        setStats(getGameStats());
        setScreen('results');
      } else {
        setCurrentMatchIndex(nextIdx);
        setLastResult(null);
      }
    } else {
      const winsCount = matchResults.filter((r) => r.won).length;
      if (gameMode === 'Daily Stumpd') {
        markDailyCompletedToday({ won: false, matchesWon: winsCount });
        setIsDailyLocked(true);
      } else {
        recordTournamentFinish(false, winsCount);
      }
      setStats(getGameStats());
      setScreen('results');
    }
  }, [currentMatchIndex, gameMode, lastResult, matchResults]);

  const resetGame = useCallback(() => {
    setScreen('home');
    setPicks([]);
    setCaptainId(null);
    setCurrentSlotIndex(0);
    setCurrentTeam(null);
    setCurrentEra(null);
    setCurrentCandidates([]);
    setIsSpinning(false);
    setCurrentMatchIndex(0);
    setMatchResults([]);
    setLastResult(null);
    setStats(getGameStats());
    setIsDailyLocked(isDailyCompletedToday());
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
    return next;
  }, []);

  return {
    screen,
    setScreen,
    gameMode,
    currentSlotIndex,
    picks,
    captainId,
    mulligansRemaining,
    currentTeam,
    currentEra,
    currentCandidates,
    isSpinning,
    currentMatchIndex,
    matchResults,
    lastResult,
    isSimulating,
    stats,
    isDailyLocked,
    isMuted,
    startMode,
    spinReels,
    mulligan,
    draftPlayer,
    setCaptain,
    reorderLineup,
    proceedToMatches,
    playCurrentMatch,
    nextMatch,
    resetGame,
    toggleMute,
  };
}
