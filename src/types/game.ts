import { Era, IPLEra, Player, PlayerRole } from './player';
import { MatchResult } from './tournament';

export interface SlotDefinition {
  id: number;
  name: string;
  shortName: string;
  description: string;
  eligibleRoles: PlayerRole[];
  requiresSpinBowling?: boolean;
}

export type DraftPick = Player;

export type GameMode =
  | 'International'
  | 'IPL'
  | 'Spin Mode'
  | 'Daily Stumpd'
  | 'Practice Mode';

export interface SpinResult {
  team: string;
  era: Era | IPLEra;
  candidates: Player[];
}

export type GamePhase = 'home' | 'draft' | 'lineup' | 'match' | 'results';

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  currentSlotIndex: number;
  picks: Player[];
  mulligansRemaining: number;
  captainId: string | null;
  currentMatchIndex: number;
  isSpinning: boolean;
  currentTeam: string | null;
  currentEra: Era | IPLEra | null;
  currentCandidates: Player[];
  matchResults: MatchResult[];
}
