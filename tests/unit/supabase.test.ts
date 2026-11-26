import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
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

  it('handles successful score submission with mocked client', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'mock-new-id',
        team_name: 'Test XI',
        creator_name: 'Coach Test',
        mode: 'Standard',
        total_score: 850,
        grade: 'S',
        matches_won: 5,
        total_matches: 7,
        captain_name: 'Test Captain',
        synergies_count: 2,
        is_invincible: false,
        created_at: '2026-11-23T12:00:00Z',
      },
      error: null,
    });
    const mockSelectReturn = vi.fn().mockReturnValue({
      single: mockSingle,
    });
    mockInsert.mockReturnValue({
      select: mockSelectReturn,
    });

    const { data, error } = await submitToGlobalLeaderboard({
      teamName: 'Test XI',
      creatorName: 'Coach Test',
      mode: 'Standard',
      totalScore: 850,
      grade: 'S',
      matchesWon: 5,
      totalMatches: 7,
      captainName: 'Test Captain',
      synergiesCount: 2,
      isInvincible: false,
    });

    expect(error).toBeNull();
    expect(data?.teamName).toBe('Test XI');
    expect(data?.totalScore).toBe(850);
  });
});
