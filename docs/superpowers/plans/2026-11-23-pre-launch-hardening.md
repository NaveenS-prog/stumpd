# Pre-Launch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the pre-launch hardening pass for Stumpd: rename scoreboard to "My Best Teams", add persistent audio mute toggle with Safari unlock, guarantee deterministic Daily Challenge with IST rollover, harden localStorage with try/catch, add mobile native sharing with playable link, add Open Graph / SPA redirects, and add disclaimer attribution and lightweight analytics.

**Architecture:** Implement modular service utilities (`sound.ts`, `analytics.ts`, hardened `storage.ts`) and pure IST/PRNG functions, cleanly decoupling browser platform APIs (Web Audio, Navigator Share, LocalStorage) from UI components while preserving existing game simulation flows.

**Tech Stack:** React 19, TypeScript, Vite 6, TailwindCSS 3.4, Web Audio API, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-23-pre-launch-hardening-design.md`](file:///home/naveen/Projects/stumpd/docs/superpowers/specs/2026-11-23-pre-launch-hardening-design.md)

## Global Constraints

- Never crash on `localStorage` in private/incognito browsing or when quota is exceeded; use safe in-memory fallback.
- Daily rollover time must be strictly anchored to Indian Standard Time (IST, UTC+05:30) midnight.
- When `gameMode === 'Daily Stumpd'`, all reel spins and match simulations must be 100% deterministic via Mulberry32 PRNG.
- Audio must be muted by default when toggle is active, and must unlock `AudioContext` only after a user gesture.
- All 59 existing unit/component tests must continue passing alongside new tests.
- Production build (`tsc && vite build`) must succeed with zero errors.

## Review Focus

1. Private browsing mode throwing `SecurityError` on `localStorage.setItem` — must degrade to in-memory store without crashing.
2. Timezone edge-cases around UTC 18:30 (IST midnight) — must rollover correctly according to IST date.
3. Mobile browser lacking `navigator.share` or user dismissing share sheet — must fall back to clipboard copy gracefully.
4. Audio mute state toggled during an active round — sound effects must immediately cease.
5. Injected PRNG in Daily Challenge — same seed must produce identical reel results and match scorecards across repeated runs.

---

### Task 1: Safe Storage Wrapper & Scoreboard Renaming ("My Best Teams")

**Files:**
- Modify: `src/utils/storage.ts`
- Modify: `src/components/scoreboard/UniversalScoreboardModal.tsx`
- Modify: `src/components/results/ResultsScreen.tsx`
- Modify: `src/App.tsx`
- Test: `tests/unit/storage.test.ts`
- Test: `tests/components/scoreboard.test.tsx`

**Interfaces:**
- Produces: Safe `getGameStats()`, `saveGameStats()`, `getUniversalLeaderboard()`, `saveToUniversalLeaderboard()` protected by in-memory fallback if `localStorage` throws.

- [ ] **Step 1: Write the failing test for safe storage fallback in incognito**

Create `tests/unit/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUniversalLeaderboard, saveToUniversalLeaderboard, getGameStats, saveGameStats } from '../../src/utils/storage';

