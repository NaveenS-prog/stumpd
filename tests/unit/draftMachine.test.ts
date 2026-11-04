import { describe, it, expect } from 'vitest';
import { draftMachine } from '../../src/engine/draftMachine';
import { SLOTS } from '../../src/data/slots';
import { TEAMS } from '../../src/data/teams';

describe('Draft Machine & Candidate Resolution', () => {
  it('filters eligible players for a slot and avoids duplicate selections', () => {
    const slot1 = SLOTS[0]; // Opener 1
    const candidates = draftMachine.getCandidatesForSlot(slot1, 'India', '2000s', []);
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    candidates.forEach((c) => {
      expect(['Opener']).toContain(c.primaryRole);
    });

    // If a player is already picked, they cannot appear in candidates again
    const firstPick = candidates[0];
    const nextCandidates = draftMachine.getCandidatesForSlot(SLOTS[1], 'India', '2000s', [firstPick]);
    expect(nextCandidates.some((c) => c.id === firstPick.id)).toBe(false);
  });

  it('guarantees valid candidate through smart fallback when combination is sparse', () => {
    // Spinner slot with an IPL team in 1980s (IPL did not exist in 1980s)
    const spinnerSlot = SLOTS[8]; // Lead Spinner
    const fallbackCandidates = draftMachine.getCandidatesForSlot(spinnerSlot, 'CSK', '1980s', []);
    expect(fallbackCandidates.length).toBeGreaterThanOrEqual(1);
  });

  it('generates reel spin results with valid team and era', () => {
    const spin = draftMachine.spinSlotReels(0);
    expect(TEAMS.some((t) => t.id === spin.team || t.name === spin.team)).toBe(true);
    expect(['1980s', '1990s', '2000s', '2010s', '2020s']).toContain(spin.era);
  });
});
