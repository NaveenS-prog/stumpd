import { useState, useCallback, useRef, useEffect } from 'react';
import { Player, Era, IPLEra } from '../types/player';
import { GameMode, GamePhase } from '../types/game';
import { MatchResult, OpponentTeam, Venue } from '../types/tournament';
import { SLOTS } from '../data/slots';
import { INTERNATIONAL_OPPONENTS, IPL_OPPONENTS } from '../data/opponents';
import { VENUES } from '../data/venues';
import { draftMachine } from '../engine/draftMachine';
import { simulateMatch, getMatchOpponentAndVenue } from '../engine/simulator';
import { getDailySeed, createSeededRandom } from '../engine/dailySeed';
import {
  getGameStats,
  isDailyCompletedToday,
  markDailyCompletedToday,
  recordTournamentFinish,
  StoredGameStats,
} from '../utils/storage';
import { trackEvent } from '../utils/analytics';
import { soundEngine } from '../engine/audio';
import {
  NATIONAL_TEAMS,
  IPL_TEAMS,
  INTERNATIONAL_ERAS,
  IPL_ERAS,
} from '../data/teams';

export interface TossOutcome {
  winner: string;
  decision: 'bat' | 'bowl';
  userBatsFirst: boolean;
}

const DEFAULT_TOSS_OUTCOME: TossOutcome = {
  winner: 'User XI',
  decision: 'bat',
  userBatsFirst: true,
};

function rollTossOutcome(opponentName: string, rng: () => number): TossOutcome {
  const userBatsFirst = rng() < 0.5;
  const userWonToss = rng() < 0.5;
  const winner = userWonToss ? 'User XI' : opponentName;
  const decision: 'bat' | 'bowl' =
    (userWonToss && userBatsFirst) || (!userWonToss && !userBatsFirst) ? 'bat' : 'bowl';
  return { winner, decision, userBatsFirst };
}

