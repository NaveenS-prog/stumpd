import { Player } from '../types/player';
import {
  Venue,
  OpponentTeam,
  MatchResult,
  PitchAdjustedRatings,
  PlayerPerformance,
} from '../types/tournament';
import { getActiveSynergies } from '../data/synergies';
import { VENUES } from '../data/venues';

export function isSpinner(player: Player): boolean {
  if (player.primaryRole === 'Spinner') return true;
  if (player.bowlingRating < 60) return false;
  const bType = player.bowlingType || '';
  return (
    bType.includes('Spin') ||
    bType.includes('Break') ||
    bType.includes('Orthodox') ||
    bType.includes('Unorthodox') ||
    bType.includes('Chinaman')
  );
}

export function isPacer(player: Player): boolean {
  if (player.primaryRole === 'Pacer') return true;
  if (player.bowlingRating < 60) return false;
  const bType = player.bowlingType || '';
  return (
    bType.includes('Fast') ||
    bType.includes('Medium') ||
    bType.includes('Seam')
  );
}

export function getMatchOpponentAndVenue(
  matchIndex: number,
  opponents: OpponentTeam[]
): { opponent: OpponentTeam; venue: Venue } {
  const opponent = opponents[matchIndex] || opponents[0];
  const venue =
    VENUES.find((v) => v.id === opponent?.venueId) ||
    VENUES[Math.abs(matchIndex) % VENUES.length] ||
    VENUES[0];
  return { opponent, venue };
}