describe('Storage resilience under private browsing / quota errors', () => {
  it('does not throw and falls back to in-memory state when localStorage throws', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('QuotaExceededError / SecurityError');
    });

    expect(() => {
      saveToUniversalLeaderboard({
        teamName: 'Incognito XI',
        mode: 'International',
        totalScore: 900,
        grade: 'S',
        matchesWon: 7,
        totalMatches: 7,
        captainName: 'Dhoni',
        date: '2026-11-23',
        synergiesCount: 2,
        isInvincible: true,
      });
    }).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
});
```

- [ ] **Step 2: Run test to verify it fails or runs**
Run: `npm test tests/unit/storage.test.ts`

- [ ] **Step 3: Implement in-memory fallback and safe try/catch in `src/utils/storage.ts`**
Add an in-memory dictionary fallback `const memoryStore: Record<string, string> = {};` so if `localStorage.getItem` or `setItem` throws, it seamlessly reads/writes from memory.

- [ ] **Step 4: Rename "Universal Scoreboard" to "My Best Teams" across UI**
- In `UniversalScoreboardModal.tsx`: Change title to "My Best Teams", subtitle to "Your All-Time Playing XI Power Rankings". Update empty state message to "My Best Teams Awaiting Its First Squad".
- In `ResultsScreen.tsx`: Update button and card heading to "Save XI to My Best Teams".
- In `App.tsx`: Update header button label to "🏆 My Best Teams".

- [ ] **Step 5: Run tests to verify all pass**
Run: `npm test tests/unit/storage.test.ts tests/components/scoreboard.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/utils/storage.ts src/components/scoreboard/UniversalScoreboardModal.tsx src/components/results/ResultsScreen.tsx src/App.tsx tests/unit/storage.test.ts tests/components/scoreboard.test.tsx
git commit -m "feat: resilient storage wrapper and rename scoreboard to My Best Teams"
```

---

### Task 2: Sound Controller & Audio Mute Toggle

**Files:**
- Create: `src/utils/sound.ts`
- Modify: `src/engine/audio.ts`
- Modify: `src/App.tsx`
- Test: `tests/unit/sound.test.ts`

**Interfaces:**
- Produces:
  - `getAudioMuted(): boolean`
  - `setAudioMuted(muted: boolean): void`
  - `toggleAudioMuted(): boolean`
  - `initAudioUnlock(): void`

- [ ] **Step 1: Write the failing test for sound manager**

Create `tests/unit/sound.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getAudioMuted, setAudioMuted, toggleAudioMuted } from '../../src/utils/sound';

