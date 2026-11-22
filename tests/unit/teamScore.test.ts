import { describe, it, expect } from 'vitest';
import { calculateUniversalTeamScore } from '../../src/engine/teamScore';
import { getUniversalLeaderboard, saveToUniversalLeaderboard } from '../../src/utils/storage';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Universal Team Score & Leaderboard Engine', () => {
  const allPlayers = playersData as unknown as Player[];

  // Curate a balanced Playing XI
  const opener1 = allPlayers.find((p) => p.name === 'Rohit Sharma') || allPlayers[0];
  const opener2 = allPlayers.find((p) => p.name === 'Sachin Tendulkar') || allPlayers[1];
  const no3 = allPlayers.find((p) => p.name === 'Virat Kohli') || allPlayers[2];
  const no4 = allPlayers.find((p) => p.name === 'AB de Villiers') || allPlayers[3];
  const no5 = allPlayers.find((p) => p.name === 'Yuvraj Singh') || allPlayers[4];
  const wk = allPlayers.find((p) => p.name === 'MS Dhoni') || allPlayers[5];
  const ar = allPlayers.find((p) => p.name === 'Ravindra Jadeja') || allPlayers[6];
  const spinner = allPlayers.find((p) => p.name === 'Ravichandran Ashwin') || allPlayers[7];
  const pacer1 = allPlayers.find((p) => p.name === 'Jasprit Bumrah') || allPlayers[8];
  const pacer2 = allPlayers.find((p) => p.name === 'Zaheer Khan') || allPlayers[9];
  const pacer3 = allPlayers.find((p) => p.name === 'Mohammed Shami') || allPlayers[10];

  const balancedXI: Player[] = [
    opener1, opener2, no3, no4, no5, wk, ar, spinner, pacer1, pacer2, pacer3,
  ];

  it('calculates high rating and S/S+ grade for an authentic balanced Playing XI', () => {
    const score = calculateUniversalTeamScore(balancedXI, wk.id);

    expect(score.totalScore).toBeGreaterThanOrEqual(850);
    expect(['S', 'S+']).toContain(score.grade);
    expect(score.battingIndex).toBeGreaterThanOrEqual(80);
    expect(score.bowlingIndex).toBeGreaterThanOrEqual(80);
    expect(score.balanceIndex).toBeGreaterThanOrEqual(85);
    expect(score.strengths.length).toBeGreaterThan(0);
    expect(score.strengths.some((s) => s.includes('Frontline Bowling'))).toBe(true);
  });

  it('detects vulnerabilities and penalizes an unbalanced team with no wicketkeeper or spinner', () => {
    // 11 pure pacers with no WK or spinner
    const pacersOnly = allPlayers.filter((p) => p.primaryRole === 'Pacer').slice(0, 11);
    const score = calculateUniversalTeamScore(pacersOnly);

    expect(score.vulnerabilities.some((v) => v.includes('No Specialist Wicketkeeper'))).toBe(true);
    expect(score.vulnerabilities.some((v) => v.includes('No Specialist Spinner'))).toBe(true);
    expect(score.balanceIndex).toBeLessThan(80);
  });

  it('awards bonus points for real-life chemistry synergies and anomaly cards', () => {
    // Team with Kohli + ABD (synergy) and Kohli 2016 (anomaly)
    const score = calculateUniversalTeamScore(balancedXI, wk.id);

    expect(score.synergyPoints).toBeGreaterThan(0);
    expect(score.strengths.some((s) => s.includes('Active Real-Life Chemistry Synergies'))).toBe(true);
  });

  it('maintains universal scoreboard rankings with benchmarks and user entries', () => {
    const initialLeaderboard = getUniversalLeaderboard();
    expect(initialLeaderboard.length).toBeGreaterThanOrEqual(4);
    expect(initialLeaderboard.some((b) => b.teamName.includes('2003 Invincible Australia'))).toBe(true);

    const saved = saveToUniversalLeaderboard({
      teamName: 'User Test XI',
      mode: 'International',
      totalScore: 960,
      grade: 'S+',
      matchesWon: 7,
      totalMatches: 7,
      captainName: 'MS Dhoni',
      date: '2026-11-23',
      synergiesCount: 3,
      isInvincible: true,
    });

    expect(saved.id).toBeDefined();

    const updatedLeaderboard = getUniversalLeaderboard();
    expect(updatedLeaderboard[0].totalScore).toBeGreaterThanOrEqual(955);
  });
});
