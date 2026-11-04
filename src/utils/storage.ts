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
