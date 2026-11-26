import { Player } from '../types/player';

export function formatEmojiGrid(
  matchOutcomes: boolean[],
  mode: string,
  teamAvgRating?: number,
  dailyDate?: string,
  mvpName?: string,
  synergiesActive?: number
): string {
  const total = matchOutcomes.length;
  const wins = matchOutcomes.filter(Boolean).length;
  const wonFinal = matchOutcomes[matchOutcomes.length - 1] === true;

  let title = '🏏 Campaign Completed';
  if (wins === 7 && total === 7) {
    title = '🏆 INVINCIBLE 7-0 Champions';
  } else if (wins === 6 && total === 7 && !wonFinal) {
    title = '🥈 Finalists (6-1 Heartbreak)';
  } else if (wonFinal && wins >= 5) {
    title = '🏆 Champions';
  } else if (wins >= 4) {
    title = '🥈 Finalists';
  }

  const emojiRow = matchOutcomes.map((won) => (won ? '🟩' : '🟥')).join('');

  const lines = [
    `Stumpd. — ${title}`,
    `${mode}${dailyDate ? ` (${dailyDate})` : ''}`,
    emojiRow,
    `${wins}/${total} Matches Won`,
  ];

  if (teamAvgRating) {
    lines.push(`⭐ Team Avg Rating: ${teamAvgRating}`);
  }
  if (mvpName) {
    lines.push(`👑 MVP: ${mvpName}`);
  }
  if (synergiesActive && synergiesActive > 0) {
    lines.push(`✨ Chemistry Synergies: ${synergiesActive} Active`);
  }

  lines.push('#Stumpd #7and0 #CricketStrategy');
  return lines.join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareCampaignResult(
  text: string,
  title = 'Stumpd Cricket Challenge'
): Promise<'shared' | 'copied' | 'failed'> {
  const url =
    typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://stumpd-app.vercel.app';
  const fullText = `${text}\n\n🏏 Play Stumpd: ${url}`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text: fullText, url });
      return 'shared';
    } catch {
      // User cancelled share or rejected -> attempt clipboard fallback
    }
  }

  const copied = await copyToClipboard(fullText);
  return copied ? 'copied' : 'failed';
}

export function generateTeamCanvasCard(
  userXI: Player[],
  captainId: string | null,
  title: string = 'Stumpd. Playing XI'
): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background: Dark turf gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1000);
    bgGrad.addColorStop(0, '#0A1813');
    bgGrad.addColorStop(1, '#050D0A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1000);

    // Gold Border
    ctx.strokeStyle = '#E5A93B';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 960);

    // Title
    ctx.fillStyle = '#E5A93B';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STUMPD.', 400, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px sans-serif';
    ctx.fillText(title, 400, 115);

    // Lineup entries
    ctx.textAlign = 'left';
    userXI.forEach((player, idx) => {
      const y = 170 + idx * 70;
      const isCaptain = player.id === captainId;

      ctx.fillStyle = '#12261E';
      ctx.fillRect(50, y - 24, 700, 56);
      ctx.strokeStyle = isCaptain ? '#E5A93B' : '#1F3F32';
      ctx.lineWidth = isCaptain ? 2 : 1;
      ctx.strokeRect(50, y - 24, 700, 56);

      // Slot number
      ctx.fillStyle = '#E5A93B';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${idx + 1}.`, 70, y + 12);

      // Player name & badges
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(player.name + (isCaptain ? ' (C)' : ''), 110, y + 8);

      // Subtitle: Country & Role
      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${player.country} • ${player.primaryRole}`, 110, y + 25);

      // Ratings
      ctx.fillStyle = '#E5A93B';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`BAT ${player.battingRating}  BOWL ${player.bowlingRating}`, 720, y + 12);
      ctx.textAlign = 'left';
    });

    // Watermark footer
    ctx.fillStyle = '#64748B';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('stumpd-app.vercel.app • 11-Slot Tactical Cricket Drafting', 400, 955);

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
