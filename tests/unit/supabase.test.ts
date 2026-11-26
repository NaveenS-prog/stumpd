import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import {
  isSupabaseConfigured,
  getSupabaseClient,
  fetchGlobalLeaderboard,
  submitToGlobalLeaderboard,
} from '../../src/services/supabase';

describe('Supabase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('determines configuration status dynamically from env', () => {
    expect(isSupabaseConfigured()).toBe(true);

    vi.stubEnv('VITE_SUPABASE_URL', '');
    expect(isSupabaseConfigured()).toBe(false);

    vi.stubEnv('VITE_SUPABASE_URL', 'https://your-project-id.supabase.co');
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('resets cached Supabase client when config is missing or changes', () => {
    const firstClient = getSupabaseClient();
    expect(firstClient).not.toBeNull();
    expect(getSupabaseClient()).toBe(firstClient);

    vi.stubEnv('VITE_SUPABASE_URL', 'https://other-project.supabase.co');
    const secondClient = getSupabaseClient();
    expect(secondClient).not.toBeNull();
    expect(secondClient).not.toBe(firstClient);

    vi.stubEnv('VITE_SUPABASE_URL', '');
    expect(getSupabaseClient()).toBeNull();
  });

  it('handles client queries successfully with win-first ordering on mocked Supabase client', async () => {
    const mockLimit = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'mock-1',
          team_name: 'Super Kings',
          creator_name: 'MSD',
          mode: 'IPL',
          total_score: 950,
          grade: 'S+',
          matches_won: 7,
          total_matches: 7,
          captain_name: 'MS Dhoni',
          synergies_count: 3,
          is_invincible: true,
          created_at: '2026-11-23T00:00:00Z',
        },
      ],
      error: null,
    });
    const orderChain = {
      order: vi.fn(),
      limit: mockLimit,
    };
    orderChain.order.mockReturnValue(orderChain);
    mockSelect.mockReturnValue(orderChain);

    const { data, error } = await fetchGlobalLeaderboard(10);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].teamName).toBe('Super Kings');
    expect(data?.[0].totalScore).toBe(950);

    expect(orderChain.order).toHaveBeenNthCalledWith(1, 'is_invincible', {
      ascending: false,
    });
    expect(orderChain.order).toHaveBeenNthCalledWith(2, 'matches_won', {
      ascending: false,
    });
    expect(orderChain.order).toHaveBeenNthCalledWith(3, 'total_score', {
      ascending: false,
    });
    expect(orderChain.order).toHaveBeenNthCalledWith(4, 'created_at', {
      ascending: true,
    });
    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('submits score via POST /api/submit-score with playerIds and captainId', async () => {
    const mockEntry = {
      id: 'mock-new-id',
      teamName: 'Test XI',
      creatorName: 'Coach Test',
      mode: 'International',
      totalScore: 850,
      grade: 'S',
      matchesWon: 5,
      totalMatches: 6,
      captainName: 'Test Captain',
      synergiesCount: 2,
      isInvincible: false,
      createdAt: '2026-11-23T12:00:00Z',
    };
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockEntry), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', mockFetch);

    const payload = {
      teamName: 'Test XI',
      creatorName: 'Coach Test',
      mode: 'International',
      playerIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'],
      captainId: 'p1',
      matchesWon: 5,
      totalMatches: 6,
    };

    const { data, error } = await submitToGlobalLeaderboard(payload);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(error).toBeNull();
    expect(data).toEqual(mockEntry);
  });

  it('returns { data: null, error } when /api/submit-score returns 429 or 500', async () => {
    const payload = {
      teamName: 'Test XI',
      mode: 'IPL',
      playerIds: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'],
      captainId: 'p1',
      matchesWon: 7,
      totalMatches: 7,
    };

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few minutes.' }),
          { status: 429, headers: { 'content-type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Failed to save leaderboard entry' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      );
    vi.stubGlobal('fetch', mockFetch);

    const rateLimited = await submitToGlobalLeaderboard(payload);
    expect(rateLimited.data).toBeNull();
    expect(rateLimited.error?.message).toBe(
      'Rate limit exceeded. Please try again in a few minutes.'
    );

    const serverError = await submitToGlobalLeaderboard(payload);
    expect(serverError.data).toBeNull();
    expect(serverError.error?.message).toBe('Failed to save leaderboard entry');
  });
});
