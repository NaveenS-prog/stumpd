import { describe, it, expect } from 'vitest';
import { PlayerTrait, ChemistrySynergy } from '../../src/types/player';

describe('Trait and Synergy Type Validations', () => {
  it('supports well-formed player trait definitions', () => {
    const trait: PlayerTrait = {
      id: 'chase_master',
      name: 'Chase Master',
      description: 'Increases batting rating when chasing targets in the second innings',
      trigger: 'Chasing',
      battingBoost: 0.15,
    };
    expect(trait.id).toBe('chase_master');
    expect(trait.trigger).toBe('Chasing');
    expect(trait.battingBoost).toBe(0.15);
  });

  it('supports chemistry synergy duo definitions', () => {
    const synergy: ChemistrySynergy = {
      id: 'rcb_duo',
      name: 'RCB Dynamic Duo',
      playerIds: ['virat-kohli', 'ab-de-villiers'],
      description: 'Legendary Royal Challengers partnership boosts batting performance',
      battingBoost: 0.10,
    };
    expect(synergy.playerIds.length).toBe(2);
    expect(synergy.battingBoost).toBe(0.10);
  });
});
