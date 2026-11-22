# Stumpd Pre-Launch Hardening Design Specification

- **Date**: 2026-11-23
- **Status**: APPROVED / READY FOR IMPLEMENTATION PLAN
- **Target App**: Stumpd (`/home/naveen/Projects/stumpd`)

---

## 1. Intent & Context

Stumpd is a web-based cricket drafting and tournament strategy game. Before public distribution on social media (WhatsApp, Twitter/X, Reddit), the application requires pre-launch hardening to ensure:
1. Clear user expectations regarding local browser storage vs. global scoreboards.
2. Robust audio control that respects user preference and passes mobile Safari autoplay restrictions.
3. Completely deterministic Daily Challenge gameplay anchored to Indian Standard Time (IST) midnight rollover.
4. Total immunity to private/incognito browsing `localStorage` crashes.
5. Compliance, transparency, and data attribution disclaimers.
6. Rich visual link unfurling on messaging platforms (WhatsApp, X, Discord).
7. Host compatibility (Cloudflare Pages SPA routing fallback).
8. Native mobile sharing (`navigator.share`) with seamless clipboard fallback and playable link.
9. Baseline client-side event tracking to inform future multiplayer architecture.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- **G1**: Rename "Universal Scoreboard" to **"My Best Teams" / "My Scoreboard"** across all UI surfaces and modals.
- **G2**: Implement persistent audio mute toggle (🔊/🔇) in header with an iOS Safari user-gesture unlock listener (`touchstart`/`click`).
- **G3**: Standardize Daily Challenge date calculation to **Indian Standard Time (IST, UTC+05:30)** midnight cutoff.
- **G4**: Ensure Daily Challenge draft candidate pools, opponent gauntlet sequence, and match simulations are **100% deterministic** via Mulberry32 PRNG.
- **G5**: Wrap all `localStorage` reads/writes in fail-safe `try/catch` guards that gracefully degrade in private browsing.
- **G6**: Display clear disclaimer and data credits in the footer ("Unofficial fan project. Not affiliated with BCCI, ICC, IPL... Stats inspired by Cricsheet / open records").
- **G7**: Add complete Open Graph and Twitter Card metadata tags in `index.html` plus an optimized link-preview asset.
- **G8**: Provide `public/_redirects` with `/* /index.html 200` for SPA hosting.
- **G9**: Add mobile `navigator.share` support in `share.ts` with desktop clipboard fallback and playable link.
- **G10**: Add lightweight typed client analytics utility (`src/utils/analytics.ts`).

### Non-Goals
- Building an authenticated cloud backend database (deferred to post-launch multiplayer phase).
- Server-side anti-cheat verification for daily replays (acceptable for local client-side v1).
- Adding monetized ads or payment processing.

### Anti-Goals
- Regressing the existing 59 unit/component tests or breaking the Vite production build.
- Auto-playing jarring audio without user consent or on devices that block it.
- Claiming false legal protections such as blanket "fair use" guarantees.

---

## 3. Approaches Considered & Trade-Offs

### Approach A: Modular Utilities Architecture *(Selected)*
Create dedicated, single-responsibility modules:
- `src/utils/sound.ts` for mute management and audio unlock.
- `src/utils/analytics.ts` for typed event emission.
- Hardened `src/utils/storage.ts` with safe fallbacks.
- Pure IST cutoff in `src/engine/dailySeed.ts`.
- Injected PRNG in `src/hooks/useStumpdGame.ts`.
*Pros*: Clean separation of concerns, easily testable in isolation, UI components remain declarative.
*Cons*: Adds 2 utility files.

### Approach B: Inline Component-Level Patching *(Rejected)*
Directly patch `App.tsx` and `ResultsScreen.tsx` with component state for mute and share, wrapping inline try/catch.
*Pros*: No new files created.
*Cons*: Tangles UI rendering with browser audio unlocks, device APIs, and storage failure modes; difficult to unit test cleanly.

---

## 4. Architectural & Implementation Details

### 4.1 Scoreboard Renaming
- Change modal title from "Universal Scoreboard" to **"My Best Teams"** (subtitle: *Your All-Time Playing XI Power Rankings*).
- Update button in header: `🏆 My Best Teams`.
- Update results screen card: `Save XI to My Best Teams`.
- Update empty state message: *"No squads saved yet. Complete a campaign, name your custom drafted XI, and save it here!"*.

### 4.2 Sound Controller & Audio Toggle (`src/utils/sound.ts`)
- Manages `isMuted` boolean stored safely in `localStorage` under `stumpd_audio_muted_v1` (default: `false` / unmuted).
- Exports:
  - `getAudioMuted(): boolean`
  - `setAudioMuted(muted: boolean): void`
  - `toggleAudioMuted(): boolean`
  - `initAudioUnlock(): void` (attaches single one-time `touchstart`/`pointerdown` listener that resumes `AudioContext`).
