import { Player } from '../types/player';
import { getActiveSynergies } from '../data/synergies';
import { isSpinner, isPacer } from './simulator';

export interface TeamScoreBreakdown {
  totalScore: number;          // 0 - 1000
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  battingIndex: number;        // 0 - 100
  bowlingIndex: number;        // 0 - 100
  balanceIndex: number;        // 0 - 100
  synergyPoints: number;       // Bonus points from partnerships
  anomalyPoints: number;       // Bonus points from single-season anomalies
  strengths: string[];
  vulnerabilities: string[];
}

export function calculateUniversalTeamScore(
  picks: Player[],
  captainId?: string | null
): TeamScoreBreakdown {
  if (picks.length === 0) {
    return {
      totalScore: 0,
      grade: 'D',
      battingIndex: 0,
      bowlingIndex: 0,
      balanceIndex: 0,
      synergyPoints: 0,
      anomalyPoints: 0,
      strengths: [],
      vulnerabilities: ['No players drafted yet'],
    };
  }

  const strengths: string[] = [];
  const vulnerabilities: string[] = [];

  // ==========================================
  // 1. BATTING POWER (Top 6 + Tail Depth)
  // ==========================================
  const sortedBat = [...picks].sort((a, b) => b.battingRating - a.battingRating);
  const top6Bat = sortedBat.slice(0, 6);
  const avgTop6 = top6Bat.reduce((acc, p) => acc + p.battingRating, 0) / top6Bat.length;

  // Tailwag check: Batting quality of #7 and #8
  const tailEnd = picks.slice(6, 8);
  const avgTail = tailEnd.length > 0 ? tailEnd.reduce((acc, p) => acc + p.battingRating, 0) / tailEnd.length : 40;

  const rawBatIndex = avgTop6 * 0.8 + avgTail * 0.2;
  const battingIndex = Math.min(100, Math.round(rawBatIndex));

  if (avgTop6 >= 90) strengths.push('🔥 World-Class Top Order');
  if (avgTail >= 75) strengths.push('🏏 Deep Batting Down to #8');
  if (avgTop6 < 80) vulnerabilities.push('⚠️ Fragile Top Order');

  // ==========================================
  // 2. BOWLING ARSENAL (5 Frontline Options)
  // ==========================================
  // Genuine bowlers: Bowling rating >= 65 OR primary bowler/allrounder
  const bowlers = [...picks].filter(
    (p) =>
      p.bowlingRating >= 65 ||
      p.primaryRole === 'Pacer' ||
      p.primaryRole === 'Spinner' ||
      p.primaryRole === 'Allrounder'
  );
  const sortedBowl = [...picks].sort((a, b) => b.bowlingRating - a.bowlingRating);
  const top5Bowl = sortedBowl.slice(0, 5);
  const avgTop5Bowl = top5Bowl.reduce((acc, p) => acc + p.bowlingRating, 0) / Math.max(1, top5Bowl.length);

  let bowlingPenalty = 0;
  if (bowlers.length < 5) {
    bowlingPenalty = (5 - bowlers.length) * 15;
    vulnerabilities.push(`⚠️ Missing ${5 - bowlers.length} frontline 4-over bowler(s)`);
  } else {
    strengths.push('🎯 Full 20-Over Frontline Bowling Attack');
  }

  const rawBowlIndex = Math.max(30, avgTop5Bowl - bowlingPenalty);
  const bowlingIndex = Math.min(100, Math.round(rawBowlIndex));

  // ==========================================
  // 3. STRUCTURAL BALANCE (WK, Spin, Pace, All-rounders)
  // ==========================================
  let balanceScore = 100;

  // Wicketkeeper Check
  const hasWk = picks.some(
    (p) =>
      p.primaryRole === 'Wicketkeeper' ||
      (Boolean(p.secondaryRoles) && p.secondaryRoles!.includes('Wicketkeeper'))
  );
  if (!hasWk) {
    balanceScore -= 25;
    vulnerabilities.push('⚠️ No Specialist Wicketkeeper (-25 Balance)');
  } else {
    strengths.push('🧤 Certified Gloveman Behind the Stumps');
  }

  // Spin & Pace Variety
  const spinners = picks.filter(isSpinner);
  const pacers = picks.filter(isPacer);

  if (spinners.length === 0) {
    balanceScore -= 15;
    vulnerabilities.push('⚠️ No Specialist Spinner (Vulnerable on Turning Pitches)');
  } else if (spinners.length >= 2) {
    strengths.push('🌀 Multi-Spinner Threat for Turning Decks');
  }

  if (pacers.length < 2) {
    balanceScore -= 20;
    vulnerabilities.push('⚠️ Understaffed Pace Battery (Vulnerable on Green Seamers)');
  } else if (pacers.length >= 3) {
    strengths.push('⚡ Lethal Pace Battery');
  }

  // Left-Hand / Right-Hand Batting Disruption
  const top5Batsmen = picks.slice(0, 5);
  const lhbCount = top5Batsmen.filter((p) => p.battingHand === 'Left').length;
  const rhbCount = top5Batsmen.filter((p) => p.battingHand === 'Right').length;
  if (lhbCount >= 1 && rhbCount >= 1) {
    balanceScore += 5;
    strengths.push('⚖️ Left-Right Batting Balance (Disrupts Field Placements)');
  }

  const balanceIndex = Math.max(20, Math.min(100, balanceScore));

  // ==========================================
  // 4. SYNERGY & ANOMALY BONUS POINTS
  // ==========================================
  const activeSynergies = getActiveSynergies(picks);
  const synergyPoints = activeSynergies.length * 30; // +30 pts per active duo/trio
  if (activeSynergies.length > 0) {
    strengths.push(`✨ ${activeSynergies.length} Active Real-Life Chemistry Synergies (+${synergyPoints} pts)`);
  }

  const anomalies = picks.filter((p) => p.isAnomaly);
  const anomalyPoints = anomalies.length * 25; // +25 pts per God-Mode anomaly
  if (anomalies.length > 0) {
    strengths.push(`🌟 ${anomalies.length} God-Mode Single-Season Anomalies (+${anomalyPoints} pts)`);
  }

  // Captaincy Leadership Multiplier
  let captainBonus = 0;
  if (captainId) {
    const captain = picks.find((p) => p.id === captainId);
    if (captain && captain.isCaptainCandidate) {
      captainBonus = 20;
      strengths.push(`👑 Proven Leader Appointed as Captain (+20 pts)`);
    }
  }

  // ==========================================
  // 5. COMPOSITE TOTAL (0 - 1000 SCALE)
  // ==========================================
  // Weighted: 35% Batting, 35% Bowling, 20% Balance + Bonus Points
  const baseScaledScore =
    battingIndex * 3.5 +
    bowlingIndex * 3.5 +
    balanceIndex * 2.0;

  const totalScore = Math.min(
    1000,
    Math.round(baseScaledScore + synergyPoints + anomalyPoints + captainBonus)
  );

  let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (totalScore >= 920) grade = 'S+';
  else if (totalScore >= 850) grade = 'S';
  else if (totalScore >= 780) grade = 'A';
  else if (totalScore >= 700) grade = 'B';
  else if (totalScore >= 600) grade = 'C';
  else grade = 'D';

  return {
    totalScore,
    grade,
    battingIndex,
    bowlingIndex,
    balanceIndex,
    synergyPoints,
    anomalyPoints,
    strengths,
    vulnerabilities,
  };
}
