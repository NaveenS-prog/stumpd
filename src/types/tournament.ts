import { Era, IPLEra, Player } from './player';

export type PitchType =
  | 'Dustbowl'
  | 'GreenSeamer'
  | 'FlatBatting'
  | 'SportingBalanced'
  | 'ExpressBouncy';

export interface TacticalModifier {
  battingBoost?: number;       // e.g. 0.15 for +15%
  bowlingBoost?: number;
  spinBoost?: number;          // e.g. 0.20 for +20%
  pacerBoost?: number;         // e.g. 0.20 for +20%
  description: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  pitchType: PitchType;
  pitchDescription: string;
  modifier: TacticalModifier;
}

export interface OpponentTeam {
  id: string;
  name: string;
  era: Era | IPLEra;
  captain: string;
  keyPlayer: string;
  description: string;
  strengths: string[];
  players: Player[];
  venueId?: string;
}

export interface InningScore {
  runs: number;
  wickets: number;
  overs: number;
}

export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  runsScored?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  wicketsTaken?: number;
  oversBowled?: number;
  runsConceded?: number;
  isCaptain?: boolean;
  highlight?: string;
}

export interface Scorecard {
  userBatting: PlayerPerformance[];
  userBowling: PlayerPerformance[];
  opponentBatting: PlayerPerformance[];
  opponentBowling: PlayerPerformance[];
}

export interface MatchResult {
  won: boolean;
  userScore: InningScore;
  opponentScore: InningScore;
  margin: string;
  playerOfTheMatch?: PlayerPerformance;
  topPerformers: PlayerPerformance[];
  userScorecard?: PlayerPerformance[];
  opponentScorecard?: PlayerPerformance[];
}

export interface Match {
  id: number;
  name: string;
  opponent: OpponentTeam;
  venue: Venue;
  isKnockout?: boolean;
}

export interface PitchAdjustedRatings {
  battingRatings: Record<string, number>;
  bowlingRatings: Record<string, number>;
}
