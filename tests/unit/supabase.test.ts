import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isSupabaseConfigured,
  fetchGlobalLeaderboard,
  submitToGlobalLeaderboard,
} from '../../src/services/supabase';

describe('Supabase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports unconfigured when environment variables are missing or placeholders', () => {
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('gracefully fails with error when fetching global leaderboard while unconfigured', async () => {
    const { data, error } = await fetchGlobalLeaderboard();
    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toMatch(/Supabase is not configured/i);
  });

  it('gracefully fails with error when submitting to global leaderboard while unconfigured', async () => {
    const { data, error } = await submitToGlobalLeaderboard({
      teamName: 'Test XI',
      mode: 'Standard',
      totalScore: 800,
      grade: 'A',
      matchesWon: 5,
      totalMatches: 7,
      captainName: 'Test Captain',
      synergiesCount: 1,
      isInvincible: false,
    });
    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toMatch(/Supabase is not configured/i);
  });
});
