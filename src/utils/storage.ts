import { getDailyDateString } from '../engine/dailySeed';

export interface DailyAttemptRecord {
  won: boolean;
  matchesWon: number;
  date: string;
}

export interface StoredGameStats {
  gamesPlayed: number;
  tournamentsWon: number;
  matchesWon: number;
  matchesLost: number;
  currentStreak: number;
  maxStreak: number;
  dailyAttempts: Record<string, DailyAttemptRecord>;
}

const STORAGE_KEY_STATS = 'stumpd_career_stats_v1';
const STORAGE_KEY_LEADERBOARD = 'stumpd_universal_leaderboard_v1';

const memoryFallback: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  if (typeof window === 'undefined') return memoryFallback[key] || null;
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : (memoryFallback[key] || null);
  } catch {
    return memoryFallback[key] || null;
  }
}

function safeSetItem(key: string, value: string): void {
  memoryFallback[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Fallback stored in memoryFallback
  }
}

function safeRemoveItem(key: string): void {
  delete memoryFallback[key];
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

const DEFAULT_STATS: StoredGameStats = {
  gamesPlayed: 0,
  tournamentsWon: 0,
  matchesWon: 0,
  matchesLost: 0,
  currentStreak: 0,
  maxStreak: 0,
  dailyAttempts: {},
};

export function getGameStats(): StoredGameStats {
  try {
    const raw = safeGetItem(STORAGE_KEY_STATS);
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      dailyAttempts: parsed.dailyAttempts || {},
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function saveGameStats(stats: StoredGameStats): void {
  try {
    safeSetItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // Ignore
  }
}

export function recordTournamentFinish(won: boolean, matchesWon: number): void {
  const stats = getGameStats();
  stats.gamesPlayed += 1;
  stats.matchesWon += matchesWon;
  stats.matchesLost += won ? 0 : 1;

  if (won) {
    stats.tournamentsWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }

  saveGameStats(stats);
}

export function isDailyCompletedToday(dateStr?: string): boolean {
  const targetDate = dateStr || getDailyDateString();
  const stats = getGameStats();
  return Boolean(stats.dailyAttempts[targetDate]);
}

export function markDailyCompletedToday(
  result: { won: boolean; matchesWon: number },
  dateStr?: string
): void {
  const targetDate = dateStr || getDailyDateString();
  const stats = getGameStats();

  stats.dailyAttempts[targetDate] = {
    won: result.won,
    matchesWon: result.matchesWon,
    date: targetDate,
  };

  stats.gamesPlayed += 1;
  stats.matchesWon += result.matchesWon;
  stats.matchesLost += result.won ? 0 : 1;

  if (result.won) {
    stats.tournamentsWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }

  saveGameStats(stats);
}

export interface StoredLeaderboardEntry {
  id: string;
  teamName: string;
  creatorName?: string;
  mode: string;
  totalScore: number;
  grade: string;
  matchesWon: number;
  totalMatches: number;
  captainName: string;
  date: string;
  synergiesCount: number;
  isInvincible: boolean;
}

export function getUniversalLeaderboard(): StoredLeaderboardEntry[] {
  try {
    const raw = safeGetItem(STORAGE_KEY_LEADERBOARD);
    if (!raw) return [];
    const userEntries: StoredLeaderboardEntry[] = JSON.parse(raw);
    return userEntries.sort((a, b) => b.totalScore - a.totalScore);
  } catch {
    return [];
  }
}

export function saveToUniversalLeaderboard(
  entry: Omit<StoredLeaderboardEntry, 'id'>
): StoredLeaderboardEntry {
  const newEntry: StoredLeaderboardEntry = {
    ...entry,
    id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  try {
    const raw = safeGetItem(STORAGE_KEY_LEADERBOARD);
    const userEntries: StoredLeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    userEntries.push(newEntry);
    userEntries.sort((a, b) => b.totalScore - a.totalScore);
    safeSetItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(userEntries.slice(0, 100)));
  } catch {
    // Ignore storage issues
  }

  return newEntry;
}

export function clearUniversalLeaderboard(): void {
  try {
    safeRemoveItem(STORAGE_KEY_LEADERBOARD);
  } catch {
    // Ignore
  }
}

// Semantic aliases
export const getMyScoreboard = getUniversalLeaderboard;
export const saveToMyScoreboard = saveToUniversalLeaderboard;
export const clearMyScoreboard = clearUniversalLeaderboard;
