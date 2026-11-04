import { Player } from '../types/player';
import {
  Venue,
  OpponentTeam,
  MatchResult,
  PitchAdjustedRatings,
  PlayerPerformance,
} from '../types/tournament';

export function isSpinner(player: Player): boolean {
  if (player.primaryRole === 'Spinner') return true;
  const bType = player.bowlingType || '';
  return (
    bType.includes('Spin') ||
    bType.includes('Break') ||
    bType.includes('Orthodox') ||
    bType.includes('Chinaman')
  );
}

export function isPacer(player: Player): boolean {
  if (player.primaryRole === 'Pacer') return true;
  const bType = player.bowlingType || '';
  return (
    bType.includes('Fast') ||
    bType.includes('Medium') ||
    bType.includes('Seam')
  );
}

export function calculatePitchAdjustedRatings(
  players: Player[],
  venue: Venue,
  captainId?: string
): PitchAdjustedRatings {
  const battingRatings: Record<string, number> = {};
  const bowlingRatings: Record<string, number> = {};

  const battingBoost = venue.modifier.battingBoost ?? 0;
  const spinBoost = venue.modifier.spinBoost ?? 0;
  const pacerBoost = venue.modifier.pacerBoost ?? 0;
  const generalBowlingBoost = venue.modifier.bowlingBoost ?? 0;

  for (const player of players) {
    let adjBat = player.battingRating * (1 + battingBoost);

    let adjBowl = player.bowlingRating;
    if (isSpinner(player)) {
      adjBowl = adjBowl * (1 + spinBoost + generalBowlingBoost);
    } else if (isPacer(player)) {
      adjBowl = adjBowl * (1 + pacerBoost + generalBowlingBoost);
    } else {
      adjBowl = adjBowl * (1 + generalBowlingBoost);
    }

    if (captainId && player.id === captainId) {
      adjBat *= 1.1;
      adjBowl *= 1.1;
    }

    battingRatings[player.id] = Math.round(adjBat * 10) / 10;
    bowlingRatings[player.id] = Math.round(adjBowl * 10) / 10;
  }

  return { battingRatings, bowlingRatings };
}

export function calculateTeamPerformanceScore(
  players: Player[],
  adjusted: PitchAdjustedRatings
): number {
  const sortedBat = [...players]
    .map((p) => adjusted.battingRatings[p.id] ?? p.battingRating)
    .sort((a, b) => b - a);
  const sortedBowl = [...players]
    .map((p) => adjusted.bowlingRatings[p.id] ?? p.bowlingRating)
    .sort((a, b) => b - a);

  const top7Bat = sortedBat.slice(0, 7).reduce((acc, v) => acc + v, 0);
  const top5Bowl = sortedBowl.slice(0, 5).reduce((acc, v) => acc + v, 0);

  const baseTPS = top7Bat * 0.55 + top5Bowl * 0.45;

  // Team Balance Bonuses
  const hasWk = players.some((p) => p.primaryRole === 'Wicketkeeper' || p.secondaryRole === 'Wicketkeeper');
  const hasSpin = players.some(isSpinner);
  const pacerCount = players.filter(isPacer).length;
  const hasAr = players.some((p) => p.primaryRole === 'Allrounder' || p.secondaryRole === 'Allrounder');

  let balanceBonus = 0;
  if (hasWk) balanceBonus += 0.03;
  if (hasSpin) balanceBonus += 0.03;
  if (pacerCount >= 2) balanceBonus += 0.03;
  else if (pacerCount === 1) balanceBonus += 0.015;
  if (hasAr) balanceBonus += 0.02;

  return baseTPS * (1 + balanceBonus);
}

