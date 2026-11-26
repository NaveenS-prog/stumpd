import { createHash } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import playersData from '../src/data/players.json';
import { getActiveSynergies } from '../src/data/synergies';
import { calculateUniversalTeamScore } from '../src/engine/teamScore';
import type { GlobalLeaderboardEntry } from '../src/services/supabase';
import type { Player } from '../src/types/player';

const VALID_MODES = new Set(['International', 'IPL', 'Daily Stumpd']);
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

const PLAYER_BY_ID = new Map<string, Player>(
  (playersData as Player[]).map((player) => [player.id, player])
);

interface ValidatedSubmission {
  teamName: string;
  creatorName: string | null;
  mode: string;
  players: Player[];
  captainId: string;
  captainName: string;
  matchesWon: number;
  totalMatches: number;
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

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) return firstHop;
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

function hashClientIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function validateSubmissionPayload(
  raw: unknown
): { ok: true; data: ValidatedSubmission } | { ok: false; error: string } {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }

  const body = raw as Record<string, unknown>;

  if (typeof body.teamName !== 'string') {
    return { ok: false, error: 'teamName must be a string' };
  }
  const teamName = body.teamName.trim();
  if (teamName.length < 1 || teamName.length > 60) {
    return { ok: false, error: 'teamName must be between 1 and 60 characters' };
  }

  let creatorName: string | null = null;
  if (body.creatorName !== undefined && body.creatorName !== null) {
    if (typeof body.creatorName !== 'string') {
      return { ok: false, error: 'creatorName must be a string' };
    }
    const trimmedCreator = body.creatorName.trim();
    if (trimmedCreator.length > 40) {
      return { ok: false, error: 'creatorName must be 40 characters or fewer' };
    }
    creatorName = trimmedCreator.length > 0 ? trimmedCreator : null;
  }

  if (typeof body.mode !== 'string' || !VALID_MODES.has(body.mode)) {
    return { ok: false, error: 'Invalid mode for global leaderboard submission' };
  }

  const matchesWon = body.matchesWon;
  const totalMatches = body.totalMatches;
  if (!Number.isInteger(matchesWon) || !Number.isInteger(totalMatches)) {
    return { ok: false, error: 'matchesWon and totalMatches must be integers' };
  }
  const won = matchesWon as number;
  const total = totalMatches as number;
  const isValidRun =
    (won === 7 && total === 7) ||
    (won >= 1 && won === total - 1 && total <= 7);
  if (!isValidRun) {
    return { ok: false, error: 'Invalid gauntlet match record' };
  }

  if (!Array.isArray(body.playerIds) || body.playerIds.length !== 11) {
    return { ok: false, error: 'playerIds must contain exactly 11 player IDs' };
  }
  if (!body.playerIds.every((id): id is string => typeof id === 'string')) {
    return { ok: false, error: 'playerIds must be an array of strings' };
  }
  if (new Set(body.playerIds).size !== 11) {
    return { ok: false, error: 'playerIds must contain 11 unique player IDs' };
  }

  const players: Player[] = [];
  for (const id of body.playerIds) {
    const resolved = PLAYER_BY_ID.get(id);
    if (!resolved) {
      return { ok: false, error: `Unknown playerId: ${id}` };
    }
    players.push(resolved);
  }

  if (typeof body.captainId !== 'string' || !body.playerIds.includes(body.captainId)) {
    return { ok: false, error: 'captainId must be one of the 11 selected playerIds' };
  }
  const captain = PLAYER_BY_ID.get(body.captainId);
  if (!captain) {
    return { ok: false, error: 'Invalid captainId' };
  }

  return {
    ok: true,
    data: {
      teamName,
      creatorName,
      mode: body.mode,
      players,
      captainId: body.captainId,
      captainName: captain.name,
      matchesWon: won,
      totalMatches: total,
    },
  };
}

/**
 * Verifies, rate-limits, scores, and persists a global leaderboard submission.
 */
export async function handleSubmitScore(
  request: Request,
  supabaseClientOverride?: SupabaseClient
): Promise<Response> {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: 'Malformed JSON body' }, 400);
  }

  const validation = validateSubmissionPayload(rawBody);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }
  const submission = validation.data;

  const supabaseUrl = normalizeSupabaseUrl(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  );
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseClientOverride && (!supabaseUrl || !serviceKey)) {
    return jsonResponse(
      { error: 'Leaderboard submission service is not configured' },
      503
    );
  }

  const adminClient =
    supabaseClientOverride ??
    createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  const salt =
    process.env.RATE_LIMIT_SALT ||
    createHash('sha256').update(serviceKey).digest('hex').slice(0, 16);
  const ipHash = hashClientIp(extractClientIp(request), salt);

  const { data: allowed, error: rateError } = await adminClient.rpc(
    'check_and_record_rate_limit',
    {
      p_ip_hash: ipHash,
      p_limit: RATE_LIMIT_MAX,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
    }
  );

  if (rateError || typeof allowed !== 'boolean') {
    return jsonResponse({ error: 'Rate limit check failed' }, 500);
  }

  if (allowed === false) {
    return jsonResponse(
      { error: 'Rate limit exceeded. Please try again in a few minutes.' },
      429
    );
  }

  const scoreBreakdown = calculateUniversalTeamScore(
    submission.players,
    submission.captainId
  );
  const synergiesCount = getActiveSynergies(submission.players).length;
  const isInvincible = submission.matchesWon === 7 && submission.totalMatches === 7;

  const { data, error: insertError } = await adminClient
    .from('universal_leaderboard')
    .insert({
      team_name: submission.teamName,
      creator_name: submission.creatorName,
      mode: submission.mode,
      total_score: scoreBreakdown.totalScore,
      grade: scoreBreakdown.grade,
      matches_won: submission.matchesWon,
      total_matches: submission.totalMatches,
      captain_name: submission.captainName,
      synergies_count: synergiesCount,
      is_invincible: isInvincible,
    })
    .select()
    .single();

  if (insertError || !data) {
    return jsonResponse({ error: 'Failed to save leaderboard entry' }, 500);
  }

  const row = data as DbLeaderboardRow;
  const entry: GlobalLeaderboardEntry = {
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

  return jsonResponse(entry, 201);
}

/**
 * Vercel Web-Standard POST handler for /api/submit-score.
 */
export async function POST(request: Request): Promise<Response> {
  return handleSubmitScore(request);
}
