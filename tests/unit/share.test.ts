import { describe, it, expect, vi } from 'vitest';
import { formatEmojiGrid, shareCampaignResult } from '../../src/utils/share';

describe('Social Share Formatter', () => {
  it('formats tournament match outcomes into a clean emoji grid string', () => {
    const matchResults = [true, true, false, true, true, true, true]; // 6-1 Champions
    const text = formatEmojiGrid(matchResults, 'Spin Mode', 89);
    expect(text).toContain('Stumpd');
    expect(text).toContain('🏆 Champions');
    expect(text).toContain('🟩🟩🟥🟩🟩🟩🟩');
  });

  it('formats daily mode with calendar date', () => {
    const matchResults = [true, true, true, true, true, true, true]; // 7-0 Clean Sweep
    const text = formatEmojiGrid(matchResults, 'Daily Stumpd', 92, '2026-11-04');
    expect(text).toContain('Daily Stumpd');
    expect(text).toContain('2026-11-04');
    expect(text).toContain('🟩🟩🟩🟩🟩🟩🟩');
  });

  it('invokes navigator.share with playable link when available on mobile', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const res = await shareCampaignResult('🟩🟩🟩 7-0');
    expect(res).toBe('shared');
    expect(shareMock).toHaveBeenCalled();
    const callArgs = shareMock.mock.calls[0][0];
    expect(callArgs.text).toContain('Play Stumpd:');
  });
});
