export type PlayerRole =
  | 'Opener'
  | 'TopOrder'
  | 'MiddleOrder'
  | 'Finisher'
  | 'Allrounder'
  | 'Wicketkeeper'
  | 'Spinner'
  | 'Pacer';

export type BattingHand = 'Right' | 'Left';

export type BowlingType =
  | 'Fast'
  | 'FastMedium'
  | 'Medium'
  | 'OffSpin'
  | 'LegSpin'
  | 'LeftArmOrthodox'
  | 'LeftArmUnorthodox'
  | 'None';

export type Era = '1980s' | '1990s' | '2000s' | '2010s' | 'Modern';
export type IPLEra = '2008–2012' | '2013–2017' | '2018–2021' | '2022–Present';

export type TraitTrigger = 'Chasing' | 'DeathOvers' | 'Powerplay' | 'SpinPitch' | 'PacePitch' | 'General';

export interface PlayerTrait {
  id: string;
  name: string;
  description: string;
  trigger: TraitTrigger;
  battingBoost?: number;  // e.g. 0.15 for +15%
  bowlingBoost?: number;  // e.g. 0.20 for +20%
}

export interface ChemistrySynergy {
  id: string;
  name: string;
  playerIds: string[];
  description: string;
  battingBoost?: number;
  bowlingBoost?: number;
}

export interface IPLAffiliation {
  franchise: string; // 'CSK' | 'MI' | 'RCB' | 'KKR' | 'RR' | 'SRH' | 'DC' | 'PK' | 'LSG' | 'GT'
  eras: IPLEra[];
}

export interface Player {
  id: string;
  name: string;
  country: string;              // Primary nationality
  internationalEras: Era[];     // Decades player played internationally
  iplCareers?: IPLAffiliation[]; // Verified IPL career with franchises and IPL eras
  eras?: Era[];                 // Compatibility fallback
  franchise?: string[];         // Compatibility fallback
  primaryRole: PlayerRole;
  secondaryRoles?: PlayerRole[];
  battingRating: number;        // 40-99
  bowlingRating: number;        // 20-99
  battingHand: BattingHand;
  bowlingType: BowlingType;
  isCaptainCandidate?: boolean; // Bonus leadership potential
  rarity?: 'Legend' | 'Icon' | 'Pro';
  trait?: PlayerTrait;
}

export type TeamType = 'Country' | 'Franchise';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  type: TeamType;
  color?: string;
  flagOrLogo?: string;
}
