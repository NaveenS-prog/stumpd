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
      expect(c.primaryRole === 'Opener' || c.secondaryRoles?.includes('Opener')).toBe(true);
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

  it('unlocks Opener, Wicketkeeper, and Pacer secondary roles in directMatches while sorting primary roles first', () => {
    // Hybrid keeper-openers in Opener slot (International)
    const ausOpeners = draftMachine.getCandidatesForSlot(SLOTS[0], 'Australia', '2000s', [], 'International');
    expect(ausOpeners.some((c) => c.name === 'Adam Gilchrist')).toBe(true);
    const firstAusNonPrimaryIdx = ausOpeners.findIndex((c) => c.primaryRole !== 'Opener');
    expect(firstAusNonPrimaryIdx).toBeGreaterThan(0);
    expect(ausOpeners.slice(firstAusNonPrimaryIdx).every((c) => c.primaryRole !== 'Opener')).toBe(true);

    const engOpeners = draftMachine.getCandidatesForSlot(SLOTS[0], 'England', 'Modern', [], 'International');
    expect(engOpeners.some((c) => c.name === 'Jos Buttler')).toBe(true);
    const firstEngNonPrimaryIdx = engOpeners.findIndex((c) => c.primaryRole !== 'Opener');
    expect(firstEngNonPrimaryIdx).toBeGreaterThan(0);
    expect(engOpeners.slice(firstEngNonPrimaryIdx).every((c) => c.primaryRole !== 'Opener')).toBe(true);

    // Hybrid opener-keeper in Wicketkeeper slot (International)
    const indWks = draftMachine.getCandidatesForSlot(SLOTS[7], 'India', 'Modern', [], 'International');
    expect(indWks.some((c) => c.name === 'KL Rahul')).toBe(true);
    const firstIndNonPrimaryWkIdx = indWks.findIndex((c) => c.primaryRole !== 'Wicketkeeper');
    expect(firstIndNonPrimaryWkIdx).toBeGreaterThan(0);
    expect(indWks.slice(firstIndNonPrimaryWkIdx).every((c) => c.primaryRole !== 'Wicketkeeper')).toBe(true);

    // Hybrid allrounder-pacer in Strike Pacer slot (International)
    const indPacers = draftMachine.getCandidatesForSlot(SLOTS[9], 'India', 'Modern', [], 'International');
    expect(indPacers.some((c) => c.name === 'Hardik Pandya')).toBe(true);
    const firstIndNonPrimaryPacerIdx = indPacers.findIndex((c) => c.primaryRole !== 'Pacer');
    expect(firstIndNonPrimaryPacerIdx).toBeGreaterThan(0);
    expect(indPacers.slice(firstIndNonPrimaryPacerIdx).every((c) => c.primaryRole !== 'Pacer')).toBe(true);
  });

  it('keeps Slot 7 (Allrounder) strict primary-role-only', () => {
    const allrounderSlot = SLOTS[6];
    const intlAllrounders = draftMachine.getCandidatesForSlot(allrounderSlot, 'India', 'Modern', [], 'International');
    expect(intlAllrounders.length).toBeGreaterThan(0);
    expect(intlAllrounders.some((c) => c.name === 'Ravichandran Ashwin')).toBe(false);
    expect(intlAllrounders.every((c) => c.primaryRole === 'Allrounder')).toBe(true);

    const iplAllrounders = draftMachine.getCandidatesForSlot(allrounderSlot, 'RR', '2022–Present', [], 'IPL');
    expect(iplAllrounders.length).toBeGreaterThan(0);
    expect(iplAllrounders.some((c) => c.name === 'Ravichandran Ashwin')).toBe(false);
    expect(iplAllrounders.every((c) => c.primaryRole === 'Allrounder')).toBe(true);
  });

  it('sorts strict primary-role candidates ahead of secondary-role candidates across fallback Strategies A-D', () => {
    const assertPrimaryFirst = (candidates: ReturnType<typeof draftMachine.getCandidatesForSlot>, primaryRole: string) => {
      const firstNonPrimary = candidates.findIndex((c) => c.primaryRole !== primaryRole);
      expect(candidates.some((c) => c.primaryRole === primaryRole)).toBe(true);
      expect(candidates.some((c) => c.primaryRole !== primaryRole)).toBe(true);
      expect(firstNonPrimary).toBeGreaterThan(0);
      expect(candidates.slice(firstNonPrimary).every((c) => c.primaryRole !== primaryRole)).toBe(true);
    };

    // Strategy A (IPL): LSG 2018-2021 Wicketkeeper falls back to 2022-Present (Quinton de Kock, Nicholas Pooran before KL Rahul)
    const iplStratA = draftMachine.getCandidatesForSlot(SLOTS[7], 'LSG', '2018–2021', [], 'IPL');
    assertPrimaryFirst(iplStratA, 'Wicketkeeper');

    // Strategy A (International): South Africa 1980s Pacer falls back to 1990s (Donald/Schultz/Ntini/de Villiers before Kallis/Klusener/Pollock)
    const intlStratA = draftMachine.getCandidatesForSlot(SLOTS[9], 'South Africa', '1980s', [], 'International');
    assertPrimaryFirst(intlStratA, 'Pacer');

    // Strategy C (IPL): Pick all LSG Wicketkeepers so 2008-2012 falls back to same era across all IPL franchises
    const lsgAllWks = draftMachine.getCandidatesForSlot(SLOTS[7], 'LSG', '2022–Present', [], 'IPL');
    const iplStratC = draftMachine.getCandidatesForSlot(SLOTS[7], 'LSG', '2008–2012', lsgAllWks, 'IPL');
    assertPrimaryFirst(iplStratC, 'Wicketkeeper');

    // Strategy C (International): Pick all Afghanistan Wicketkeepers so 2000s falls back to same era across all countries
    const allPlayers = draftMachine.getAllPlayers();
    const afgWks = allPlayers.filter(
      (p) => p.country === 'Afghanistan' && (p.primaryRole === 'Wicketkeeper' || p.secondaryRoles?.includes('Wicketkeeper'))
    );
    const intlStratC = draftMachine.getCandidatesForSlot(SLOTS[7], 'Afghanistan', '2000s', afgWks, 'International');
    assertPrimaryFirst(intlStratC, 'Wicketkeeper');

    // Strategy D (IPL): Also exclude all 2008-2012 IPL Wicketkeepers to hit anyIPLMatches
    const ipl08Wks = allPlayers.filter(
      (p) =>
        Boolean(p.iplCareers?.some((c) => c.eras.includes('2008–2012'))) &&
        (p.primaryRole === 'Wicketkeeper' || p.secondaryRoles?.includes('Wicketkeeper'))
    );
    const iplStratD = draftMachine.getCandidatesForSlot(SLOTS[7], 'LSG', '2008–2012', [...lsgAllWks, ...ipl08Wks], 'IPL');
    assertPrimaryFirst(iplStratD, 'Wicketkeeper');

    // Strategy D (International): Also exclude all 2000s International Wicketkeepers to hit anyIntlMatches
    const intl2000Wks = allPlayers.filter(
      (p) =>
        (p.internationalEras?.length ? p.internationalEras.includes('2000s') : Boolean(p.eras?.includes('2000s'))) &&
        (p.primaryRole === 'Wicketkeeper' || p.secondaryRoles?.includes('Wicketkeeper'))
    );
    const intlStratD = draftMachine.getCandidatesForSlot(
      SLOTS[7],
      'Afghanistan',
      '2000s',
      [...afgWks, ...intl2000Wks],
      'International'
    );
    assertPrimaryFirst(intlStratD, 'Wicketkeeper');
  });

  it('never spins 1980s or 1990s for Bangladesh or Afghanistan across 200 seeded spins', () => {
    let seed = 1337;
    const seededRng = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const validLateEras = ['2000s', '2010s', 'Modern'];
    let bangladeshCount = 0;
    let afghanistanCount = 0;

    for (let i = 0; i < 200; i++) {
      const spin = draftMachine.spinSlotReels(i % 11, 'International', seededRng);
      if (spin.team === 'Bangladesh') {
        bangladeshCount++;
        expect(validLateEras).toContain(spin.era);
        expect(['1980s', '1990s']).not.toContain(spin.era);
      }
      if (spin.team === 'Afghanistan') {
        afghanistanCount++;
        expect(validLateEras).toContain(spin.era);
        expect(['1980s', '1990s']).not.toContain(spin.era);
      }
    }

    expect(bangladeshCount).toBeGreaterThan(0);
    expect(afghanistanCount).toBeGreaterThan(0);
  });
});