- Update [`src/engine/audio.ts`](file:///home/naveen/Projects/stumpd/src/engine/audio.ts) sound triggers (`playAnomalyChime`, `playWicketSound`, `playBoundarySound`, `playVictoryFanfare`) to check `if (getAudioMuted()) return;`.
- Add toggle button in `App.tsx` header alongside the scoreboard button.

### 4.3 Deterministic Daily Challenge & IST Rollover (`dailySeed.ts` & `useStumpdGame.ts`)
- **IST Date Math**:
  ```typescript
  export function getDailyDateString(now: Date = new Date()): string {
    // Offset by UTC + 5 hours 30 minutes
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffsetMs);
    const yyyy = istTime.getUTCFullYear();
    const mm = String(istTime.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(istTime.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  ```
- **Candidate Pool & Reel Constraints**:
  - The slot reels (team/era constraints) are spun using `dailyRng = createSeededRandom(getDailySeed())`.
  - All eligible candidates matching the reels are presented in the scrollable drawer (no artificial truncation).
- **Gauntlet Sequence**:
  - Retain the calibrated 7-opponent gauntlet ladder progression (ending with the All-Star World XI boss).
  - Seed the match simulation (`simulateMatch(..., dailyRng)`) so all ball-by-ball rolls and clutch death-overs moments are 100% deterministic for a given lineup.

### 4.4 Hardened Storage Wrapper (`src/utils/storage.ts`)
- Every `localStorage` call is wrapped in `try { ... } catch { return fallback; }`.
- In-memory fallback dictionary keeps the current session functional even if `localStorage` throws `SecurityError` (incognito/private browsing) or `QuotaExceededError`.

### 4.5 Footer Disclaimer & Attribution (`App.tsx`)
- Add footer section at the bottom of the main layout:
  ```tsx
  <footer className="w-full text-center py-6 mt-12 border-t border-turf-900 text-[11px] font-mono text-turf-400">
    <p>Unofficial fan project. Not affiliated with BCCI, ICC, IPL, or any official team/franchise.</p>
    <p className="mt-1 text-turf-500">Historical cricket match statistics and records inspired by open data from Cricsheet.</p>
  </footer>
  ```

### 4.6 Link-Preview Meta Tags (`index.html`) & SPA Redirect
- Default production domain: `https://stumpd.pages.dev` (overridable via environment/origin).
- Update `index.html`:
  - `<title>Stumpd - The 7-0 Cricket Draft Challenge</title>`
  - `<meta name="description" content="Draft your dream Playing XI and conquer the 7-0 Invincible Gauntlet against legendary historic cricket dynasties." />`
  - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`).
  - Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
- Create `public/_redirects`:
  ```
  /*    /index.html   200
  ```

### 4.7 Mobile Native Sharing (`src/utils/share.ts`)
- Format share payload with app link:
  ```typescript
  export async function shareCampaignResult(text: string, title = 'Stumpd Cricket Challenge'): Promise<'shared' | 'copied' | 'failed'> {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://stumpd.pages.dev';
    const fullText = `${text}\n\nPlay Stumpd: ${url}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: fullText, url });
        return 'shared';
      } catch (err) {
        // User cancelled or share rejected -> fallback to clipboard
      }
    }
    const copied = await copyToClipboard(fullText);
    return copied ? 'copied' : 'failed';
  }
  ```

### 4.8 Lightweight Analytics (`src/utils/analytics.ts`)
- Simple type-safe tracking helper:
  - Grain definition:
    - `round_started`: Fired when player starts a draft campaign.
    - `match_simulated`: Fired after each individual fixture (1 through 7).
    - `round_completed`: Fired upon reaching the ResultsScreen.
    - `daily_completed`: Fired when completing the daily gauntlet.
    - `share_clicked`: Fired on share action.
    - `replay_clicked`: Fired on "Run it back" / replay action.
    - `mute_toggled`: Fired on audio mute/unmute.
  - Logs events with payload and persists local session counters.

---

## 5. Builder Review Resolutions
1. **Candidate Pool**: Uncapped candidate drawer is preserved; `dailyRng` seeds the slot reel spin.
2. **Gauntlet Progression**: Calibrated 7-fixture difficulty ladder maintained; simulation dice rolls are deterministic via `dailyRng`.
3. **Domain / Preview**: Default set to `https://stumpd.pages.dev`, runtime sharing dynamically pulls `window.location.origin`.
4. **Analytics Grain**: Campaign = `round`, fixture = `match`.
5. **Share Link**: Playable game URL automatically appended to the emoji grid.
