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
  totalScore: number;
  grade: string;
  matchesWon: number;
  totalMatches: number;
  captainName: string;
  synergiesCount: number;
  isInvincible: boolean;
}

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('your-supabase-anon-key')
  );
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
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
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  try {
    const payload = {
      team_name: entry.teamName,
      creator_name: entry.creatorName || null,
      mode: entry.mode,
      total_score: entry.totalScore,
      grade: entry.grade,
      matches_won: entry.matchesWon,
      total_matches: entry.totalMatches,
      captain_name: entry.captainName,
      synergies_count: entry.synergiesCount,
      is_invincible: entry.isInvincible,
    };

    const { data, error } = await client
      .from('universal_leaderboard')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    const row = data as DbLeaderboardRow;
    const mapped: GlobalLeaderboardEntry = {
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
    };

    return { data: mapped, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
