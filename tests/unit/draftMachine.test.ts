import { describe, it, expect } from 'vitest';
import { draftMachine } from '../../src/engine/draftMachine';
import { SLOTS } from '../../src/data/slots';
import { IPL_TEAMS, NATIONAL_TEAMS, IPL_ERAS, INTERNATIONAL_ERAS } from '../../src/data/teams';

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
    const spinnerSlot = SLOTS[8]; // Lead Spinner
    const fallbackCandidates = draftMachine.getCandidatesForSlot(spinnerSlot, 'CSK', '2008–2012', [], 'IPL');
    expect(fallbackCandidates.length).toBeGreaterThanOrEqual(1);
    // Every candidate must have an IPL career
    fallbackCandidates.forEach((c) => {
      expect(c.iplCareers).toBeDefined();
      expect(c.iplCareers!.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('generates reel spin results with valid team and era for International mode', () => {
    const spin = draftMachine.spinSlotReels(0, 'International');
    expect(NATIONAL_TEAMS.some((t) => t.id === spin.team)).toBe(true);
    expect(INTERNATIONAL_ERAS).toContain(spin.era);
  });

  it('generates reel spin results with valid franchise and era for IPL mode', () => {
    const spin = draftMachine.spinSlotReels(0, 'IPL');
    expect(IPL_TEAMS.some((t) => t.id === spin.team)).toBe(true);
    expect(IPL_ERAS).toContain(spin.era);
  });

  it('strictly isolates player pools: no international legends appear in IPL mode', () => {
    // In IPL mode, all candidates must have verified IPL affiliations
    const pacerSlot = SLOTS[9]; // Strike Pacer
    const iplCandidates = draftMachine.getCandidatesForSlot(pacerSlot, 'MI', '2013–2017', [], 'IPL');
    expect(iplCandidates.length).toBeGreaterThanOrEqual(1);

    iplCandidates.forEach((c) => {
      expect(c.iplCareers).toBeDefined();
      expect(c.iplCareers!.length).toBeGreaterThan(0);
      // Non-IPL legends like Kapil Dev or Malcolm Marshall or Dennis Lillee must never leak into IPL mode
      expect(['kapil-dev', 'malcolm-marshall', 'dennis-lillee', 'ian-botham', 'curtly-ambrose']).not.toContain(c.id);
    });
  });

  it('resolves authentic IPL franchise players accurately', () => {
    // CSK in 2008-2012 should have genuine CSK players
    const wkSlot = SLOTS[7]; // Wicketkeeper
    const cskWkCandidates = draftMachine.getCandidatesForSlot(wkSlot, 'CSK', '2008–2012', [], 'IPL');
    expect(cskWkCandidates.some((c) => c.name === 'MS Dhoni')).toBe(true);

    // RCB in 2013-2017 should have genuine RCB players
    const batSlot = SLOTS[2]; // No. 3
    const rcbCandidates = draftMachine.getCandidatesForSlot(batSlot, 'RCB', '2013–2017', [], 'IPL');
    expect(rcbCandidates.some((c) => c.name === 'Virat Kohli' || c.name === 'AB de Villiers')).toBe(true);
  });
});
