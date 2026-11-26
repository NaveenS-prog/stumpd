import { describe, it, expect, vi } from 'vitest';
import { formatEmojiGrid, shareCampaignResult } from '../../src/utils/share';

describe('Social Share Formatter', () => {
  it('formats tournament match outcomes into a clean emoji grid string', () => {
    const matchResults = [true, true, false, true, true, true, true]; // 6-1 Champions
    const text = formatEmojiGrid(matchResults, 'Spin Mode', 89);
    expect(text).toContain('Stumpd');
    expect(text).toContain('🏆 Champions');
    expect(text).not.toContain('Heartbreak');
    expect(text).toContain('🟩🟩🟥🟩🟩🟩🟩');
  });

  it('formats 6-1 Final loss as Finalists (6-1 Heartbreak) and never Champions', () => {
    const matchResults = [true, true, true, true, true, true, false];
    const text = formatEmojiGrid(matchResults, 'International', 90);
    expect(text).toContain('🥈 Finalists (6-1 Heartbreak)');
    expect(text).not.toContain('Champions');
  });

  it('formats 5-1 Semi-Final exit as Finalists without 6-1 Heartbreak', () => {
    const matchResults = [true, true, true, true, true, false];
    const text = formatEmojiGrid(matchResults, 'IPL', 88);
    expect(text).toContain('🥈 Finalists');
    expect(text).not.toContain('6-1 Heartbreak');
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

  it('uses https://stumpd-app.vercel.app fallback when window.location.origin is "null"', async () => {
    const originalLocation = window.location;
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, origin: 'null' },
      configurable: true,
      writable: true,
    });

    try {
      const res = await shareCampaignResult('🟩🟩🟩');
      expect(res).toBe('shared');
      expect(shareMock.mock.calls[0][0].text).toContain('https://stumpd-app.vercel.app');
      expect(shareMock.mock.calls[0][0].url).toBe('https://stumpd-app.vercel.app');
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
        writable: true,
      });
    }
  });
});