describe('Sound Manager Controller', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to unmuted (false)', () => {
    expect(getAudioMuted()).toBe(false);
  });

  it('toggles and persists mute state in localStorage', () => {
    expect(toggleAudioMuted()).toBe(true);
    expect(getAudioMuted()).toBe(true);
    expect(toggleAudioMuted()).toBe(false);
    expect(getAudioMuted()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/unit/sound.test.ts`
Expected: FAIL (cannot find module `sound.ts`)

- [ ] **Step 3: Implement `src/utils/sound.ts`**
- Manages `stumpd_audio_muted_v1` in `localStorage` wrapped in safe try/catch.
- Adds `initAudioUnlock()` attaching one-time `pointerdown`/`touchstart` event listener to unlock Web Audio context.

- [ ] **Step 4: Update `src/engine/audio.ts` and `App.tsx`**
- In `src/engine/audio.ts`: At the top of `playAnomalyChime`, `playWicketSound`, `playBoundarySound`, and `playVictoryFanfare`, return early if `getAudioMuted()` is true.
- In `src/App.tsx`: Add a mute toggle button in the header (🔊 when sound is on, 🔇 when muted) next to the "My Best Teams" button, and call `initAudioUnlock()` on mount.

- [ ] **Step 5: Run tests to verify all pass**
Run: `npm test tests/unit/sound.test.ts tests/unit/audio.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/utils/sound.ts src/engine/audio.ts src/App.tsx tests/unit/sound.test.ts
git commit -m "feat: sound manager with mute toggle and iOS audio unlock"
```

---

### Task 3: Deterministic Daily Mode with IST Rollover

**Files:**
- Modify: `src/engine/dailySeed.ts`
- Modify: `src/hooks/useStumpdGame.ts`
- Test: `tests/unit/dailySeed.test.ts`
- Create: `tests/unit/dailyDeterministic.test.ts`

**Interfaces:**
- Produces:
  - `getDailyDateString(now?: Date): string` (IST UTC+05:30 offset)
  - Deterministic `spinSlotReels` and `simulateMatch` when `gameMode === 'Daily Stumpd'`

- [ ] **Step 1: Write test verifying IST date calculation and deterministic simulation**

Update `tests/unit/dailySeed.test.ts` and add `tests/unit/dailyDeterministic.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getDailyDateString, getDailySeed, createSeededRandom } from '../../src/engine/dailySeed';

describe('IST Daily Date calculation', () => {
  it('correctly shifts date past 18:30 UTC into next day IST', () => {
    // 2026-11-23 18:31:00 UTC = 2026-11-24 00:01:00 IST
    const eveningUTC = new Date('2026-11-23T18:35:00.000Z');
    expect(getDailyDateString(eveningUTC)).toBe('2026-11-24');

    // 2026-11-23 18:00:00 UTC = 2026-11-23 23:30:00 IST
    const earlierUTC = new Date('2026-11-23T18:00:00.000Z');
    expect(getDailyDateString(earlierUTC)).toBe('2026-11-23');
  });

  it('produces identical random sequences for identical seed', () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(12345);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toEqual(rng2());
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails if IST offset is missing**
Run: `npm test tests/unit/dailySeed.test.ts`

- [ ] **Step 3: Implement IST date offset in `src/engine/dailySeed.ts`**
```typescript
export function getDailyDateString(date: Date = new Date()): string {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  const yyyy = istTime.getUTCFullYear();
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
```

- [ ] **Step 4: Wire `dailyRng` into `useStumpdGame.ts`**
- In `useStumpdGame.ts`: When `gameMode === 'Daily Stumpd'`, compute `const dailyRng = createSeededRandom(getDailySeed());`.
- Pass `dailyRng` into `spinSlotReels` and `simulateMatch`. In other modes, pass `Math.random`.

- [ ] **Step 5: Run tests to verify all pass**
Run: `npm test tests/unit/dailySeed.test.ts tests/unit/draftMachine.test.ts tests/unit/simulator.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/engine/dailySeed.ts src/hooks/useStumpdGame.ts tests/unit/dailySeed.test.ts tests/unit/dailyDeterministic.test.ts
git commit -m "feat: deterministic daily mode with Indian Standard Time rollover"
```

---

### Task 4: Mobile Native Share with Playable Link & Fallback

**Files:**
- Modify: `src/utils/share.ts`
- Modify: `src/components/results/ResultsScreen.tsx`
- Test: `tests/unit/share.test.ts`

**Interfaces:**
- Produces: `shareCampaignResult(text: string, title?: string): Promise<'shared' | 'copied' | 'failed'>`

- [ ] **Step 1: Write test for `shareCampaignResult`**

Update `tests/unit/share.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareCampaignResult } from '../../src/utils/share';

describe('shareCampaignResult', () => {
  it('calls navigator.share with playable link when available', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
      writable: true,
    });

    const res = await shareCampaignResult('🟩🟩🟩 7-0');
    expect(res).toBe('shared');
    expect(shareMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/unit/share.test.ts`

- [ ] **Step 3: Implement `shareCampaignResult` in `src/utils/share.ts`**
- Appends `\n\nPlay Stumpd: ${url}` to the shared text.
- Checks if `navigator.share` is supported and invokes it. If rejected or unavailable, falls back to `copyToClipboard`.

- [ ] **Step 4: Update `ResultsScreen.tsx`**
- Update button handler in `ResultsScreen.tsx` to call `shareCampaignResult`.
- Update button label to reflect status: "✓ Shared!" or "✓ Copied to Clipboard!".

- [ ] **Step 5: Run tests to verify all pass**
Run: `npm test tests/unit/share.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/utils/share.ts src/components/results/ResultsScreen.tsx tests/unit/share.test.ts
git commit -m "feat: native mobile sharing with playable game URL"
```

---

### Task 5: Footer Disclaimer, Open Graph Tags, & SPA Fallback

**Files:**
- Create: `public/_redirects`
- Create: `public/og-image.svg`
- Modify: `index.html`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `public/_redirects` for Cloudflare Pages**
Contents:
```
/*    /index.html   200
```

- [ ] **Step 2: Create `public/og-image.svg`**
Design a clean, 1200x630 vector graphic with cricket bats, emerald turf gradient, gold typography: "STUMPD - The 7-0 Cricket Draft Challenge".

- [ ] **Step 3: Add Open Graph and Twitter Card tags in `index.html`**
```html
<meta property="og:title" content="Stumpd - The 7-0 Cricket Draft Challenge" />
<meta property="og:description" content="Draft your dream Playing XI and conquer the 7-0 Invincible Gauntlet against legendary cricket dynasties." />
<meta property="og:image" content="https://stumpd.pages.dev/og-image.svg" />
<meta property="og:url" content="https://stumpd.pages.dev" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Stumpd - The 7-0 Cricket Draft Challenge" />
<meta name="twitter:description" content="Draft your dream Playing XI and conquer the 7-0 Invincible Gauntlet against legendary cricket dynasties." />
<meta name="twitter:image" content="https://stumpd.pages.dev/og-image.svg" />
```

- [ ] **Step 4: Add disclaimer and attribution footer in `src/App.tsx`**
```tsx
<footer className="w-full text-center py-6 mt-12 border-t border-turf-900 text-[11px] font-mono text-turf-400">
  <p>Unofficial fan project. Not affiliated with BCCI, ICC, IPL, or any official team/franchise.</p>
  <p className="mt-1 text-turf-500">Historical cricket match statistics and records inspired by open data from Cricsheet.</p>
</footer>
```

- [ ] **Step 5: Verify build compiles cleanly**
Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add public/_redirects public/og-image.svg index.html src/App.tsx
git commit -m "feat: footer disclaimer, link preview tags, and SPA redirect"
```

---

### Task 6: Lightweight Analytics Telemetry

**Files:**
- Create: `src/utils/analytics.ts`
- Modify: `src/hooks/useStumpdGame.ts`
- Modify: `src/components/results/ResultsScreen.tsx`
- Modify: `src/App.tsx`
- Test: `tests/unit/analytics.test.ts`

**Interfaces:**
- Produces: `trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown>): void`

- [ ] **Step 1: Write test for analytics module**

Create `tests/unit/analytics.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, getEventCounts } from '../../src/utils/analytics';

describe('Analytics Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('increments and tracks event counts in storage', () => {
    trackEvent('round_started', { mode: 'International' });
    trackEvent('round_completed', { score: 920 });
    const counts = getEventCounts();
    expect(counts['round_started']).toBe(1);
    expect(counts['round_completed']).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/unit/analytics.test.ts`

- [ ] **Step 3: Implement `src/utils/analytics.ts`**
- Supported event types: `round_started`, `match_simulated`, `round_completed`, `daily_completed`, `share_clicked`, `replay_clicked`, `mute_toggled`.
- Increments local counters in `localStorage` under `stumpd_analytics_counts_v1`.
- Emits a DOM CustomEvent `stumpd:analytics` for easy integration with future tools.

- [ ] **Step 4: Wire analytics calls in components and hook**
- `useStumpdGame.ts`: track `round_started` in `startMode`, `match_simulated` after match calculation, `daily_completed` when finishing daily.
- `ResultsScreen.tsx`: track `round_completed`, `share_clicked`, `replay_clicked`.
- `App.tsx`: track `mute_toggled`.

- [ ] **Step 5: Run tests to verify all pass**
Run: `npm test tests/unit/analytics.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**
```bash
git add src/utils/analytics.ts src/hooks/useStumpdGame.ts src/components/results/ResultsScreen.tsx src/App.tsx tests/unit/analytics.test.ts
git commit -m "feat: client-side analytics event tracker"
```

---

### Task 7: Full Suite Verification & Build Sanity

**Files:**
- Entire repository

- [ ] **Step 1: Run complete test suite**
Run: `npm test`
Expected: All 20+ test files and ~65+ tests pass with zero failures.

- [ ] **Step 2: Run full production build**
Run: `npm run build`
Expected: `tsc && vite build` succeeds with zero errors.

- [ ] **Step 3: Final verification commit & Second Brain sync**
Sync daily log `SecondBrain/Daily/2026-11-23.md`.
```bash
git add -A && git commit -m "chore: pre-launch hardening complete and verified"
```
