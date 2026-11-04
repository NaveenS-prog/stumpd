import playersData from '../data/players.json';
import { Player, Era, IPLEra } from '../types/player';
import { SlotDefinition, GameMode } from '../types/game';
import {
  NATIONAL_TEAMS,
  IPL_TEAMS,
  INTERNATIONAL_ERAS,
  IPL_ERAS,
  TEAMS,
} from '../data/teams';

export const ERAS: Era[] = INTERNATIONAL_ERAS;

const ALL_PLAYERS: Player[] = playersData as Player[];

function matchesSlotRole(player: Player, slot: SlotDefinition, strictPrimary: boolean = false): boolean {
  const roleMatches =
    strictPrimary || slot.eligibleRoles.length === 1
      ? slot.eligibleRoles.includes(player.primaryRole)
      : slot.eligibleRoles.includes(player.primaryRole) ||
        Boolean(player.secondaryRoles?.some((r) => slot.eligibleRoles.includes(r)));

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

function isIPLTeam(teamId: string): boolean {
  return IPL_TEAMS.some(
    (t) => t.id === teamId || t.name === teamId || t.shortName === teamId
  );
}

function resolveTeamId(teamIdOrName: string): string {
  const teamObj = TEAMS.find(
    (t) => t.id === teamIdOrName || t.name === teamIdOrName || t.shortName === teamIdOrName
  );
  return teamObj ? teamObj.id : teamIdOrName;
}

function getEraDistance<T extends string>(list: readonly T[], a: T, b: T): number {
  const indexA = list.indexOf(a);
  const indexB = list.indexOf(b);
  if (indexA === -1 || indexB === -1) return 99;
  return Math.abs(indexA - indexB);
}

class DraftMachine {
  public getAllPlayers(): Player[] {
    return ALL_PLAYERS;
  }

  public getCandidatesForSlot(
    slot: SlotDefinition,
    team: string,
    era: Era | IPLEra,
    currentPicks: (Player | null | undefined)[],
    mode: GameMode = 'International'
  ): Player[] {
    const pickedIds = new Set(
      currentPicks.filter((p): p is Player => Boolean(p && p.id)).map((p) => p.id)
    );

    const targetTeam = resolveTeamId(team);
    const isIPL = mode === 'IPL' || isIPLTeam(targetTeam);

    if (isIPL) {
      return this.getCandidatesForIPL(slot, targetTeam, era as IPLEra, pickedIds);
    }

    return this.getCandidatesForInternational(slot, targetTeam, era as Era, pickedIds);
  }

  private getCandidatesForIPL(
    slot: SlotDefinition,
    franchise: string,
    era: IPLEra,
    pickedIds: Set<string>
  ): Player[] {
    // Only players who actually played in the IPL are eligible in IPL mode
    const iplPool = ALL_PLAYERS.filter(
      (p) => !pickedIds.has(p.id) && Boolean(p.iplCareers && p.iplCareers.length > 0)
    );

    // 1. Direct Search (Franchise + IPL Era + Slot) - prefer strict primary role first
    const directStrict = iplPool.filter(
      (p) =>
        matchesSlotRole(p, slot, true) &&
        p.iplCareers!.some((c) => c.franchise === franchise && c.eras.includes(era))
    );
    if (directStrict.length > 0) return directStrict;

    const directRelaxed = iplPool.filter(
      (p) =>
        matchesSlotRole(p, slot, false) &&
        p.iplCareers!.some((c) => c.franchise === franchise && c.eras.includes(era))
    );
    if (directRelaxed.length > 0) return directRelaxed;

    // 2. Smart Fallback strictly within IPL players
    // Strategy A: Adjacent IPL eras for same franchise
    const sortedAdjacentEras = [...IPL_ERAS]
      .filter((e) => e !== era)
      .sort((a, b) => getEraDistance(IPL_ERAS, era, a) - getEraDistance(IPL_ERAS, era, b));

    for (const adjEra of sortedAdjacentEras) {
      const adjMatches = iplPool.filter(
        (p) =>
          matchesSlotRole(p, slot, false) &&
          p.iplCareers!.some((c) => c.franchise === franchise && c.eras.includes(adjEra))
      );
      if (adjMatches.length > 0) return adjMatches;
    }

    // Strategy B: Any era for same franchise
    const franchiseMatches = iplPool.filter(
      (p) =>
        matchesSlotRole(p, slot, false) &&
        p.iplCareers!.some((c) => c.franchise === franchise)
    );
    if (franchiseMatches.length > 0) return franchiseMatches;

    // Strategy C: Same IPL era across any IPL franchise
    const eraMatches = iplPool.filter(
      (p) =>
        matchesSlotRole(p, slot, false) &&
        p.iplCareers!.some((c) => c.eras.includes(era))
    );
    if (eraMatches.length > 0) return eraMatches;

    // Strategy D: Any IPL player matching slot role (guarantees IPL isolation)
    const anyIPLMatches = iplPool.filter((p) => matchesSlotRole(p, slot, false));
    return anyIPLMatches;
  }

  private getCandidatesForInternational(
    slot: SlotDefinition,
    country: string,
    era: Era,
    pickedIds: Set<string>
  ): Player[] {
    const intlPool = ALL_PLAYERS.filter(
      (p) => !pickedIds.has(p.id) && NATIONAL_TEAMS.some((t) => t.id === p.country)
    );

    const matchesCountry = (p: Player) => p.country === country;
    const matchesIntlEra = (p: Player, e: Era) =>
      p.internationalEras?.length ? p.internationalEras.includes(e) : Boolean(p.eras?.includes(e));

    // 1. Direct Search - strict role first, then relaxed
    const directStrict = intlPool.filter(
      (p) => matchesSlotRole(p, slot, true) && matchesCountry(p) && matchesIntlEra(p, era)
    );
    if (directStrict.length > 0) return directStrict;

    const directRelaxed = intlPool.filter(
      (p) => matchesSlotRole(p, slot, false) && matchesCountry(p) && matchesIntlEra(p, era)
    );
    if (directRelaxed.length > 0) return directRelaxed;

    // 2. Smart Fallback strictly within international players
    // Strategy A: Adjacent decade for same country
    const sortedAdjacentEras = [...INTERNATIONAL_ERAS]
      .filter((e) => e !== era)
      .sort((a, b) => getEraDistance(INTERNATIONAL_ERAS, era, a) - getEraDistance(INTERNATIONAL_ERAS, era, b));

    for (const adjEra of sortedAdjacentEras) {
      const adjMatches = intlPool.filter(
        (p) => matchesSlotRole(p, slot, false) && matchesCountry(p) && matchesIntlEra(p, adjEra)
      );
      if (adjMatches.length > 0) return adjMatches;
    }

    // Strategy B: Any decade for same country
    const countryMatches = intlPool.filter(
      (p) => matchesSlotRole(p, slot, false) && matchesCountry(p)
    );
    if (countryMatches.length > 0) return countryMatches;

    // Strategy C: Same decade across any country
    const eraMatches = intlPool.filter(
      (p) => matchesSlotRole(p, slot, false) && matchesIntlEra(p, era)
    );
    if (eraMatches.length > 0) return eraMatches;

    // Strategy D: Any international player matching slot role
    const anyIntlMatches = intlPool.filter((p) => matchesSlotRole(p, slot, false));
    return anyIntlMatches;
  }

  public spinSlotReels(
    _slotIndex: number,
    mode: GameMode = 'International',
    rng: () => number = Math.random
  ): { team: string; era: Era | IPLEra } {
    if (mode === 'IPL') {
      const randomTeamIndex = Math.floor(rng() * IPL_TEAMS.length);
      const selectedTeam = IPL_TEAMS[randomTeamIndex].id;

      // LSG and GT entered in 2022
      if (selectedTeam === 'LSG' || selectedTeam === 'GT') {
        return {
          team: selectedTeam,
          era: '2022–Present',
        };
      }

      const randomEraIndex = Math.floor(rng() * IPL_ERAS.length);
      const selectedEra = IPL_ERAS[randomEraIndex];

      return {
        team: selectedTeam,
        era: selectedEra,
      };
    }

    // International Tour / Default
    const randomTeamIndex = Math.floor(rng() * NATIONAL_TEAMS.length);
    const selectedTeam = NATIONAL_TEAMS[randomTeamIndex].id;

    const randomEraIndex = Math.floor(rng() * INTERNATIONAL_ERAS.length);
    const selectedEra = INTERNATIONAL_ERAS[randomEraIndex];

    return {
      team: selectedTeam,
      era: selectedEra,
    };
  }
}

export const draftMachine = new DraftMachine();