function distributeBattingRuns(
  batsmen: Player[],
  adjustedBatting: Record<string, number>,
  totalRuns: number,
  wicketsLost: number,
  rng: () => number
): PlayerPerformance[] {
  const result: PlayerPerformance[] = [];
  const activeBatsmenCount = Math.min(batsmen.length, Math.max(5, wicketsLost + 2));
  const activeBatsmen = batsmen.slice(0, activeBatsmenCount);

  // Compute relative weights
  const weights = activeBatsmen.map((b, idx) => {
    const rating = adjustedBatting[b.id] ?? b.battingRating;
    const orderWeight = Math.max(0.2, 1 - idx * 0.12);
    const variance = 0.7 + rng() * 0.6;
    return rating * orderWeight * variance;
  });

  const sumWeights = weights.reduce((acc, w) => acc + w, 0);
  let runsAssigned = 0;

  activeBatsmen.forEach((b, idx) => {
    const proportion = weights[idx] / sumWeights;
    const isLast = idx === activeBatsmen.length - 1;
    let runs = isLast ? Math.max(0, totalRuns - runsAssigned) : Math.round(totalRuns * proportion);
    runsAssigned += runs;

    const sixes = Math.floor(runs / (14 + Math.floor(rng() * 10)));
    const remainingAfterSixes = runs - sixes * 6;
    const fours = Math.floor(remainingAfterSixes / (7 + Math.floor(rng() * 6)));
    const ballsFaced = Math.max(1, Math.round(runs * (0.65 + rng() * 0.35)));

    result.push({
      playerId: b.id,
      playerName: b.name,
      runsScored: runs,
      ballsFaced,
      fours,
      sixes,
    });
  });

  return result;
}

function distributeBowlingWickets(
  bowlers: Player[],
  adjustedBowling: Record<string, number>,
  wicketsToTake: number,
  totalRunsConceded: number,
  rng: () => number
): PlayerPerformance[] {
  const result: PlayerPerformance[] = [];
  const topBowlers = [...bowlers]
    .sort((a, b) => (adjustedBowling[b.id] ?? b.bowlingRating) - (adjustedBowling[a.id] ?? a.bowlingRating))
    .slice(0, 5);

  const weights = topBowlers.map((b) => {
    const rating = adjustedBowling[b.id] ?? b.bowlingRating;
    return Math.pow(rating / 50, 2) * (0.8 + rng() * 0.4);
  });
  const sumWeights = weights.reduce((acc, w) => acc + w, 0);

  let wktsAssigned = 0;
  let runsAssigned = 0;

  topBowlers.forEach((b, idx) => {
    const isLast = idx === topBowlers.length - 1;
    const proportion = weights[idx] / sumWeights;

    let wkts = isLast ? Math.max(0, wicketsToTake - wktsAssigned) : Math.round(wicketsToTake * proportion);
    if (wkts + wktsAssigned > wicketsToTake) {
      wkts = Math.max(0, wicketsToTake - wktsAssigned);
    }
    wktsAssigned += wkts;

    const runsForBowler = isLast
      ? Math.max(10, totalRunsConceded - runsAssigned)
      : Math.round(totalRunsConceded * (0.16 + rng() * 0.08));
    runsAssigned += runsForBowler;

    result.push({
      playerId: b.id,
      playerName: b.name,
      wicketsTaken: wkts,
      oversBowled: 4,
      runsConceded: runsForBowler,
    });
  });

  return result;
}

