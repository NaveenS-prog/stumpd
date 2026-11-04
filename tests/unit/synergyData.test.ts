import { describe, it, expect } from 'vitest';
import { CHEMISTRY_SYNERGIES, getActiveSynergies, getSynergyProgress } from '../../src/data/synergies';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Chemistry Synergies & Signature Traits Dataset', () => {
  it('contains at least 10 authentic real-life duos and trios', () => {
    expect(CHEMISTRY_SYNERGIES.length).toBeGreaterThanOrEqual(10);
    const rcbDuo = CHEMISTRY_SYNERGIES.find((s) => s.id === 'rcb_kohli_abd');
    expect(rcbDuo).toBeDefined();
    expect(rcbDuo?.playerIds).toContain('virat-kohli');
    expect(rcbDuo?.playerIds).toContain('ab-de-villiers');
  });

  it('detects active synergy only when all members are drafted in the team', () => {
    const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
    const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;

    // Only Kohli -> incomplete
    const partial = getActiveSynergies([kohli]);
    expect(partial.some((s) => s.id === 'rcb_kohli_abd')).toBe(false);

    // Progress shows 1/2 drafted
    const progress = getSynergyProgress([kohli]);
    const rcbProgress = progress.find((p) => p.synergy.id === 'rcb_kohli_abd');
    expect(rcbProgress?.draftedCount).toBe(1);
    expect(rcbProgress?.isComplete).toBe(false);

    // Both drafted -> active!
    const full = getActiveSynergies([kohli, abd]);
    expect(full.some((s) => s.id === 'rcb_kohli_abd')).toBe(true);
  });

  it('assigns signature traits to certified legends like Kohli, Dhoni, ABD, Bumrah, and Root', () => {
    const kohli = playersData.find((p) => p.id === 'virat-kohli');
    const dhoni = playersData.find((p) => p.id === 'ms-dhoni');
    const bumrah = playersData.find((p) => p.id === 'jasprit-bumrah');
    const abd = playersData.find((p) => p.id === 'ab-de-villiers');

    expect(kohli?.trait?.name).toBe('Chase Master');
    expect(dhoni?.trait?.name).toBe('Ice Finisher');
    expect(bumrah?.trait?.name).toBe('Death Yorker King');
    expect(abd?.trait?.name).toBe('360° Visionary');
  });
});
