                                                                # Stumpd Mass-Distribution Hardening Design Specification

- **Date:** 2026-11-26
- **Status:** Ready for Approval (Builder Review Resolved)
- **Target Repository:** [`/home/naveen/Projects/stumpd`](file:///home/naveen/Projects/stumpd)
- **Production URL:** `https://stumpd-app.vercel.app`
- **Source Audit:** 20-item `/ponytail-audit` readiness review (correctness, security, scale, tests, lean cleanup)

---

## 1. Intent and the "Why"

Stumpd is ready to move from personal testing to mass public distribution across social media, WhatsApp, and X. Before sharing the link broadly, every known game-breaking bug, simulation discrepancy, broken link preview asset, and public leaderboard security gap must be closed so strangers have a polished, fair, and reliable experience on mobile and desktop browsers.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **G1 (Leaderboard Security & Fairness):** Move global leaderboard submissions behind a Vercel server endpoint (`/api/submit-score`) that recomputes the 0–1000 Team Power Score from actual player IDs, rejects Practice Mode and 0-win runs, enforces IP-based rate limiting via Supabase, locks direct browser `INSERT` in `supabase/schema.sql`, and ranks `7-0` champions and total wins ahead of raw team ratings.
- **G2 (Zero Data-Loss Drafting & Lineup Editing):** Fix `LineupReorderModal` wiping drafted teams, guard rapid double-taps on candidate cards/spins/submits, clear spin timers on quit/unmount, and allow hybrid keeper-openers and valid country eras in `draftMachine.ts`.
- **G3 (Authentic Match Simulation & Suspense):** Restore `LiveSimProgress` animation timing with skip support, fix missing opponent captain boosts, use each opponent's home `venueId` for Matches 2–7, require realistic bowling ratings (`>= 60`) for specialist bowler balance bonuses, align toss decisions with chasing vs defending runs/overs/traits, fix early-loss near-miss labels, and calculate campaign MVP strictly from the user's XI with active synergies included in share text.
- **G4 (Social Sharing, Styling & Accessibility):** Fix the clipped `public/og-image.svg` / `public/og-image.png` preview banner, update stale share fallback/watermark URLs in `share.ts`, define missing `turf-500` / `gold-200` colors in `tailwind.config.js`, and remove mobile zoom lock (`user-scalable=no`) in `index.html`.
- **G5 (Lean Codebase & Regression Tests):** Remove unreachable `MatchSetupScreen`, unused `useAudio.ts`, duplicate header/results controls, and unused dependencies (`canvas-confetti`, `@types/canvas-confetti`, `lucide-react`); untrack one-off `scratch/` scripts; and add integration/API tests covering the end-to-end flow and failure paths.

### Non-Goals
- **NG1:** Moving reel spins and all 7 match simulations onto backend servers with user accounts/OAuth (deferred; Option 3 rejected as a full rewrite).
- **NG2:** Building 1v1 multiplayer lobbies or daily trivia side quests (separate Phase 2/3 roadmap items).
- **NG3:** Paying for or provisioning external Redis/Upstash rate-limit infrastructure (rate limiting uses the existing Supabase Postgres database).

### Anti-Goals
- **AG1:** Breaking offline play or local `My Best Teams` storage when Supabase is unreachable or unconfigured.
- **AG2:** Regressing existing passing unit/component tests or leaving cloud upload errors hidden from the user.

---

## 3. Constraints

- **Hosting:** Static Vite SPA + Vercel Node.js Serverless Function (`api/submit-score.ts`, Node 26.x). `vercel.json` must exclude `/api/` from the SPA catch-all rewrite.
- **Database:** Supabase PostgreSQL (`public.universal_leaderboard` + private `public.leaderboard_rate_limits`).
- **Required Deployment Environment Variables (Vercel):** `SUPABASE_URL` (or fallback to `VITE_SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY` (server-only secret; never prefixed with `VITE_`). Optional `RATE_LIMIT_SALT` (falls back to a slice of `SUPABASE_SERVICE_ROLE_KEY` if unset).
- **Backward Compatibility:** Existing entries in local `localStorage` (`stumpd_universal_leaderboard_v1`, `stumpd_career_stats_v1`) must continue loading cleanly.

---

## 4. Approaches Considered & Selected

### Approach 1: Vercel Server Endpoint + Browser Game *(Selected)*
Keep drafting and match simulation instant in the browser, but replace direct Supabase browser `INSERT`s with a Vercel API endpoint (`POST /api/submit-score`). The endpoint validates the payload, recomputes `calculateUniversalTeamScore` from `src/data/players.json`, checks IP-hash rate limits in Supabase, and inserts via `SUPABASE_SERVICE_ROLE_KEY`.
- *Trade-off:* Reuses the exact TypeScript scoring engine with zero duplication and deploys via GitHub → Vercel with zero extra CLI/hosting setup. Determined hackers could still forge match W/L flags since simulation stays client-side, but cannot spoof player scores, flood bots, or pollute rankings with Practice teams.

### Approach 2: Supabase Edge Function + Browser Game *(Rejected)*
Implement score validation inside a Supabase Deno Edge Function.
- *Trade-off:* Requires Supabase CLI setup and duplicating `teamScore.ts` + `players.json` into a separate Deno runtime bundle.

### Approach 3: Full Server-Side Match Sessions *(Rejected)*
Move all spins and match simulations to stateful backend API routes.
- *Trade-off:* Adds network latency to every action, breaks offline play, and turns a pre-launch hardening pass into a full architecture rewrite.

---

## 5. Detailed Design

### 5.1 Leaderboard Security, Server Verification & Fairness

#### A. Database Schema & RLS (`supabase/schema.sql`)
1. **Purge Legacy/Dirty Rows & Tighten Constraints *(User Decision: Clean Slate)*:** Run destructive cleanup before applying stricter `CHECK` constraints:
   - `DELETE FROM public.universal_leaderboard WHERE mode NOT IN ('International', 'IPL', 'Daily Stumpd') OR matches_won < 1 OR total_matches > 7 OR NOT ((matches_won = 7 AND total_matches = 7) OR (matches_won = total_matches - 1 AND total_matches >= 2 AND total_matches <= 7));`
   - Tighten table constraints to enforce `mode IN ('International', 'IPL', 'Daily Stumpd')`, `matches_won >= 1 AND matches_won <= 7`, `total_matches >= 1 AND total_matches <= 7`, and sudden-death gauntlet consistency (`(matches_won = 7 AND total_matches = 7) OR (matches_won = total_matches - 1 AND total_matches >= 2)`).
2. **Lock down public writes:** Drop the `"Allow public score submission"` policy and `REVOKE INSERT, UPDATE, DELETE ON public.universal_leaderboard FROM anon, authenticated;`. Keep public `SELECT` active for `anon` and `authenticated` so `fetchGlobalLeaderboard` continues working from the browser.
3. **Win-first Leaderboard Index:** Update `idx_universal_leaderboard_score_date` to `(is_invincible DESC, matches_won DESC, total_score DESC, created_at ASC)`.
4. **Private Rate-Limit Table:** Create `public.leaderboard_rate_limits (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ip_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()))` with an index on `(ip_hash, created_at DESC)`. Enable RLS on `leaderboard_rate_limits` with **no** policies for `anon` or `authenticated` (`REVOKE ALL ON public.leaderboard_rate_limits FROM anon, authenticated;`), ensuring only `service_role` can read/write it and no IP hashes leak publicly.

#### B. Vercel Submission Endpoint (`api/submit-score.ts`)
- Export Web-standard `export async function POST(request: Request): Promise<Response>` (compatible with Vercel Node 26 runtime with zero `@vercel/node` dependency; include `"api"` in `tsconfig.json` `include`).
- **Request JSON Payload:**
  ```typescript
  interface SubmitScorePayload {
    teamName: string;
    creatorName?: string;
    mode: 'International' | 'IPL' | 'Daily Stumpd';
    playerIds: string[]; // exactly 11 unique valid player IDs
    captainId: string;   // must be in playerIds
    matchesWon: number;  // integer 1..7
    totalMatches: number;// integer 1..7
  }
  ```
- **Validation Rules:**
  - Reject `'Practice Mode'` or any mode not in `['International', 'IPL', 'Daily Stumpd']` (`400`).
  - Reject `matchesWon < 1` or `totalMatches > 7` or invalid gauntlet end states (valid end states: `matchesWon === 7 && totalMatches === 7`, or `matchesWon === totalMatches - 1` when `totalMatches >= 2 && totalMatches <= 7`) (`400`).
  - Trim `teamName` (1–60 chars required) and `creatorName` (optional, 1–40 chars after trim or `null`).
  - Verify `playerIds` is an array of 11 unique IDs present in `src/data/players.json`, and `captainId` is one of those 11 IDs (`400`).
- **Rate Limiting:**
  - Extract client IP from `request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'`.
  - Compute SHA-256 hex digest of `${salt}:${ip}` via `node:crypto`.
  - Query `leaderboard_rate_limits` for `ip_hash` within the last 10 minutes; if `count >= 5`, return `429 Too Many Requests` with clear JSON `{ error: 'Rate limit exceeded. Please wait a few minutes before submitting again.' }`.
  - Otherwise insert a row into `leaderboard_rate_limits` (best-effort prune rows older than 24 hours).
- **Authoritative Score Calculation & Insert:**
  - Resolve the 11 `Player` objects and call `calculateUniversalTeamScore(players, captainId)`.
  - Derive `captainName` from the resolved captain, `synergiesCount = Math.round(breakdown.synergyPoints / 30)`, and `isInvincible = matchesWon === 7 && totalMatches === 7`.
  - Insert into `universal_leaderboard` using `SUPABASE_SERVICE_ROLE_KEY` and return `201` with the created `GlobalLeaderboardEntry`.

#### C. Routing & Client Service (`vercel.json`, `src/services/supabase.ts`, `ResultsScreen.tsx`, `UniversalScoreboardModal.tsx`)
- **`vercel.json`:** Update rewrite rule to `{ "source": "/((?!api/).*)", "destination": "/" }` so `/api/submit-score` reaches the serverless function rather than `index.html`.
- **`src/services/supabase.ts`:**
  - Update `fetchGlobalLeaderboard` query ordering to: `.order('is_invincible', { ascending: false }).order('matches_won', { ascending: false }).order('total_score', { ascending: false }).order('created_at', { ascending: true })`.
  - Update `submitToGlobalLeaderboard` signature to accept `playerIds: string[]` and `captainId: string` alongside `teamName`, `creatorName`, `mode`, `matchesWon`, and `totalMatches`, and `POST` to `/api/submit-score` instead of calling `client.from('universal_leaderboard').insert(...)`. Parse server error messages cleanly (`res.json()` fallback).
- **`ResultsScreen.tsx` & `UniversalScoreboardModal.tsx`:**
  - Prevent double-submission via an `isSubmitting` guard.
  - Always save to local `My Best Teams` (`saveToUniversalLeaderboard`), storing `savedLocalId`.
  - Attempt global upload only if `gameMode !== 'Practice Mode' && winsCount >= 1 && isSupabaseConfigured()`. Show a clear inline explanation when Practice Mode or a 0-win run is kept local-only.
  - Surface upload failures via `globalSyncError` state with a **"Retry Cloud Sync"** button instead of silently swallowing errors.
  - Lift `UniversalScoreboardModal` to a single modal instance in `App.tsx` (passing `onOpenScoreboard(highlightEntryId?)` to `ResultsScreen`) and highlight matching rows strictly by `entry.id === highlightId` (never by score equality).
  - Inside `UniversalScoreboardModal.tsx`, read `getUniversalLeaderboard()` only when `isOpen` is true (`useMemo` keyed on `isOpen` and `activeTab`), and add an optional mode filter or badge clarity.

---

### 5.2 Drafting, Lineup Editing & Pool Fixes

1. **`LineupReorderModal.tsx`:** Add `useEffect(() => { if (isOpen) setOrdered([...players]); }, [isOpen, players]);` so opening the modal after drafting 11 players always displays the current squad instead of the empty array initialized at mount.
2. **`useStumpdGame.ts` Spin/Draft Guards:**
   - Track the spin interval in `spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)` and clear it at the start of `executeSpin`, inside `resetGame`, and on unmount.
   - Guard `spinReels` and `mulligan` with `if (isSpinning) return;`.
   - Guard `draftPlayer` with `if (picks.length >= SLOTS.length || picks.some((p) => p.id === player.id)) return;`.
3. **`draftMachine.ts` *(Our Call: Keep Slot 7 Strict & Sort All Fallbacks)*:**
   - Keep Slot 7 (`Allrounder`) strict primary-role-only so the 45 non-allrounders with `'Allrounder'` in `secondaryRoles` (e.g., specialist spinners/pacers) do not dilute Slot 7.
   - In `matchesSlotRole`, allow `secondaryRoles` only on `Opener`, `Wicketkeeper`, and `Pacer` (among single-role slots) alongside multi-role slots (`No. 3`–`No. 6`, `Spinner`).
   - Extract a shared `sortCandidatesForSlot(candidates, slot)` helper that ranks `strictPrimary` matches ahead of secondary-role matches and applies it across **both** `directMatches` and fallback Strategies A–D.
   - In `spinSlotReels`, filter `INTERNATIONAL_ERAS` to `['2000s', '2010s', 'Modern']` when `selectedTeam` is `'Bangladesh'` or `'Afghanistan'`, matching the existing `LSG`/`GT` era guard so spins never show `1980s`/`1990s` labels over `Modern` fallback players.

---

### 5.3 Simulation Engine, Match Suspense & Results Accuracy

1. **Match Suspense Timing & Skip (`useStumpdGame.ts`, `MatchScreen.tsx`):**
   - Add `simTimeoutRef` and `pendingMatchRef` in `useStumpdGame.ts`.
   - When `isTestEnv` is true, `playCurrentMatch` resolves synchronously as before.
   - In the browser, `playCurrentMatch` sets `isSimulating(true)` and starts an `1800ms` timeout (allowing `LiveSimProgress` to step through `0ms`, `700ms`, and `1500ms` phases) before applying the computed `MatchResult`, firing victory/loss sound effects, updating `matchResults`, and setting `isSimulating(false)`.
   - Expose `skipSimulation()` in `useStumpdGame.ts` to clear the timeout and commit `pendingMatchRef.current` immediately; wire `onSkip={skipSimulation}` in `MatchScreen.tsx` -> `LiveSimProgress`. Clean up `simTimeoutRef` inside `resetGame` and on unmount.
2. **Opponent Captain Boost & Home Venues (`simulator.ts`, `App.tsx`, `useStumpdGame.ts`):**
   - In `calculatePitchAdjustedRatings`, match captain by `captainId && (player.id === captainId || player.name === captainId)`.
   - Export a shared `getMatchOpponentAndVenue(matchIndex, activeOpponents)` helper (e.g. in `src/engine/simulator.ts` or `src/data/venues.ts`) used by both `App.tsx` and `useStumpdGame.ts` so every fixture `0..6` uses `VENUES.find(v => v.id === opponent.venueId) || VENUES[matchIndex % VENUES.length]`.
3. **Specialist Bowler Threshold (`simulator.ts`):**
   - Update `isSpinner(player)` and `isPacer(player)` to return true only if `player.primaryRole === 'Spinner'` / `'Pacer'`, OR (`player.bowlingRating >= 60` and `player.bowlingType` matches spin/pace).
4. **Toss, Chasing Logic, Overs & Scorecard Details (`simulator.ts`, `MatchScreen.tsx`, `BoxScoreCard.tsx`):**
   - Determine `userBatsFirst` before `playCurrentMatch` (coin toss roll using `rng` or deterministic fixture seed) and pass it into `TossBanner` (shown pre-match based on a pre-rolled `tossOutcome` for the current match) and `simulateMatch(..., userBatsFirst)`.
   - Inside `calculatePitchAdjustedRatings`, pass `isChasing = !userBatsFirst` for the user XI and `isChasing = userBatsFirst` for the opponent XI so `Chasing` traits only trigger for the chasing side.
   - Inside `simulateMatch`: when `userBatsFirst` is `true`, user wins by runs or loses by wickets; when `false`, user wins by wickets or loses by runs. Format the chasing team's `overs` from `ballsLeft` (e.g., `120 - ballsLeft` formatted as cricket `overs.balls`, such as `18.2`) instead of hardcoding `20.0`.
   - In `distributeBattingRuns`: cap intermediate `runs` so running total never exceeds `totalRuns` before the final batsman, and cap total team `ballsFaced` at `120` by proportional scaling if exceeded.
   - In `BoxScoreCard.tsx`: render both `userScorecard` and `opponentScorecard` in the expanded detailed scorecard view (plus top bowling summaries from `userBowling`/`opponentBowling` if included on `MatchResult`, or adding `userBowling?: PlayerPerformance[]` and `opponentBowling?: PlayerPerformance[]` to `MatchResult` cleanly).
5. **Campaign MVP, Synergies & Near-Miss Labels (`ResultsScreen.tsx`, `TrophyHero.tsx`, `share.ts`) *(Our Call: Sudden-Death `5-1` vs `6-1` Rules)*:**
   - Aggregate fantasy points (`runs + 25 * wickets`) across all `matchResults` filtered strictly to `userXI` player IDs to compute the true user campaign MVP.
   - Pass `Math.round(teamScore.synergyPoints / 30)` as `synergiesActive` to `formatEmojiGrid`.
   - Align near-miss labels with sudden-death knockout rules (first loss ends the run):
     - **`6-1` Final Loss (`winsCount === 6 && totalMatches === 7`):** Show `"💔 AGONIZING NEAR-MISS HEARTBREAK"` / `"One Win From Immortality!"` in `TrophyHero`, the heartbreak breakdown card in `ResultsScreen`, and `'🥈 Finalists (6-1 Heartbreak)'` in `formatEmojiGrid` (never `'🏆 Champions'` when `wonFinal === false`).
     - **`5-1` Semi-Final Loss (`winsCount === 5 && totalMatches === 6`):** Show `"Tournament Finalists"` (`"🥈 Finalists"` in share text) and show a `"Semi-Final Exit (5-1)"` tactical breakdown card in `ResultsScreen` without claiming `"One Win From Immortality!"` or `"6-1 Heartbreak"`.
     - **`4-1` or earlier (`winsCount <= 4`):** Show standard `"Campaign Complete"` / `"Tournament Finalists"` (`winsCount === 4`) without any heartbreak or near-miss card.
     - **Legacy non-knockout win (`wonFinal && wins >= 5`):** Keep `'🏆 Champions'` in `formatEmojiGrid`.
     - Fix `TrophyHero.tsx` singular/plural grammar (`1 Loss` vs `N Losses`).

---

### 5.4 Social Preview Assets, Share Links, Styling & Dead Code Cleanup

1. **Social Preview (`public/og-image.svg`, `public/og-image.png`):** Shorten/wrap the second line of text to `"Conquer historic international and IPL dynasties in a tactical T20 gauntlet."` so it fits comfortably left of the stumps (`x < 890`), then re-render `public/og-image.png` at `1200×630` using `rsvg-convert`.
2. **Share URLs (`src/utils/share.ts`):** Replace `'https://stumpd.pages.dev'` with `'https://stumpd-app.vercel.app'` and `'stumpd.app'` card footer with `'stumpd-app.vercel.app'`.
3. **Tailwind Tokens & Accessibility (`tailwind.config.js`, `index.html`):** Add `500: '#3D705C'` under `turf` and `200: '#FDE68A'` under `gold`; remove `maximum-scale=1.0, user-scalable=no` from `index.html` viewport meta tag.
4. **Dead Code & Package Cleanup:**
   - Remove `src/components/setup/MatchSetupScreen.tsx`, `tests/components/MatchSetupScreen.test.tsx`, `'match-setup'` phase/UI in `App.tsx`, `selectedOpponent`/`selectedVenue`/`proceedFromSetupToDraft` setup gating in `useStumpdGame.ts` (replacing Match 1 lookup with the unified `getMatchOpponentAndVenue` helper).
   - Remove unused `src/hooks/useAudio.ts`.
   - Remove the duplicate mute bar in `HomeScreen.tsx` (`L24-36`), duplicate `trackEvent('mute_toggled')` in `App.tsx:L118`, and duplicate `<UniversalScoreboardModal>` in `ResultsScreen.tsx`.
   - Uninstall `canvas-confetti`, `@types/canvas-confetti`, and `lucide-react`.
   - Untrack `scratch/*.py` scripts from git (`git rm -r --cached scratch/` or remove and ensure `scratch/` is ignored).

---

## 6. Verification Plan & Left to Builder

- **New & Updated Tests:**
  - `tests/unit/submitScoreApi.test.ts`: Test `api/submit-score.ts` handler for valid submission, score recomputation ignoring forged totals, Practice Mode / 0-win rejection, invalid/duplicate player IDs, and 429 rate-limit enforcement.
  - `tests/components/AppFlow.test.tsx`: End-to-end render test for `App` covering starting a mode, drafting 11 players, opening `LineupReorderModal` after drafting (confirming it renders all 11 and preserves them on save), simulating with `LiveSimProgress` skip, and handling a failed cloud submit with Retry on `ResultsScreen`.
  - `tests/unit/simulator.test.ts`: Verify opponent captain boost applies, home venues resolve on Matches 2–7, batters with `bowlingRating < 60` do not get specialist bonuses, and chasing/toss outcomes align with `overs <= 20.0`.
  - `tests/components/heartbreak.test.tsx`: Test `[true, true, true, true, true, true, false]` (`6-1` Final loss) for `"One Win From Immortality!"` / `"The Match That Broke Perfection"`, test `5-1` (`totalMatches: 6, winsCount: 5`) shows `"Semi-Final Exit (5-1)"` without `"One Win From Immortality!"`, test `4-1` shows neither, verify `formatEmojiGrid` outputs `'🥈 Finalists (6-1 Heartbreak)'` for `6-1` Final defeat, and verify `"1 Loss"` grammar is singular.
  - `tests/unit/supabase.test.ts`: Fix invalid mock grade (`850` -> `'S'`) and test `/api/submit-score` error handling.
- **Left to Builder:** Exact visual layout spacing when adjusting `og-image.svg`, whether `BoxScoreCard` shows bowling stats in compact tabs or stacked tables, and exact error copy on rate-limited `429` responses.

---

## 7. Builder Review Calls & User Decisions

- **User Decision:** Purge legacy `'Practice Mode'`, `'Standard'`, zero-win, and invalid rows from live `public.universal_leaderboard` and enforce strict DB `CHECK` constraints (`mode IN ('International', 'IPL', 'Daily Stumpd')`, `matches_won >= 1`, `total_matches <= 7`).
- **Our Call 1 (`5-1` vs `6-1` Heartbreak):** Under sudden-death rules, reserve `"One Win From Immortality!"` and `"6-1 Heartbreak"` strictly for a Match-7 Final loss (`6-1`, titled `'🥈 Finalists (6-1 Heartbreak)'` instead of `'Champions'`), while showing a distinct `"Semi-Final Exit (5-1)"` breakdown for Match-6 losses and standard completion for `4-1` or earlier.
- **Our Call 2 (`Allrounder` & Fallback Sorting):** Keep Slot 7 (`Allrounder`) primary-role-only so 45 non-allrounders do not dilute it, unlock `secondaryRoles` only for `Opener`/`Wicketkeeper`/`Pacer`, and sort strict primary matches first in fallback Strategies A–D as well as direct matches.