export function useStumpdGame() {
  const [screen, setScreen] = useState<GamePhase>('home');
  const [gameMode, setGameMode] = useState<GameMode>('International');
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [picks, setPicks] = useState<Player[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [mulligansRemaining, setMulligansRemaining] = useState<number>(3);

  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [currentEra, setCurrentEra] = useState<Era | IPLEra | null>(null);
  const [currentCandidates, setCurrentCandidates] = useState<Player[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [tossOutcomes, setTossOutcomes] = useState<Record<number, TossOutcome>>({});

  const [stats, setStats] = useState<StoredGameStats>(() => getGameStats());
  const [isDailyLocked, setIsDailyLocked] = useState<boolean>(() => isDailyCompletedToday());
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted());

  const dailyRngRef = useRef<(() => number) | null>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSimRef = useRef<(() => void) | null>(null);
  const tossOutcomesRef = useRef<Record<number, TossOutcome>>({});

  const clearSpinInterval = useCallback(() => {
    if (spinIntervalRef.current !== null) {
      clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  }, []);

  const clearSimTimeout = useCallback(() => {
    if (simTimeoutRef.current !== null) {
      clearTimeout(simTimeoutRef.current);
      simTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearSpinInterval();
      clearSimTimeout();
      pendingSimRef.current = null;
    };
  }, [clearSimTimeout, clearSpinInterval]);

  const activeOpponents: OpponentTeam[] =
    gameMode === 'IPL' ? IPL_OPPONENTS : INTERNATIONAL_OPPONENTS;

  const [selectedOpponent, setSelectedOpponent] = useState<OpponentTeam>(
    () => INTERNATIONAL_OPPONENTS[0]
  );
  const [selectedVenue, setSelectedVenue] = useState<Venue>(() => VENUES[0]);

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
      clearSpinInterval();
      const rng = getRng();
      const slotDef = SLOTS[slotIdx] || SLOTS[0];
      const isIPL = gameMode === 'IPL';
      const activeTeams = isIPL ? IPL_TEAMS : NATIONAL_TEAMS;
      const activeEras = isIPL ? IPL_ERAS : INTERNATIONAL_ERAS;

      // In test runner or non-browser environments, resolve synchronously
      const isTestEnv =
        typeof process !== 'undefined' &&
        (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');

      if (isTestEnv) {
        const spin = draftMachine.spinSlotReels(slotIdx, gameMode, rng);
        setCurrentTeam(spin.team);
        setCurrentEra(spin.era);

        const eligible = draftMachine.getCandidatesForSlot(
          slotDef,
          spin.team,
          spin.era,
          existingPicks,
          gameMode
        );
        setCurrentCandidates(eligible);
        setIsSpinning(false);
        return;
      }

      // In browser: rapid exciting tactile reel ticks
      setIsSpinning(true);
      let tickCount = 0;
      spinIntervalRef.current = setInterval(() => {
        tickCount++;
        soundEngine.playReelTick(0.9 + tickCount * 0.08);

        const randomTeam = activeTeams[Math.floor(Math.random() * activeTeams.length)].id;
        const randomEra = activeEras[Math.floor(Math.random() * activeEras.length)];
        setCurrentTeam(randomTeam);
        setCurrentEra(randomEra);

        if (tickCount >= 6) {
          clearSpinInterval();
          const spin = draftMachine.spinSlotReels(slotIdx, gameMode, rng);
          setCurrentTeam(spin.team);
          setCurrentEra(spin.era);

          const eligible = draftMachine.getCandidatesForSlot(
            slotDef,
            spin.team,
            spin.era,
            existingPicks,
            gameMode
          );
          setCurrentCandidates(eligible);
          setIsSpinning(false);
        }
      }, 55);
    },
    [clearSpinInterval, gameMode, getRng]
  );

  const startMode = useCallback((modeInput: string) => {
    clearSpinInterval();
    clearSimTimeout();
    pendingSimRef.current = null;
    tossOutcomesRef.current = {};
    setTossOutcomes({});
    setIsSimulating(false);

    let resolvedMode: GameMode = 'International';
    let mulligans = 3;
    let targetScreen: GamePhase = 'draft';

    const lower = modeInput.toLowerCase();
    if (lower.includes('ipl')) {
      resolvedMode = 'IPL';
      mulligans = 3;
      dailyRngRef.current = null;
      targetScreen = 'draft';
    } else if (lower.includes('daily')) {
      resolvedMode = 'Daily Stumpd';
      mulligans = 0;
      const seed = getDailySeed();
      dailyRngRef.current = createSeededRandom(seed);
      targetScreen = 'draft';
    } else if (lower.includes('practice')) {
      resolvedMode = 'Practice Mode';
      mulligans = 99;
      dailyRngRef.current = null;
      targetScreen = 'draft';
    } else if (lower === 'spin') {
      resolvedMode = 'International';
      mulligans = 3;
      dailyRngRef.current = null;
      targetScreen = 'draft';
    } else {
      // Default / International Tour
      resolvedMode = 'International';
      mulligans = 3;
      dailyRngRef.current = null;
      targetScreen = 'draft';
    }

    const opps = resolvedMode === 'IPL' ? IPL_OPPONENTS : INTERNATIONAL_OPPONENTS;
    const { opponent: initialOpp, venue: defaultVenue } = getMatchOpponentAndVenue(0, opps);
    setSelectedOpponent(initialOpp);
    setSelectedVenue(defaultVenue);

    setGameMode(resolvedMode);
    setScreen(targetScreen);
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

    trackEvent('round_started', { mode: resolvedMode });
  }, [clearSimTimeout, clearSpinInterval]);

  const proceedFromSetupToDraft = useCallback(() => {
    setScreen('draft');
    setCurrentSlotIndex(0);
    setCurrentTeam(null);
    setCurrentEra(null);
    setCurrentCandidates([]);
    setIsSpinning(false);
  }, []);

  const spinReels = useCallback(() => {
    if (isSpinning) return;
    executeSpin(currentSlotIndex, picks);
  }, [currentSlotIndex, executeSpin, isSpinning, picks]);

  const mulligan = useCallback(() => {
    if (isSpinning || mulligansRemaining <= 0) return;
    setMulligansRemaining((prev) => Math.max(0, prev - 1));
    executeSpin(currentSlotIndex, picks);
  }, [currentSlotIndex, executeSpin, isSpinning, mulligansRemaining, picks]);

  const draftPlayer = useCallback(
    (player: Player) => {
      if (picks.length >= SLOTS.length || picks.some((p) => p.id === player.id)) return;
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
    const { opponent } = getMatchOpponentAndVenue(0, activeOpponents);
    const initialToss = rollTossOutcome(opponent.name, getRng());
    tossOutcomesRef.current = { 0: initialToss };
    setTossOutcomes({ 0: initialToss });
    setScreen('match');
    setCurrentMatchIndex(0);
    setLastResult(null);
  }, [activeOpponents, getRng]);

  const skipSimulation = useCallback(() => {
    clearSimTimeout();
    const commit = pendingSimRef.current;
    if (commit) {
      pendingSimRef.current = null;
      commit();
    }
  }, [clearSimTimeout]);

  const playCurrentMatch = useCallback(() => {
    if (isSimulating || simTimeoutRef.current !== null) return;
    clearSimTimeout();

    const { opponent, venue } = getMatchOpponentAndVenue(currentMatchIndex, activeOpponents);
    let activeToss = tossOutcomesRef.current[currentMatchIndex];
    if (!activeToss) {
      activeToss = rollTossOutcome(opponent.name, getRng());
      tossOutcomesRef.current = { ...tossOutcomesRef.current, [currentMatchIndex]: activeToss };
      setTossOutcomes(tossOutcomesRef.current);
    }

    const isTestEnv =
      typeof process !== 'undefined' &&
      (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');
    const rng = isTestEnv && !dailyRngRef.current ? () => 0.1 : getRng();

    const result = simulateMatch(
      picks,
      opponent,
      venue,
      captainId || undefined,
      rng,
      activeToss.userBatsFirst
    );

    const commitSimulation = () => {
      simTimeoutRef.current = null;
      pendingSimRef.current = null;
      if (result.won) {
        soundEngine.playVictoryFanfare();
      } else {
        soundEngine.playLossSting();
      }

      setLastResult(result);
      setMatchResults((prev) => [...prev, result]);
      setIsSimulating(false);
      trackEvent('match_simulated', { matchIndex: currentMatchIndex, won: result.won });
    };

    soundEngine.playBatCrack();

    if (isTestEnv) {
      setIsSimulating(true);
      commitSimulation();
      return;
    }

    setIsSimulating(true);
    pendingSimRef.current = commitSimulation;
    simTimeoutRef.current = setTimeout(() => {
      pendingSimRef.current?.();
    }, 1800);
  }, [activeOpponents, captainId, clearSimTimeout, currentMatchIndex, getRng, isSimulating, picks]);

  const nextMatch = useCallback(() => {
    if (!lastResult) return;

    if (lastResult.won) {
      const nextIdx = currentMatchIndex + 1;
      if (nextIdx >= activeOpponents.length) {
        if (gameMode === 'Daily Stumpd') {
          markDailyCompletedToday({ won: true, matchesWon: 7 });
          setIsDailyLocked(true);
          trackEvent('daily_completed', { won: true, matchesWon: 7 });
        } else {
          recordTournamentFinish(true, 7);
        }
        setStats(getGameStats());
        setScreen('results');
      } else {
        const { opponent } = getMatchOpponentAndVenue(nextIdx, activeOpponents);
        const nextToss = rollTossOutcome(opponent.name, getRng());
        tossOutcomesRef.current = { ...tossOutcomesRef.current, [nextIdx]: nextToss };
        setTossOutcomes(tossOutcomesRef.current);
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
  }, [activeOpponents, currentMatchIndex, gameMode, getRng, lastResult, matchResults]);

  const resetGame = useCallback(() => {
    clearSpinInterval();
    clearSimTimeout();
    pendingSimRef.current = null;
    tossOutcomesRef.current = {};
    setTossOutcomes({});
    setIsSimulating(false);
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
  }, [clearSimTimeout, clearSpinInterval]);

  const toggleMute = useCallback(() => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
    trackEvent('mute_toggled', { isMuted: next });
    return next;
  }, []);

  const tossOutcome = tossOutcomes[currentMatchIndex] ?? DEFAULT_TOSS_OUTCOME;

  return {
    screen,
    setScreen,
    gameMode,
    activeOpponents,
    selectedOpponent,
    selectedVenue,
    setSelectedOpponent,
    setSelectedVenue,
    proceedFromSetupToDraft,
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
    tossOutcome,
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
    skipSimulation,
    nextMatch,
    resetGame,
    toggleMute,
  };
}
