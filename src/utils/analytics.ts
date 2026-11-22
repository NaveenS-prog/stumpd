/**
 * Lightweight Client-Side Analytics Event Tracker for Stumpd.
 */
export type AnalyticsEvent =
  | 'round_started'
  | 'match_simulated'
  | 'round_completed'
  | 'daily_completed'
  | 'share_clicked'
  | 'replay_clicked'
  | 'mute_toggled';

const STORAGE_KEY_ANALYTICS = 'stumpd_analytics_counts_v1';
const memoryCounts: Record<string, number> = {};

export function getEventCounts(): Record<string, number> {
  if (typeof window === 'undefined') return { ...memoryCounts };
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYTICS);
    if (!raw) return { ...memoryCounts };
    return { ...memoryCounts, ...JSON.parse(raw) };
  } catch {
    return { ...memoryCounts };
  }
}

export function trackEvent(
  event: AnalyticsEvent,
  payload?: Record<string, unknown>
): void {
  const currentCounts = getEventCounts();
  currentCounts[event] = (currentCounts[event] || 0) + 1;
  memoryCounts[event] = currentCounts[event];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(currentCounts));
      window.dispatchEvent(
        new CustomEvent('stumpd:analytics', {
          detail: { event, payload, timestamp: Date.now() },
        })
      );
    } catch {
      // Ignore storage errors in incognito mode
    }
  }
}
