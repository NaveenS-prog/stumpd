import { describe, it, expect, beforeEach } from 'vitest';
import { trackEvent, getEventCounts } from '../../src/utils/analytics';

describe('Analytics Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('increments and tracks event counts in storage', () => {
    trackEvent('round_started', { mode: 'International' });
    trackEvent('round_completed', { score: 920 });
    trackEvent('share_clicked', { channel: 'mobile_share' });

    const counts = getEventCounts();
    expect(counts['round_started']).toBe(1);
    expect(counts['round_completed']).toBe(1);
    expect(counts['share_clicked']).toBe(1);
  });
});
