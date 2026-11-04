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

export interface Player {
  id: string;
  name: string;
  country: string;              // Primary nationality
  franchise?: string[];         // Associated IPL franchises (e.g. ['CSK', 'MI'])
  eras: Era[];                  // Active eras where player qualifies
  primaryRole: PlayerRole;
  secondaryRoles?: PlayerRole[];
  battingRating: number;        // 40-99
  bowlingRating: number;        // 20-99
  battingHand: BattingHand;
  bowlingType: BowlingType;
  isCaptainCandidate?: boolean; // Bonus leadership potential
  rarity?: 'Legend' | 'Icon' | 'Pro';
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