export function calculatePitchAdjustedRatings(
  players: Player[],
  venue: Venue,
  captainId?: string,
  isChasing?: boolean
): PitchAdjustedRatings {
  const battingRatings: Record<string, number> = {};
  const bowlingRatings: Record<string, number> = {};

  const battingBoost = venue.modifier.battingBoost ?? 0;
  const spinBoost = venue.modifier.spinBoost ?? 0;
  const pacerBoost = venue.modifier.pacerBoost ?? 0;
  const generalBowlingBoost = venue.modifier.bowlingBoost ?? 0;

  const activeSynergies = getActiveSynergies(players);

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

    if (captainId && (player.id === captainId || player.name === captainId)) {
      adjBat *= 1.1;
      adjBowl *= 1.1;
    }

    // Apply Active Synergy Multipliers
    for (const synergy of activeSynergies) {
      if (synergy.playerIds.includes(player.id)) {
        if (synergy.battingBoost) {
          adjBat *= (1 + synergy.battingBoost);
        }
        if (synergy.bowlingBoost) {
          adjBowl *= (1 + synergy.bowlingBoost);
        }
      }
    }

    // Apply Signature Player Trait Multipliers
    if (player.trait) {
      const trait = player.trait;
      let isTriggered = false;

      switch (trait.trigger) {
        case 'General':
        case 'Powerplay':
        case 'DeathOvers':
          isTriggered = true;
          break;
        case 'Chasing':
          isTriggered = isChasing !== false;
          break;
        case 'SpinPitch':
          isTriggered = venue.pitchType === 'Dustbowl' || spinBoost > 0;
          break;
        case 'PacePitch':
          isTriggered =
            venue.pitchType === 'GreenSeamer' ||
            venue.pitchType === 'ExpressBouncy' ||
            pacerBoost > 0;
          break;
      }

      if (isTriggered) {
        if (trait.battingBoost) {
          adjBat *= (1 + trait.battingBoost);
        }
        if (trait.bowlingBoost) {
          adjBowl *= (1 + trait.bowlingBoost);
        }
      }
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
  const hasWk = players.some((p) => p.primaryRole === 'Wicketkeeper' || (Boolean(p.secondaryRoles) && p.secondaryRoles!.includes('Wicketkeeper')));
  const hasSpin = players.some(isSpinner);
  const pacerCount = players.filter(isPacer).length;
  const hasAr = players.some((p) => p.primaryRole === 'Allrounder' || (Boolean(p.secondaryRoles) && p.secondaryRoles!.includes('Allrounder')));

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
  rng: () => number,
  maxBalls: number = 120
): PlayerPerformance[] {
  const result: PlayerPerformance[] = [];
  const activeBatsmenCount = Math.min(batsmen.length, Math.max(5, wicketsLost + 2));
  const activeBatsmen = batsmen.slice(0, activeBatsmenCount);
  if (activeBatsmen.length === 0) return result;

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
    const proportion = sumWeights > 0 ? weights[idx] / sumWeights : 1 / activeBatsmen.length;
    const isLast = idx === activeBatsmen.length - 1;
    const remainingRuns = Math.max(0, totalRuns - runsAssigned);
    const runs = isLast
      ? remainingRuns
      : Math.min(remainingRuns, Math.round(totalRuns * proportion));
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

  const totalBalls = result.reduce((acc, entry) => acc + (entry.ballsFaced ?? 0), 0);
  if (totalBalls > maxBalls) {
    const scale = maxBalls / totalBalls;
    for (const entry of result) {
      entry.ballsFaced = Math.max(1, Math.round((entry.ballsFaced ?? 1) * scale));
    }
    let adjustedBalls = result.reduce((acc, entry) => acc + (entry.ballsFaced ?? 0), 0);
    while (adjustedBalls > maxBalls) {
      const topEntry = result.reduce((best, curr) =>
        (curr.ballsFaced ?? 0) > (best.ballsFaced ?? 0) ? curr : best
      );
      if ((topEntry.ballsFaced ?? 0) <= 1) break;
      topEntry.ballsFaced = (topEntry.ballsFaced ?? 1) - 1;
      adjustedBalls--;
    }
  }

  return result;
}

function ballsToOvers(balls: number): number {
  const clamped = Math.max(0, balls);
  return Math.floor(clamped / 6) + (clamped % 6) / 10;
}

function distributeBowlingBalls(bowlerCount: number, totalBalls: number): number[] {
  if (bowlerCount <= 0) return [];
  const ballsPerBowler = new Array<number>(bowlerCount).fill(0);
  const cappedBalls = Math.max(0, Math.min(totalBalls, bowlerCount * 24));
  let remainingCompleteOvers = Math.floor(cappedBalls / 6);
  const partialBalls = cappedBalls % 6;

  const baseOvers = Math.min(4, Math.floor(remainingCompleteOvers / bowlerCount));
  for (let i = 0; i < bowlerCount; i++) {
    ballsPerBowler[i] = baseOvers * 6;
    remainingCompleteOvers -= baseOvers;
  }
  for (let i = 0; i < bowlerCount && remainingCompleteOvers > 0; i++) {
    const capacityOvers = 4 - ballsPerBowler[i] / 6;
    const addOvers = Math.min(capacityOvers, remainingCompleteOvers);
    ballsPerBowler[i] += addOvers * 6;
    remainingCompleteOvers -= addOvers;
  }

  if (partialBalls > 0) {
    let assignedPartial = false;
    for (let i = bowlerCount - 1; i >= 0; i--) {
      if (ballsPerBowler[i] <= 24 - partialBalls) {
        ballsPerBowler[i] += partialBalls;
        assignedPartial = true;
        break;
      }
    }
    if (!assignedPartial) {
      let remaining = partialBalls;
      for (let i = bowlerCount - 1; i >= 0 && remaining > 0; i--) {
        const room = 24 - ballsPerBowler[i];
        const add = Math.min(room, remaining);
        ballsPerBowler[i] += add;
        remaining -= add;
      }
    }
  }

  return ballsPerBowler;
}

function distributeBowlingWickets(
  bowlers: Player[],
  adjustedBowling: Record<string, number>,
  wicketsToTake: number,
  totalRunsConceded: number,
  rng: () => number,
  totalBalls: number = 120
): PlayerPerformance[] {
  const result: PlayerPerformance[] = [];
  const topBowlers = [...bowlers]
    .sort((a, b) => (adjustedBowling[b.id] ?? b.bowlingRating) - (adjustedBowling[a.id] ?? a.bowlingRating))
    .slice(0, 5);
  if (topBowlers.length === 0) return result;

  const ballsPerBowler = distributeBowlingBalls(topBowlers.length, totalBalls);

  const weights = topBowlers.map((b) => {
    const rating = adjustedBowling[b.id] ?? b.bowlingRating;
    return Math.pow(rating / 50, 2) * (0.8 + rng() * 0.4);
  });
  const sumWeights = weights.reduce((acc, w) => acc + w, 0);

  let wktsAssigned = 0;
  let runsAssigned = 0;

  topBowlers.forEach((b, idx) => {
    const isLast = idx === topBowlers.length - 1;
    const proportion = sumWeights > 0 ? weights[idx] / sumWeights : 1 / topBowlers.length;

    const remainingWkts = Math.max(0, wicketsToTake - wktsAssigned);
    const wkts = isLast
      ? remainingWkts
      : Math.min(remainingWkts, Math.round(wicketsToTake * proportion));
    wktsAssigned += wkts;

    const bowlerBalls = ballsPerBowler[idx];
    const ballShare = totalBalls > 0 ? bowlerBalls / totalBalls : 1 / topBowlers.length;
    const remainingRuns = Math.max(0, totalRunsConceded - runsAssigned);
    const rawRuns = Math.round(totalRunsConceded * ballShare * (0.8 + rng() * 0.4));
    const runsForBowler = isLast ? remainingRuns : Math.min(remainingRuns, rawRuns);
    runsAssigned += runsForBowler;

    result.push({
      playerId: b.id,
      playerName: b.name,
      wicketsTaken: wkts,
      oversBowled: ballsToOvers(bowlerBalls),
      runsConceded: runsForBowler,
    });
  });

  return result;
}

function ballsLeftToOvers(ballsLeft: number): number {
  return ballsToOvers(Math.max(1, Math.min(120, 120 - ballsLeft)));
}

function isCaptainMatch(
  playerId: string,
  playerName: string,
  captainIdentifier?: string
): boolean {
  return (
    Boolean(captainIdentifier) &&
    (playerId === captainIdentifier || playerName === captainIdentifier)
  );
}

function combineTeamPerformances(
  batting: PlayerPerformance[],
  bowling: PlayerPerformance[],
  captainIdentifier?: string
): PlayerPerformance[] {
  const battedIds = new Set(batting.map((bat) => bat.playerId));
  const combined: PlayerPerformance[] = batting.map((bat) => {
    const bowl = bowling.find((b) => b.playerId === bat.playerId);
    return {
      playerId: bat.playerId,
      playerName: bat.playerName,
      runsScored: bat.runsScored,
      ballsFaced: bat.ballsFaced,
      fours: bat.fours,
      sixes: bat.sixes,
      wicketsTaken: bowl?.wicketsTaken ?? 0,
      oversBowled: bowl?.oversBowled ?? 0,
      runsConceded: bowl?.runsConceded ?? 0,
      isCaptain: isCaptainMatch(bat.playerId, bat.playerName, captainIdentifier),
    };
  });

  for (const bowl of bowling) {
    if (battedIds.has(bowl.playerId)) continue;
    combined.push({
      playerId: bowl.playerId,
      playerName: bowl.playerName,
      runsScored: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wicketsTaken: bowl.wicketsTaken ?? 0,
      oversBowled: bowl.oversBowled ?? 0,
      runsConceded: bowl.runsConceded ?? 0,
      isCaptain: isCaptainMatch(bowl.playerId, bowl.playerName, captainIdentifier),
    });
  }

  return combined;
}

export function simulateMatch(
  userXI: Player[],
  opponent: OpponentTeam,
  venue: Venue,
  captainId?: string,
  rng: () => number = Math.random,
  userBatsFirst?: boolean
): MatchResult {
  const batsFirst = userBatsFirst ?? rng() < 0.5;
  const userAdjusted = calculatePitchAdjustedRatings(userXI, venue, captainId, !batsFirst);
  const oppAdjusted = calculatePitchAdjustedRatings(
    opponent.players,
    venue,
    opponent.captain,
    batsFirst
  );

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
  let userOvers = 20.0;
  let oppOvers = 20.0;
  let userMaxBalls = 120;
  let oppMaxBalls = 120;
  let margin: string;

  if (won && batsFirst) {
    // User batted first and defended total
    userRuns = Math.round(basePar + (userTPS - oppTPS) * 0.15 + (rng() * 24 - 10));
    userRuns = Math.max(120, userRuns);
    const runDiff = Math.floor(rng() * 28) + 4;
    oppRuns = Math.max(100, userRuns - runDiff);
    const actualDiff = userRuns - oppRuns;
    userWickets = Math.min(9, Math.floor(rng() * 6) + 2);
    oppWickets = Math.min(10, Math.floor(rng() * 5) + 6);
    margin = `Won by ${actualDiff} run${actualDiff > 1 ? 's' : ''}`;
  } else if (won && !batsFirst) {
    // User chased target and won
    oppRuns = Math.round(basePar + (rng() * 20 - 15));
    oppRuns = Math.max(100, oppRuns);
    userRuns = oppRuns + Math.floor(rng() * 4) + 1;
    userWickets = Math.min(8, Math.floor(rng() * 5) + 2);
    oppWickets = Math.min(9, Math.floor(rng() * 4) + 4);
    const wktsLeft = 10 - userWickets;
    const ballsLeft = Math.floor(rng() * 10) + 1;
    userMaxBalls = 120 - ballsLeft;
    userOvers = ballsLeftToOvers(ballsLeft);
    margin = `Won by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''} (${ballsLeft}b left)`;
  } else if (!won && batsFirst) {
    // User batted first and opponent chased down target
    userRuns = Math.round(basePar + (rng() * 20 - 15));
    userRuns = Math.max(100, userRuns);
    oppRuns = userRuns + Math.floor(rng() * 4) + 1;
    oppWickets = Math.min(8, Math.floor(rng() * 5) + 2);
    userWickets = Math.min(9, Math.floor(rng() * 4) + 4);
    const wktsLeft = 10 - oppWickets;
    const ballsLeft = Math.floor(rng() * 10) + 1;
    oppMaxBalls = 120 - ballsLeft;
    oppOvers = ballsLeftToOvers(ballsLeft);
    margin = `Lost by ${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''} (${ballsLeft}b left)`;
  } else {
    // User chased target and fell short
    oppRuns = Math.round(basePar + (oppTPS - userTPS) * 0.15 + (rng() * 24 - 10));
    oppRuns = Math.max(125, oppRuns);
    const runDiff = Math.floor(rng() * 28) + 4;
    userRuns = Math.max(100, oppRuns - runDiff);
    const actualDiff = oppRuns - userRuns;
    oppWickets = Math.min(9, Math.floor(rng() * 6) + 2);
    userWickets = Math.min(10, Math.floor(rng() * 5) + 6);
    margin = `Lost by ${actualDiff} run${actualDiff > 1 ? 's' : ''}`;
  }

  // Generate Scorecards
  const userBatting = distributeBattingRuns(
    userXI,
    userAdjusted.battingRatings,
    userRuns,
    userWickets,
    rng,
    userMaxBalls
  );
  const userBowling = distributeBowlingWickets(
    userXI,
    userAdjusted.bowlingRatings,
    oppWickets,
    oppRuns,
    rng,
    oppMaxBalls
  );

  const oppBatting = distributeBattingRuns(
    opponent.players,
    oppAdjusted.battingRatings,
    oppRuns,
    oppWickets,
    rng,
    oppMaxBalls
  );
  const oppBowling = distributeBowlingWickets(
    opponent.players,
    oppAdjusted.bowlingRatings,
    userWickets,
    userRuns,
    rng,
    userMaxBalls
  );

  // Combine player performances to identify Top Performers & Player of the Match
  const allPerformances: PlayerPerformance[] = [
    ...combineTeamPerformances(userBatting, userBowling, captainId),
    ...combineTeamPerformances(oppBatting, oppBowling, opponent.captain),
  ];

  // Calculate Fantasy Impact: runs + 25 * wickets
  const rankedPerformances = [...allPerformances].sort((a, b) => {
    const scoreA = (a.runsScored ?? 0) + (a.wicketsTaken ?? 0) * 25;
    const scoreB = (b.runsScored ?? 0) + (b.wicketsTaken ?? 0) * 25;
    return scoreB - scoreA;
  });

  const potm = rankedPerformances[0];
  const topPerformers = rankedPerformances.slice(0, 4);

  const activeSynergies = getActiveSynergies(userXI);
  const activeSynergyNames = activeSynergies.map((s) => s.name);
  const activeTraitHighlights = userXI
    .filter((p) => Boolean(p.trait))
    .map((p) => `${p.name}: ${p.trait!.name} (${p.trait!.description})`);

  return {
    won,
    userScore: {
      runs: userRuns,
      wickets: userWickets,
      overs: userOvers,
    },
    opponentScore: {
      runs: oppRuns,
      wickets: oppWickets,
      overs: oppOvers,
    },
    margin,
    playerOfTheMatch: potm,
    topPerformers,
    userScorecard: userBatting,
    opponentScorecard: oppBatting,
    userBowling,
    opponentBowling: oppBowling,
    userBatsFirst: batsFirst,
    activeSynergyNames,
    activeTraitHighlights,
  };
}
