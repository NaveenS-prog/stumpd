import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface GlobalLeaderboardEntry {
  id: string;
  teamName: string;
  creatorName?: string;
  mode: string;
  totalScore: number;
  grade: string;
  matchesWon: number;
  totalMatches: number;
  captainName: string;
  synergiesCount: number;
  isInvincible: boolean;
  createdAt: string;
}

export interface NewGlobalLeaderboardEntry {
  teamName: string;
  creatorName?: string;
  mode: string;
  playerIds: string[];
  captainId: string;
  matchesWon: number;
  totalMatches: number;
}

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return (
    typeof url === 'string' &&
    url.length > 0 &&
    !url.includes('your-project-id') &&
    typeof anonKey === 'string' &&
    anonKey.length > 0 &&
    !anonKey.includes('your-supabase-anon-key')
  );
}

let clientInstance: SupabaseClient | null = null;
let cachedConfigKey: string | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    clientInstance = null;
    cachedConfigKey = null;
    return null;
  }
  const { url, anonKey } = getSupabaseConfig();
  const nextConfigKey = `${url}::${anonKey}`;
  if (!clientInstance || cachedConfigKey !== nextConfigKey) {
    clientInstance = createClient(url, anonKey);
    cachedConfigKey = nextConfigKey;
  }
  return clientInstance;
}

interface DbLeaderboardRow {
  id: string;
  team_name: string;
  creator_name?: string | null;
  mode: string;
  total_score: number;
  grade: string;
  matches_won: number;
  total_matches: number;
  captain_name: string;
  synergies_count: number;
  is_invincible: boolean;
  created_at: string;
}

export async function fetchGlobalLeaderboard(
  limit = 50
): Promise<{ data: GlobalLeaderboardEntry[] | null; error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  try {
    const { data, error } = await client
      .from('universal_leaderboard')
      .select('*')
      .order('is_invincible', { ascending: false })
      .order('matches_won', { ascending: false })
      .order('total_score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const rows = (data as DbLeaderboardRow[]) || [];
    const mapped: GlobalLeaderboardEntry[] = rows.map((row) => ({
      id: row.id,
      teamName: row.team_name,
      creatorName: row.creator_name || undefined,
      mode: row.mode,
      totalScore: row.total_score,
      grade: row.grade,
      matchesWon: row.matches_won,
      totalMatches: row.total_matches,
      captainName: row.captain_name,
      synergiesCount: row.synergies_count,
      isInvincible: row.is_invincible,
      createdAt: row.created_at,
    }));

    return { data: mapped, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export async function submitToGlobalLeaderboard(
  entry: NewGlobalLeaderboardEntry
): Promise<{ data: GlobalLeaderboardEntry | null; error: Error | null }> {
  try {
    const res = await fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const errBody = (await res.json()) as { error?: string };
        if (errBody?.error) {
          message = errBody.error;
        }
      } catch {
        // Ignore JSON parse errors on non-JSON error responses
      }
      return { data: null, error: new Error(message) };
    }

    const data = (await res.json()) as GlobalLeaderboardEntry;
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
