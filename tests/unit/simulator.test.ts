import { describe, it, expect } from 'vitest';
import {
  simulateMatch,
  calculatePitchAdjustedRatings,
  isSpinner,
  isPacer,
  getMatchOpponentAndVenue,
} from '../../src/engine/simulator';
import { OPPONENTS, IPL_OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Tactical Match Simulation Engine', () => {
  const sampleUserXI: Player[] = playersData.slice(0, 11) as Player[];
  const dustbowlVenue = VENUES.find((v) => v.pitchType === 'Dustbowl')!;
  const greenSeamerVenue = VENUES.find((v) => v.pitchType === 'GreenSeamer')!;
  const balancedVenue = VENUES.find((v) => v.id === 'the_oval')!;

  it('boosts spinners on dustbowls and pacers on green seamers', () => {
    const dustbowlAdj = calculatePitchAdjustedRatings(sampleUserXI, dustbowlVenue);
    const seamerAdj = calculatePitchAdjustedRatings(sampleUserXI, greenSeamerVenue);

    const spinner = sampleUserXI.find((p) => p.primaryRole === 'Spinner')!;
    const pacer = sampleUserXI.find((p) => p.primaryRole === 'Pacer')!;

    if (spinner) {
      expect(dustbowlAdj.bowlingRatings[spinner.id]).toBeGreaterThan(seamerAdj.bowlingRatings[spinner.id]);
    }
    if (pacer) {
      expect(seamerAdj.bowlingRatings[pacer.id]).toBeGreaterThan(dustbowlAdj.bowlingRatings[pacer.id]);
    }
  });

  it('produces complete match results with scorecards and realistic totals', () => {
    const opp = OPPONENTS[0];
    const result = simulateMatch(sampleUserXI, opp, dustbowlVenue, sampleUserXI[0].id);

    expect(typeof result.won).toBe('boolean');
    expect(result.userScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.userScore.wickets).toBeLessThanOrEqual(10);
    expect(result.opponentScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.topPerformers.length).toBeGreaterThanOrEqual(1);
    expect(result.playerOfTheMatch).toBeDefined();
    expect(typeof result.margin).toBe('string');
  });

  it('applies +10% captain boost to opponent captain matched by name', () => {
    const opp = OPPONENTS[0]; // 1996 Sri Lanka, captain: "Arjuna Ranatunga"
    const captainPlayer = opp.players.find((p) => p.name === opp.captain)!;
    const withoutCaptain = calculatePitchAdjustedRatings(opp.players, balancedVenue);
    const withCaptain = calculatePitchAdjustedRatings(opp.players, balancedVenue, opp.captain);

    expect(withCaptain.battingRatings[captainPlayer.id]).toBeCloseTo(
      Math.round(withoutCaptain.battingRatings[captainPlayer.id] * 1.1 * 10) / 10,
      1
    );
    expect(withCaptain.bowlingRatings[captainPlayer.id]).toBeCloseTo(
      Math.round(withoutCaptain.bowlingRatings[captainPlayer.id] * 1.1 * 10) / 10,
      1
    );
  });

  it('requires bowlingRating >= 60 for non-primary spinners and pacers', () => {
    const allPlayers = playersData as Player[];
    const kohli = allPlayers.find((p) => p.name === 'Virat Kohli')!;
    const dravid = allPlayers.find((p) => p.name === 'Rahul Dravid')!;
    const ashwin = allPlayers.find((p) => p.name === 'Ravichandran Ashwin')!;
    const bumrah = allPlayers.find((p) => p.name === 'Jasprit Bumrah')!;
    const jadeja = allPlayers.find((p) => p.name === 'Ravindra Jadeja')!;

    expect(isPacer(kohli)).toBe(false);
    expect(isSpinner(kohli)).toBe(false);
    expect(isSpinner(dravid)).toBe(false);
    expect(isPacer(dravid)).toBe(false);

    expect(isSpinner(ashwin)).toBe(true);
    expect(isPacer(bumrah)).toBe(true);
    expect(isSpinner(jadeja)).toBe(true);
  });

  it('resolves home venue from opponent.venueId via getMatchOpponentAndVenue', () => {
    const { opponent, venue } = getMatchOpponentAndVenue(1, IPL_OPPONENTS);
    expect(opponent.name).toContain('Chennai Super Kings');
    expect(venue.id).toBe('chepauk');
    expect(venue.name).toContain('Chepauk');
  });

  it('aligns chasing overs, margins, ballsFaced <= 120, batting sums, and bowling figures', () => {
    const opp = IPL_OPPONENTS[1];
    const chepauk = VENUES.find((v) => v.id === 'chepauk')!;

    // Force a win while chasing (rng = 0.05 < winProbability)
    const chaseWin = simulateMatch(sampleUserXI, opp, chepauk, sampleUserXI[0].id, () => 0.05, false);
    expect(chaseWin.userBatsFirst).toBe(false);
    expect(chaseWin.won).toBe(true);
    expect(chaseWin.userScore.overs).toBeLessThanOrEqual(20);
    expect(chaseWin.userScore.overs).toBeLessThan(20);
    expect(chaseWin.margin).toMatch(/Won by \d+ wicket/i);
    expect(chaseWin.userScore.runs).toBeGreaterThan(chaseWin.opponentScore.runs);
    expect(chaseWin.userBowling).toBeDefined();
    expect(chaseWin.opponentBowling).toBeDefined();
    expect(chaseWin.userBowling!.length).toBeGreaterThan(0);
    expect(chaseWin.opponentBowling!.length).toBeGreaterThan(0);

    const userBatSum = chaseWin.userScorecard!.reduce((sum, p) => sum + (p.runsScored ?? 0), 0);
    const userBallsSum = chaseWin.userScorecard!.reduce((sum, p) => sum + (p.ballsFaced ?? 0), 0);
    expect(userBatSum).toBe(chaseWin.userScore.runs);
    expect(userBallsSum).toBeLessThanOrEqual(120);

    const oppBatSum = chaseWin.opponentScorecard!.reduce((sum, p) => sum + (p.runsScored ?? 0), 0);
    const oppBallsSum = chaseWin.opponentScorecard!.reduce((sum, p) => sum + (p.ballsFaced ?? 0), 0);
    expect(oppBatSum).toBe(chaseWin.opponentScore.runs);
    expect(oppBallsSum).toBeLessThanOrEqual(120);

    // Force a loss while chasing (rng = 0.99 > winProbability)
    const chaseLoss = simulateMatch(sampleUserXI, opp, chepauk, sampleUserXI[0].id, () => 0.99, false);
    expect(chaseLoss.won).toBe(false);
    expect(chaseLoss.userScore.overs).toBeLessThanOrEqual(20);
    expect(chaseLoss.margin).toMatch(/Lost by \d+ run/i);
    expect(chaseLoss.opponentScore.runs).toBeGreaterThan(chaseLoss.userScore.runs);

    const lossUserBatSum = chaseLoss.userScorecard!.reduce((sum, p) => sum + (p.runsScored ?? 0), 0);
    const lossUserBallsSum = chaseLoss.userScorecard!.reduce((sum, p) => sum + (p.ballsFaced ?? 0), 0);
    expect(lossUserBatSum).toBe(chaseLoss.userScore.runs);
    expect(lossUserBallsSum).toBeLessThanOrEqual(120);

    const oversToBalls = (overs: number) =>
      Math.floor(overs) * 6 + Math.round((overs - Math.floor(overs)) * 10);

    // Early chase win: opponent bowling overs and runsConceded match user's chasing innings
    const chaseWinOppBowlBalls = chaseWin.opponentBowling!.reduce(
      (sum, b) => sum + oversToBalls(b.oversBowled ?? 0),
      0
    );
    const chaseWinOppBowlRuns = chaseWin.opponentBowling!.reduce(
      (sum, b) => sum + (b.runsConceded ?? 0),
      0
    );
    expect(chaseWinOppBowlBalls).toBe(oversToBalls(chaseWin.userScore.overs));
    expect(chaseWinOppBowlBalls).toBeLessThan(120);
    expect(chaseWinOppBowlRuns).toBe(chaseWin.userScore.runs);
    for (const b of chaseWin.opponentBowling!) {
      expect(oversToBalls(b.oversBowled ?? 0)).toBeLessThanOrEqual(24);
    }

    const chaseWinUserBowlBalls = chaseWin.userBowling!.reduce(
      (sum, b) => sum + oversToBalls(b.oversBowled ?? 0),
      0
    );
    const chaseWinUserBowlRuns = chaseWin.userBowling!.reduce(
      (sum, b) => sum + (b.runsConceded ?? 0),
      0
    );
    expect(chaseWinUserBowlBalls).toBe(oversToBalls(chaseWin.opponentScore.overs));
    expect(chaseWinUserBowlRuns).toBe(chaseWin.opponentScore.runs);

    // Full 20-over chase loss: both bowling cards sum to 120 balls and exact innings totals
    expect(
      chaseLoss.opponentBowling!.reduce((sum, b) => sum + oversToBalls(b.oversBowled ?? 0), 0)
    ).toBe(oversToBalls(chaseLoss.userScore.overs));
    expect(
      chaseLoss.opponentBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(chaseLoss.userScore.runs);
    expect(
      chaseLoss.userBowling!.reduce((sum, b) => sum + oversToBalls(b.oversBowled ?? 0), 0)
    ).toBe(oversToBalls(chaseLoss.opponentScore.overs));
    expect(
      chaseLoss.userBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(chaseLoss.opponentScore.runs);

    // Opponent early chase win (user batted first and lost): user bowling overs match opponent overs
    const defendLoss = simulateMatch(sampleUserXI, opp, chepauk, sampleUserXI[0].id, () => 0.99, true);
    expect(defendLoss.won).toBe(false);
    expect(defendLoss.opponentScore.overs).toBeLessThan(20);
    expect(
      defendLoss.userBowling!.reduce((sum, b) => sum + oversToBalls(b.oversBowled ?? 0), 0)
    ).toBe(oversToBalls(defendLoss.opponentScore.overs));
    expect(
      defendLoss.userBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(defendLoss.opponentScore.runs);
    expect(
      defendLoss.opponentBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(defendLoss.userScore.runs);

    // Defending win (userBatsFirst = true, won = true): full 20-over bowling and batting conservation
    const defendWin = simulateMatch(sampleUserXI, opp, chepauk, sampleUserXI[0].id, () => 0.05, true);
    expect(defendWin.won).toBe(true);
    expect(defendWin.userBatsFirst).toBe(true);
    expect(defendWin.userScore.overs).toBe(20);
    expect(defendWin.opponentScore.overs).toBe(20);
    expect(
      defendWin.userScorecard!.reduce((sum, p) => sum + (p.runsScored ?? 0), 0)
    ).toBe(defendWin.userScore.runs);
    expect(
      defendWin.userScorecard!.reduce((sum, p) => sum + (p.ballsFaced ?? 0), 0)
    ).toBeLessThanOrEqual(120);
    expect(
      defendWin.userBowling!.reduce((sum, b) => sum + oversToBalls(b.oversBowled ?? 0), 0)
    ).toBe(120);
    expect(
      defendWin.userBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(defendWin.opponentScore.runs);
    expect(
      defendWin.userBowling!.reduce((sum, b) => sum + (b.wicketsTaken ?? 0), 0)
    ).toBe(defendWin.opponentScore.wickets);
    for (const b of defendWin.userBowling!) {
      expect(oversToBalls(b.oversBowled ?? 0)).toBeLessThanOrEqual(24);
    }
    expect(
      defendWin.opponentBowling!.reduce((sum, b) => sum + oversToBalls(b.oversBowled ?? 0), 0)
    ).toBe(120);
    expect(
      defendWin.opponentBowling!.reduce((sum, b) => sum + (b.runsConceded ?? 0), 0)
    ).toBe(defendWin.userScore.runs);
    expect(
      defendWin.opponentBowling!.reduce((sum, b) => sum + (b.wicketsTaken ?? 0), 0)
    ).toBe(defendWin.userScore.wickets);
    for (const b of defendWin.opponentBowling!) {
      expect(oversToBalls(b.oversBowled ?? 0)).toBeLessThanOrEqual(24);
    }
  });

  it('includes non-batting frontline bowler at #11 in topPerformers and playerOfTheMatch', () => {
    const allPlayers = playersData as Player[];
    const lowBowlingBatters = allPlayers
      .filter((p) => p.id !== 'jasprit-bumrah' && p.bowlingRating <= 25)
      .slice(0, 10);
    const bumrah = allPlayers.find((p) => p.id === 'jasprit-bumrah')!;
    const xiWithTailPacer: Player[] = [...lowBowlingBatters, bumrah];

    const result = simulateMatch(
      xiWithTailPacer,
      OPPONENTS[0],
      balancedVenue,
      bumrah.id,
      () => 0.05,
      true
    );

    expect(result.won).toBe(true);
    expect(result.userScore.wickets).toBeLessThanOrEqual(3);
    expect(result.userScorecard!.some((p) => p.playerId === bumrah.id)).toBe(false);

    const bumrahBowling = result.userBowling!.find((b) => b.playerId === bumrah.id);
    expect(bumrahBowling).toBeDefined();
    expect(bumrahBowling!.wicketsTaken).toBeGreaterThanOrEqual(4);

    const inTopPerformers = result.topPerformers.find((p) => p.playerId === bumrah.id);
    expect(inTopPerformers).toBeDefined();
    expect(result.playerOfTheMatch?.playerId).toBe(bumrah.id);
    expect(result.playerOfTheMatch).toMatchObject({
      playerId: bumrah.id,
      playerName: bumrah.name,
      runsScored: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      wicketsTaken: bumrahBowling!.wicketsTaken,
      oversBowled: bumrahBowling!.oversBowled,
      runsConceded: bumrahBowling!.runsConceded,
      isCaptain: true,
    });
  });
});