export function simulateMatch(
  userXI: Player[],
  opponent: OpponentTeam,
  venue: Venue,
  captainId?: string,
  rng: () => number = Math.random
): MatchResult {
  const userAdjusted = calculatePitchAdjustedRatings(userXI, venue, captainId);
  const oppAdjusted = calculatePitchAdjustedRatings(opponent.players, venue, opponent.captain);

  const userTPS = calculateTeamPerformanceScore(userXI, userAdjusted);
  const oppTPS = calculateTeamPerformanceScore(opponent.players, oppAdjusted);

  // Logistic win probability
  const deltaTPS = userTPS - oppTPS;
  const winProbability = Math.max(0.08, Math.min(0.92, 1 / (1 + Math.pow(10, -deltaTPS / 42))));
  const won = rng() < winProbability;

  // Base match scoring range: 130 - 220
  const pitchBattingBonus = venue.modifier.battingBoost ?? 0;
  const basePar = 160 + pitchBattingBonus * 100;

  let userRuns: number;
  let oppRuns: number;
  let userWickets: number;
  let oppWickets: number;
  let margin: string;

  if (won) {
    userRuns = Math.round(basePar + (userTPS - oppTPS) * 0.15 + (rng() * 24 - 10));
    userRuns = Math.max(120, userRuns);

    const winByRuns = rng() > 0.45;
    if (winByRuns) {
      const runDiff = Math.floor(rng() * 28) + 4;
      oppRuns = Math.max(100, userRuns - runDiff);
      userWickets = Math.min(9, Math.floor(rng() * 6) + 2);
      oppWickets = Math.min(10, Math.floor(rng() * 5) + 6);
      margin = `Won by ${runDiff} runs`;
    } else {
      oppRuns = Math.round(basePar + (rng() * 20 - 15));
      oppRuns = Math.max(100, oppRuns);
      userRuns = oppRuns + Math.floor(rng() * 4) + 1;
      userWickets = Math.min(8, Math.floor(rng() * 5) + 2);
      oppWickets = Math.min(9, Math.floor(rng() * 4) + 4);
      const wktsLeft = 10 - userWickets;
      const ballsLeft = Math.floor(rng() * 10) + 1;
      margin = `Won by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''} (${ballsLeft}b left)`;
    }
  } else {
    oppRuns = Math.round(basePar + (oppTPS - userTPS) * 0.15 + (rng() * 24 - 10));
    oppRuns = Math.max(125, oppRuns);

    const lostByRuns = rng() > 0.45;
    if (lostByRuns) {
      const runDiff = Math.floor(rng() * 28) + 4;
      userRuns = Math.max(100, oppRuns - runDiff);
      oppWickets = Math.min(9, Math.floor(rng() * 6) + 2);
      userWickets = Math.min(10, Math.floor(rng() * 5) + 6);
      margin = `Lost by ${runDiff} runs`;
    } else {
      userRuns = Math.round(basePar + (rng() * 20 - 15));
      userRuns = Math.max(100, userRuns);
      oppRuns = userRuns + Math.floor(rng() * 4) + 1;
      oppWickets = Math.min(8, Math.floor(rng() * 5) + 2);
      userWickets = Math.min(9, Math.floor(rng() * 4) + 4);
      const wktsLeft = 10 - oppWickets;
      margin = `Lost by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''}`;
    }
  }

  // Generate Scorecards
  const userBatting = distributeBattingRuns(userXI, userAdjusted.battingRatings, userRuns, userWickets, rng);
  const userBowling = distributeBowlingWickets(userXI, userAdjusted.bowlingRatings, oppWickets, oppRuns, rng);

  const oppBatting = distributeBattingRuns(opponent.players, oppAdjusted.battingRatings, oppRuns, oppWickets, rng);
  const oppBowling = distributeBowlingWickets(opponent.players, oppAdjusted.bowlingRatings, userWickets, userRuns, rng);

  // Combine player performances to identify Top Performers & Player of the Match
  const allPerformances: PlayerPerformance[] = [];

  userBatting.forEach((ub) => {
    const bowl = userBowling.find((b) => b.playerId === ub.playerId);
    allPerformances.push({
      playerId: ub.playerId,
      playerName: ub.playerName,
      runsScored: ub.runsScored,
      ballsFaced: ub.ballsFaced,
      fours: ub.fours,
      sixes: ub.sixes,
      wicketsTaken: bowl?.wicketsTaken ?? 0,
      oversBowled: bowl?.oversBowled ?? 0,
      runsConceded: bowl?.runsConceded ?? 0,
      isCaptain: ub.playerId === captainId,
    });
  });

  oppBatting.forEach((ob) => {
    const bowl = oppBowling.find((b) => b.playerId === ob.playerId);
    allPerformances.push({
      playerId: ob.playerId,
      playerName: ob.playerName,
      runsScored: ob.runsScored,
      ballsFaced: ob.ballsFaced,
      fours: ob.fours,
      sixes: ob.sixes,
      wicketsTaken: bowl?.wicketsTaken ?? 0,
      oversBowled: bowl?.oversBowled ?? 0,
      runsConceded: bowl?.runsConceded ?? 0,
      isCaptain: ob.playerId === opponent.captain,
    });
  });

  // Calculate Fantasy Impact: runs + 25 * wickets
  const rankedPerformances = [...allPerformances].sort((a, b) => {
    const scoreA = (a.runsScored ?? 0) + (a.wicketsTaken ?? 0) * 25;
    const scoreB = (b.runsScored ?? 0) + (b.wicketsTaken ?? 0) * 25;
    return scoreB - scoreA;
  });

  const potm = rankedPerformances[0];
  const topPerformers = rankedPerformances.slice(0, 4);

  return {
    won,
    userScore: {
      runs: userRuns,
      wickets: userWickets,
      overs: 20.0,
    },
    opponentScore: {
      runs: oppRuns,
      wickets: oppWickets,
      overs: 20.0,
    },
    margin,
    playerOfTheMatch: potm,
    topPerformers,
    userScorecard: userBatting,
    opponentScorecard: oppBatting,
  };
}
