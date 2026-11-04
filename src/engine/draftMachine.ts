import playersData from '../data/players.json';
import { Player, Era } from '../types/player';
import { SlotDefinition } from '../types/game';
import { TEAMS } from '../data/teams';

export const ERAS: Era[] = ['1980s', '1990s', '2000s', '2010s', 'Modern'];

const ALL_PLAYERS: Player[] = playersData as Player[];

function matchesSlotRole(player: Player, slot: SlotDefinition): boolean {
  const roleMatches =
    slot.eligibleRoles.includes(player.primaryRole) ||
    (Boolean(player.secondaryRoles) &&
      player.secondaryRoles!.some((r) => slot.eligibleRoles.includes(r)));

  if (!roleMatches) return false;

  if (slot.requiresSpinBowling) {
    const isSpin =
      player.primaryRole === 'Spinner' ||
      player.bowlingType?.includes('Spin') ||
      player.bowlingType?.includes('Break') ||
      player.bowlingType?.includes('Orthodox') ||
      player.bowlingType?.includes('Chinaman') ||
      player.bowlingType?.includes('Unorthodox');

    if (!isSpin) return false;
  }

  return true;
}

function matchesTeam(player: Player, teamIdOrName: string): boolean {
  const teamObj = TEAMS.find(
    (t) => t.id === teamIdOrName || t.name === teamIdOrName || t.shortName === teamIdOrName
  );
  const targetId = teamObj ? teamObj.id : teamIdOrName;

  return player.country === targetId || (Boolean(player.franchise) && player.franchise!.includes(targetId));
}

function matchesEra(player: Player, era: Era): boolean {
  return Boolean(player.eras && player.eras.includes(era));
}

function getEraDistance(a: Era, b: Era): number {
  const indexA = ERAS.indexOf(a);
  const indexB = ERAS.indexOf(b);
  return Math.abs(indexA - indexB);
}

class DraftMachine {
  public getAllPlayers(): Player[] {
    return ALL_PLAYERS;
  }

  public getCandidatesForSlot(
    slot: SlotDefinition,
    team: string,
    era: Era,
    currentPicks: (Player | null | undefined)[]
  ): Player[] {
    const pickedIds = new Set(
      currentPicks.filter((p): p is Player => Boolean(p && p.id)).map((p) => p.id)
    );

    // 1. Direct search (team + era + slot)
    const directMatches = ALL_PLAYERS.filter(
      (p) =>
        !pickedIds.has(p.id) &&
        matchesSlotRole(p, slot) &&
        matchesTeam(p, team) &&
        matchesEra(p, era)
    );

    if (directMatches.length > 0) {
      return directMatches;
    }

    // 2. Smart fallback if combination is sparse
    return this.resolveSmartFallback(slot, team, era, pickedIds);
  }

  public resolveSmartFallback(
    slot: SlotDefinition,
    team: string,
    era: Era,
    pickedIds: Set<string>
  ): Player[] {
    // Strategy A: Adjacent eras for the same team and slot
    const sortedAdjacentEras = [...ERAS]
      .filter((e) => e !== era)
      .sort((a, b) => getEraDistance(era, a) - getEraDistance(era, b));

    for (const adjEra of sortedAdjacentEras) {
      const adjMatches = ALL_PLAYERS.filter(
        (p) =>
          !pickedIds.has(p.id) &&
          matchesSlotRole(p, slot) &&
          matchesTeam(p, team) &&
          matchesEra(p, adjEra)
      );
      if (adjMatches.length > 0) {
        return adjMatches;
      }
    }

    // Strategy B: Any era for same team and slot
    const teamSlotMatches = ALL_PLAYERS.filter(
      (p) => !pickedIds.has(p.id) && matchesSlotRole(p, slot) && matchesTeam(p, team)
    );
    if (teamSlotMatches.length > 0) {
      return teamSlotMatches;
    }

    // Strategy C: Same era and slot across any team
    const eraSlotMatches = ALL_PLAYERS.filter(
      (p) => !pickedIds.has(p.id) && matchesSlotRole(p, slot) && matchesEra(p, era)
    );
    if (eraSlotMatches.length > 0) {
      return eraSlotMatches;
    }

    // Strategy D: Global slot fallback (guarantees candidate availability)
    const globalMatches = ALL_PLAYERS.filter(
      (p) => !pickedIds.has(p.id) && matchesSlotRole(p, slot)
    );
    return globalMatches;
  }

  public spinSlotReels(
    _slotIndex: number,
    rng: () => number = Math.random
  ): { team: string; era: Era } {
    const randomTeamIndex = Math.floor(rng() * TEAMS.length);
    const selectedTeam = TEAMS[randomTeamIndex].id;

    const randomEraIndex = Math.floor(rng() * ERAS.length);
    const selectedEra = ERAS[randomEraIndex];

    return {
      team: selectedTeam,
      era: selectedEra,
    };
  }
}

export const draftMachine = new DraftMachine();
