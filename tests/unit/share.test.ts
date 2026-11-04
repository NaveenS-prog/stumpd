import { describe, it, expect } from 'vitest';
import { formatEmojiGrid } from '../../src/utils/share';

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
});
