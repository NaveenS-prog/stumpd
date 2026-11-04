import { ChemistrySynergy, Player } from '../types/player';

export const CHEMISTRY_SYNERGIES: ChemistrySynergy[] = [
  {
    id: 'rcb_kohli_abd',
    name: 'RCB Dynamic Duo',
    playerIds: ['virat-kohli', 'ab-de-villiers'],
    description: 'Legendary Royal Challengers partnership boosts batting performance by +10%',
    battingBoost: 0.10,
  },
  {
    id: 'srh_warner_bairstow',
    name: 'Orange Army Fire',
    playerIds: ['david-warner', 'jonny-bairstow'],
    description: 'Explosive destructive opening pair boosts top-order batting rating by +10%',
    battingBoost: 0.10,
  },
  {
    id: 'ind_spin_twins',
    name: 'Ash-Jaddu Spin Choke',
    playerIds: ['ravichandran-ashwin', 'ravindra-jadeja'],
    description: 'Relentless Indian spin tandem suffocates batting line-ups with +10% bowling boost',
    bowlingBoost: 0.10,
  },
  {
    id: 'pak_sultans_reverse',
    name: 'Two Ws Express',
    playerIds: ['wasim-akram', 'waqar-younis'],
    description: 'Lethal Pakistani swing masters boost pace bowling rating by +10%',
    bowlingBoost: 0.10,
  },
  {
    id: 'aus_pace_trio',
    name: 'Aussie Pace Trinity',
    playerIds: ['mitchell-starc', 'pat-cummins', 'josh-hazlewood'],
    description: 'Unrelenting Australian fast bowling barrage boosts pace attack by +12%',
    bowlingBoost: 0.12,
  },
  {
    id: 'wi_power_twins',
    name: 'Calypso Powerhouse',
    playerIds: ['kieron-pollard', 'andre-russell'],
    description: 'Caribbean death overs devastation boosts lower-order batting power by +10%',
    battingBoost: 0.10,
  },
  {
    id: 'kkr_mystery_duo',
    name: 'Mystery Spin Syndicate',
    playerIds: ['sunil-narine', 'varun-chakaravarthy'],
    description: 'Unorthodox Kolkata spin mystery produces +10% bowling rating boost',
    bowlingBoost: 0.10,
  },
  {
    id: 'csk_thala_chinna',
    name: 'Thala & Chinna Thala',
    playerIds: ['ms-dhoni', 'suresh-raina'],
    description: 'Chennai Super Kings iconic leadership and middle-order core boosts batting by +10%',
    battingBoost: 0.10,
  },
  {
    id: 'ind_deadly_openers',
    name: 'Destructive Openers',
    playerIds: ['sachin-tendulkar', 'virender-sehwag'],
    description: 'Iconic world-champion Indian opening pair boosts team batting rating by +10%',
    battingBoost: 0.10,
  },
  {
    id: 'wi_pace_quartet',
    name: 'Fire in Babylon',
    playerIds: ['malcolm-marshall', 'michael-holding', 'joel-garner'],
    description: 'Feared West Indian pace legends terrorize batsmen with +12% bowling rating boost',
    bowlingBoost: 0.12,
  },
  {
    id: 'ind_kul_cha',
    name: 'Kul-Cha Wrist Spin',
    playerIds: ['kuldeep-yadav', 'yuzvendra-chahal'],
    description: 'Attacking dual wrist-spin combo extracts sharp turn with +10% bowling boost',
    bowlingBoost: 0.10,
  },
  {
    id: 'pandya_brothers',
    name: 'Pandya Power Brothers',
    playerIds: ['hardik-pandya', 'krunal-pandya'],
    description: 'Baroda brotherhood synergy boosts batting and bowling allround ratings by +10%',
    battingBoost: 0.10,
    bowlingBoost: 0.10,
  },
];

export interface SynergyProgress {
  synergy: ChemistrySynergy;
  draftedCount: number;
  totalNeeded: number;
  isComplete: boolean;
  draftedPlayerIds: string[];
  missingPlayerIds: string[];
}

/**
 * Returns all synergies where every participating player has been drafted into picks.
 */
export function getActiveSynergies(picks: Player[]): ChemistrySynergy[] {
  const pickedIds = new Set(picks.map((p) => p.id));
  return CHEMISTRY_SYNERGIES.filter((synergy) =>
    synergy.playerIds.every((id) => pickedIds.has(id))
  );
}

/**
 * Returns the status of all synergies that have at least one member drafted or are complete.
 */
export function getSynergyProgress(picks: Player[]): SynergyProgress[] {
  const pickedIds = new Set(picks.map((p) => p.id));

  return CHEMISTRY_SYNERGIES.map((synergy) => {
    const drafted = synergy.playerIds.filter((id) => pickedIds.has(id));
    const missing = synergy.playerIds.filter((id) => !pickedIds.has(id));
    const isComplete = drafted.length === synergy.playerIds.length;

    return {
      synergy,
      draftedCount: drafted.length,
      totalNeeded: synergy.playerIds.length,
      isComplete,
      draftedPlayerIds: drafted,
      missingPlayerIds: missing,
    };
  }).filter((progress) => progress.draftedCount > 0);
}

/**
 * Checks if a candidate player contributes to or completes an active or partial synergy with current picks.
 */
export function getCandidateSynergyLinks(
  candidate: Player,
  currentPicks: Player[]
): { synergy: ChemistrySynergy; willComplete: boolean; activePartners: string[] }[] {
  const pickedIds = new Set(currentPicks.map((p) => p.id));
  const pickedMap = new Map(currentPicks.map((p) => [p.id, p.name]));

  const links: { synergy: ChemistrySynergy; willComplete: boolean; activePartners: string[] }[] = [];

  for (const synergy of CHEMISTRY_SYNERGIES) {
    if (!synergy.playerIds.includes(candidate.id)) continue;

    // See how many other members are drafted
    const otherMembers = synergy.playerIds.filter((id) => id !== candidate.id);
    const draftedPartners = otherMembers.filter((id) => pickedIds.has(id));

    if (draftedPartners.length > 0) {
      const willComplete = draftedPartners.length === otherMembers.length;
      const partnerNames = draftedPartners.map((id) => pickedMap.get(id) || id);

      links.push({
        synergy,
        willComplete,
        activePartners: partnerNames,
      });
    }
  }

  return links;
}
