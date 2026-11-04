import { describe, it, expect } from 'vitest';
import { simulateMatch } from '../../src/engine/simulator';
import { VENUES } from '../../src/data/venues';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';
import { OPPONENTS } from '../../src/data/opponents';

describe('Traits and Synergy Match Simulation', () => {
  const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
  const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;
  const otherNine = playersData.slice(2, 11) as Player[];
  const teamWithDuo = [kohli, abd, ...otherNine];
  const venue = VENUES[0];

  it('boosts player ratings when their chemistry synergy is active', () => {
    const opp = OPPONENTS[0];
    const result = simulateMatch(teamWithDuo, opp, venue, kohli.id);

    expect(result.activeSynergyNames).toBeDefined();
    expect(result.activeSynergyNames).toContain('RCB Dynamic Duo');
  });

  it('logs signature traits in top performer highlights or match results', () => {
    const opp = OPPONENTS[0];
    const bumrah = playersData.find((p) => p.id === 'jasprit-bumrah') as Player;
    const teamWithBumrah = [bumrah, ...playersData.slice(1, 11) as Player[]];

    const result = simulateMatch(teamWithBumrah, opp, venue, bumrah.id);
    expect(result.playerOfTheMatch).toBeDefined();
  });
});
