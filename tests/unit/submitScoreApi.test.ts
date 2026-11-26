import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import playersData from '../../src/data/players.json';
import { calculateUniversalTeamScore } from '../../src/engine/teamScore';
import { getActiveSynergies } from '../../src/data/synergies';
import type { Player } from '../../src/types/player';
import { handleSubmitScore, POST } from '../../api/submit-score';

const VALID_PLAYER_IDS = [
  'sunil-gavaskar',
  'virat-kohli',
  'ab-de-villiers',
  'ms-dhoni',
  'suresh-raina',
  'kapil-dev',
  'ravichandran-ashwin',
  'ravindra-jadeja',
  'wasim-akram',
  'waqar-younis',
  'jasprit-bumrah',
];

const VALID_PLAYERS: Player[] = VALID_PLAYER_IDS.map((id) => {
  const found = (playersData as Player[]).find((p) => p.id === id);
  if (!found) throw new Error(`Missing test player ${id}`);
  return found;
});

interface MockSupabaseOptions {
  rateCount?: number;
  rateCountError?: { message: string } | null;
  rateInsertError?: { message: string } | null;
  leaderboardInsertError?: { message: string } | null;
}

function createMockSupabase(options: MockSupabaseOptions = {}) {
  const {
    rateCount = 0,
    rateCountError = null,
    rateInsertError = null,
    leaderboardInsertError = null,
  } = options;

  const rateLimitQueries: Array<{ ipHash: string; gteTimestamp: string }> = [];
  const rateLimitInserts: Array<{ ip_hash: string }> = [];
  const rateLimitDeletes: Array<{ ltTimestamp: string }> = [];
  const leaderboardInserts: Array<Record<string, unknown>> = [];

  const mockClient = {
    from: vi.fn((table: string) => {
      if (table === 'leaderboard_rate_limits') {
        return {
          select: vi.fn(() => {
            const state = { ipHash: '', gteTimestamp: '' };
            const chain = {
              eq: vi.fn((col: string, val: string) => {
                if (col === 'ip_hash') state.ipHash = val;
                return chain;
              }),
              gte: vi.fn(async (col: string, val: string) => {
                if (col === 'created_at') state.gteTimestamp = val;
                rateLimitQueries.push({ ...state });
                return { count: rateCount, error: rateCountError };
              }),
            };
            return chain;
          }),
          insert: vi.fn(async (row: { ip_hash: string }) => {
            rateLimitInserts.push(row);
            return { error: rateInsertError };
          }),
          delete: vi.fn(() => ({
            lt: vi.fn(async (_col: string, val: string) => {
              rateLimitDeletes.push({ ltTimestamp: val });
              return { error: null };
            }),
          })),
        };
      }

      if (table === 'universal_leaderboard') {
        return {
          insert: vi.fn((payload: Record<string, unknown>) => {
            leaderboardInserts.push(payload);
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => {
                  if (leaderboardInsertError) {
                    return { data: null, error: leaderboardInsertError };
                  }
                  return {
                    data: {
                      id: 'entry-uuid-123',
                      ...payload,
                      created_at: '2026-11-26T18:55:00.000Z',
                    },
                    error: null,
                  };
                }),
              })),
            };
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    client: mockClient as unknown as SupabaseClient,
    rateLimitQueries,
    rateLimitInserts,
    rateLimitDeletes,
    leaderboardInserts,
  };
}

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://stumpd.example.com/api/submit-score', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('/api/submit-score', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('RATE_LIMIT_SALT', 'test-salt');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects Practice Mode, 0-win runs, invalid knockout math, duplicate/missing playerIds, and invalid captainId with 400', async () => {
    const { client, leaderboardInserts } = createMockSupabase();

    const basePayload = {
      teamName: 'All Time XI',
      creatorName: 'Coach',
      mode: 'International',
      playerIds: VALID_PLAYER_IDS,
      captainId: 'ms-dhoni',
      matchesWon: 7,
      totalMatches: 7,
    };

    const invalidPayloads: Array<{ label: string; payload: Record<string, unknown> }> = [
      { label: 'Practice mode', payload: { ...basePayload, mode: 'Practice' } },
      { label: 'Standard mode', payload: { ...basePayload, mode: 'Standard' } },
      { label: '0-win run (0/1)', payload: { ...basePayload, matchesWon: 0, totalMatches: 1 } },
      { label: '0-win run (0/7)', payload: { ...basePayload, matchesWon: 0, totalMatches: 7 } },
      { label: 'invalid knockout math (3/7)', payload: { ...basePayload, matchesWon: 3, totalMatches: 7 } },
      { label: 'invalid knockout math (5/5)', payload: { ...basePayload, matchesWon: 5, totalMatches: 5 } },
      { label: 'invalid knockout math (8/8)', payload: { ...basePayload, matchesWon: 8, totalMatches: 8 } },
      { label: 'non-integer matchesWon', payload: { ...basePayload, matchesWon: 6.5, totalMatches: 7 } },
      {
        label: 'duplicate playerIds',
        payload: {
          ...basePayload,
          playerIds: [...VALID_PLAYER_IDS.slice(0, 10), VALID_PLAYER_IDS[0]],
        },
      },
      {
        label: 'fewer than 11 playerIds',
        payload: { ...basePayload, playerIds: VALID_PLAYER_IDS.slice(0, 10) },
      },
      {
        label: 'unknown playerId',
        payload: {
          ...basePayload,
          playerIds: [...VALID_PLAYER_IDS.slice(0, 10), 'nonexistent-player-id'],
        },
      },
      {
        label: 'captainId not in playerIds',
        payload: { ...basePayload, captainId: 'rohit-sharma' },
      },
      {
        label: 'missing captainId',
        payload: { ...basePayload, captainId: '' },
      },
      {
        label: 'blank teamName',
        payload: { ...basePayload, teamName: '   ' },
      },
      {
        label: 'teamName over 60 chars',
        payload: { ...basePayload, teamName: 'A'.repeat(61) },
      },
      {
        label: 'creatorName over 40 chars',
        payload: { ...basePayload, creatorName: 'C'.repeat(41) },
      },
    ];

    for (const { label, payload } of invalidPayloads) {
      const response = await handleSubmitScore(makeRequest(payload), client);
      expect(response.status, `Expected 400 for ${label}`).toBe(400);
      const json = await response.json();
      expect(json.error, `Expected error message for ${label}`).toBeTruthy();
    }

    expect(leaderboardInserts).toHaveLength(0);
  });

  it('rejects malformed JSON body with 400', async () => {
    const { client } = createMockSupabase();
    const request = new Request('https://stumpd.example.com/api/submit-score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not valid json',
    });

    const response = await handleSubmitScore(request, client);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toMatch(/json/i);
  });

  it('returns 429 when rate limit count >= 5 within last 10 minutes (including when x-forwarded-for is absent)', async () => {
    const { client, rateLimitQueries, rateLimitInserts, leaderboardInserts } =
      createMockSupabase({ rateCount: 5 });

    const validPayload = {
      teamName: 'Rate Limited XI',
      mode: 'IPL',
      playerIds: VALID_PLAYER_IDS,
      captainId: 'ms-dhoni',
      matchesWon: 4,
      totalMatches: 5,
    };

    const responseNoHeaders = await handleSubmitScore(makeRequest(validPayload), client);
    expect(responseNoHeaders.status).toBe(429);
    const jsonNoHeaders = await responseNoHeaders.json();
    expect(jsonNoHeaders.error).toMatch(/rate limit/i);

    const responseWithForwarded = await handleSubmitScore(
      makeRequest(validPayload, { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }),
      client
    );
    expect(responseWithForwarded.status).toBe(429);

    expect(rateLimitQueries).toHaveLength(2);
    expect(rateLimitQueries[0].ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(rateLimitQueries[1].ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(rateLimitQueries[0].ipHash).not.toBe(rateLimitQueries[1].ipHash);
    expect(rateLimitInserts).toHaveLength(0);
    expect(leaderboardInserts).toHaveLength(0);
  });

  it('recomputes authoritative score, grade, synergiesCount, captainName, and isInvincible from playerIds and inserts via service client (201)', async () => {
    const {
      client,
      rateLimitInserts,
      rateLimitDeletes,
      leaderboardInserts,
    } = createMockSupabase({ rateCount: 2 });

    const expectedBreakdown = calculateUniversalTeamScore(VALID_PLAYERS, 'ms-dhoni');
    const expectedSynergiesCount = getActiveSynergies(VALID_PLAYERS).length;

    const response = await handleSubmitScore(
      makeRequest(
        {
          teamName: '  Invincible Legends  ',
          creatorName: '  Skipper  ',
          mode: 'Daily Stumpd',
          playerIds: VALID_PLAYER_IDS,
          captainId: 'ms-dhoni',
          matchesWon: 7,
          totalMatches: 7,
          // Client-supplied spoofed fields must be ignored by server
          totalScore: 999,
          grade: 'S+',
          synergiesCount: 20,
          captainName: 'Spoofed Captain',
          isInvincible: false,
        },
        { 'x-forwarded-for': '198.51.100.42' }
      ),
      client
    );

    expect(response.status).toBe(201);
    const body = await response.json();

    expect(rateLimitInserts).toHaveLength(1);
    expect(rateLimitDeletes).toHaveLength(1);
    expect(leaderboardInserts).toHaveLength(1);

    expect(leaderboardInserts[0]).toEqual({
      team_name: 'Invincible Legends',
      creator_name: 'Skipper',
      mode: 'Daily Stumpd',
      total_score: expectedBreakdown.totalScore,
      grade: expectedBreakdown.grade,
      matches_won: 7,
      total_matches: 7,
      captain_name: 'MS Dhoni',
      synergies_count: expectedSynergiesCount,
      is_invincible: true,
    });

    expect(body).toEqual({
      id: 'entry-uuid-123',
      teamName: 'Invincible Legends',
      creatorName: 'Skipper',
      mode: 'Daily Stumpd',
      totalScore: expectedBreakdown.totalScore,
      grade: expectedBreakdown.grade,
      matchesWon: 7,
      totalMatches: 7,
      captainName: 'MS Dhoni',
      synergiesCount: expectedSynergiesCount,
      isInvincible: true,
      createdAt: '2026-11-26T18:55:00.000Z',
    });
  });

  it('returns 503 from POST when Supabase service credentials are not configured', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const response = await POST(
      makeRequest({
        teamName: 'No Env XI',
        mode: 'International',
        playerIds: VALID_PLAYER_IDS,
        captainId: 'ms-dhoni',
        matchesWon: 3,
        totalMatches: 4,
      })
    );

    expect(response.status).toBe(503);
    const json = await response.json();
    expect(json.error).toBeTruthy();
  });
});
