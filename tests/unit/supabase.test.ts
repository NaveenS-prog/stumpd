import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  fetchGlobalLeaderboard,
  submitToGlobalLeaderboard,
} from '../../src/services/supabase';

describe('Supabase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('determines configuration status correctly', () => {
    const configured = isSupabaseConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('handles client queries successfully with mocked Supabase client', async () => {
    const mockOrder2 = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({
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
      }),
    });
    const mockOrder1 = vi.fn().mockReturnValue({
      order: mockOrder2,
    });
    mockSelect.mockReturnValue({
      order: mockOrder1,
    });

    const { data, error } = await fetchGlobalLeaderboard(10);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].teamName).toBe('Super Kings');
    expect(data?.[0].totalScore).toBe(950);
  });

  it('handles successful score submission with mocked client', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'mock-new-id',
        team_name: 'Test XI',
        creator_name: 'Coach Test',
        mode: 'Standard',
        total_score: 850,
        grade: 'A',
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
      grade: 'A',
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
