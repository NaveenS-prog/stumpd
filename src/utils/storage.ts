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
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
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
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch {
    // Ignore storage quota or disabled storage
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

  recordTournamentFinish(result.won, result.matchesWon);
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

const STORAGE_KEY_LEADERBOARD = 'stumpd_universal_leaderboard_v1';

export function getUniversalLeaderboard(): StoredLeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
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

  if (typeof window === 'undefined') return newEntry;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    const userEntries: StoredLeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    userEntries.push(newEntry);
    userEntries.sort((a, b) => b.totalScore - a.totalScore);
    localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(userEntries.slice(0, 100)));
  } catch {
    // Ignore storage issues
  }

  return newEntry;
}

export function clearUniversalLeaderboard(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_LEADERBOARD);
  } catch {
    // Ignore
  }
}
