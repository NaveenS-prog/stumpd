# Stumpd Mass-Distribution Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 20 pre-launch audit findings so Stumpd can be shared for mass public distribution with a verified, rate-limited global leaderboard, bug-free drafting/simulation, accurate share cards, full test coverage, and zero dead code.

**Architecture:** Keep drafting and match simulation fast and offline-capable in the browser, while routing global leaderboard writes through a Vercel Web-Standard serverless function (`POST /api/submit-score`) that recomputes scores from `players.json`, enforces Supabase-backed IP rate limits, and writes with `SUPABASE_SERVICE_ROLE_KEY`. Pair this with targeted fixes across `draftMachine.ts`, `simulator.ts`, `useStumpdGame.ts`, `LineupReorderModal.tsx`, `ResultsScreen.tsx`, `BoxScoreCard.tsx`, `og-image.svg`, Tailwind/viewport config, and dead-code removal.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Tailwind CSS 3.4, Vercel Serverless Functions (Node 26 Web Fetch API), Supabase PostgreSQL, Vitest 4, React Testing Library, `rsvg-convert`.

**Spec:** [`docs/superpowers/specs/2026-11-26-mass-distribution-hardening-design.md`](file:///home/naveen/Projects/stumpd/docs/superpowers/specs/2026-11-26-mass-distribution-hardening-design.md)

## Global Constraints

- Hosting uses static Vite SPA + Vercel Node 26 Web-Standard Function (`export async function POST(request: Request): Promise<Response>`), with `vercel.json` excluding `/api/` from the SPA catch-all rewrite.
- `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SALT` must be server-only env vars (`process.env`), never prefixed with `VITE_`.
- Local `My Best Teams` (`stumpd_universal_leaderboard_v1`) and career stats (`stumpd_career_stats_v1`) must continue working offline and remain backward-compatible with existing `localStorage` entries.
- `Daily Stumpd` spins and match simulation must remain 100% deterministic via `createSeededRandom(getDailySeed())`.
- All 70+ Vitest tests and `npm run build` (`tsc && vite build`) must pass cleanly with zero unused npm dependencies (`canvas-confetti`, `@types/canvas-confetti`, `lucide-react` removed).

## Review Focus

1. Opening `LineupReorderModal` after drafting 11 players when the modal mounted closed at Slot 1 (`players = []`) must display all 11 players and preserve them on Confirm (pinned in Task 5).
2. Rapid double-tap on `CandidateCard`, `Mulligan`, or `Save XI to Scoreboard` must never duplicate a pick, exceed 11 players, run overlapping spins, or submit duplicate DB rows (pinned in Task 3 & Task 5).
3. Invalid JSON, missing `x-forwarded-for`, `'Practice Mode'`, `matchesWon === 0`, duplicate `playerIds`, or >5 requests per 10 minutes to `POST /api/submit-score` must return clean `400`/`429` JSON errors without touching `universal_leaderboard` (pinned in Task 2).
4. Clicking `Quit to Home` mid-spin or mid-simulation must clear `spinIntervalRef`/`simTimeoutRef` so background callbacks never mutate state on Home (pinned in Task 5 & Task 6).
5. Sudden-death exits (`4-1`, `5-1`, `6-1`) must reserve `"One Win From Immortality!"` and `"🥈 Finalists (6-1 Heartbreak)"` strictly for `6-1`, show `"Semi-Final Exit (5-1)"` for `5-1`, singularize `"1 Loss"`, and keep `0-1`/Practice local-only (pinned in Task 3 & Task 7).

---

### Task 1: Harden Supabase Schema, Purge Legacy Rows & Update Win-First Query

**Files:**
- Modify: `supabase/schema.sql:1-75`
- Modify: `src/services/supabase.ts:86-93`
- Modify: `tests/unit/supabase.test.ts:32-109`

**Interfaces:**
- Produces: Hardened SQL schema (`public.universal_leaderboard` read-only to `anon`/`authenticated`, `public.leaderboard_rate_limits` private to `service_role`) and win-first `fetchGlobalLeaderboard(limit?: number)` ordering (`is_invincible DESC`, `matches_won DESC`, `total_score DESC`, `created_at ASC`).

- [ ] **Step 1: Write the failing test in `tests/unit/supabase.test.ts` for win-first ordering and valid mock grade**

Update `tests/unit/supabase.test.ts`: fix line 76 mock grade `'A'` → `'S'` (for `total_score: 850`), and update the `fetchGlobalLeaderboard` mock chain to assert `.order` is called in order: `('is_invincible', { ascending: false })`, `('matches_won', { ascending: false })`, `('total_score', { ascending: false })`, `('created_at', { ascending: true })`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/supabase.test.ts`
Expected: FAIL (`fetchGlobalLeaderboard` only calls `.order` twice, starting with `total_score`).

- [ ] **Step 3: Update `supabase/schema.sql` and `fetchGlobalLeaderboard` in `src/services/supabase.ts`**

1. In `supabase/schema.sql`:
   - Add destructive pre-constraint cleanup deleting rows where `mode NOT IN ('International', 'IPL', 'Daily Stumpd') OR matches_won < 1 OR total_matches > 7 OR NOT ((matches_won = 7 AND total_matches = 7) OR (matches_won = total_matches - 1 AND total_matches >= 2 AND total_matches <= 7))`.
   - Tighten `CHECK` constraints (`mode IN ('International', 'IPL', 'Daily Stumpd')`, `matches_won BETWEEN 1 AND 7`, `total_matches BETWEEN 1 AND 7`, and `chk_gauntlet_consistency`).
   - Drop `"Allow public score submission"`, keep `"Allow public read access"`, and run `REVOKE INSERT, UPDATE, DELETE ON public.universal_leaderboard FROM anon, authenticated;` + `GRANT SELECT ON public.universal_leaderboard TO anon, authenticated;`.
   - Recreate `idx_universal_leaderboard_score_date` on `(is_invincible DESC, matches_won DESC, total_score DESC, created_at ASC)`.
   - Create `public.leaderboard_rate_limits (id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, ip_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()))` with index `idx_rate_limits_ip_created` on `(ip_hash, created_at DESC)`, `ENABLE ROW LEVEL SECURITY`, and `REVOKE ALL ON public.leaderboard_rate_limits FROM anon, authenticated;`.
2. In `src/services/supabase.ts`: chain `.order('is_invincible', { ascending: false }).order('matches_won', { ascending: false }).order('total_score', { ascending: false }).order('created_at', { ascending: true })` inside `fetchGlobalLeaderboard`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/supabase.test.ts`
Expected: PASS (all assertions green).

- [ ] **Step 5: Commit**

```bash
git add supabase/schema.sql src/services/supabase.ts tests/unit/supabase.test.ts
git commit -m "feat(db): tighten leaderboard schema, purge legacy rows, and sort wins first"
```

---

### Task 2: Build Vercel `/api/submit-score` Endpoint & Routing Exclusion

**Files:**
- Create: `api/submit-score.ts`
- Modify: `vercel.json:29-34`
- Modify: `tsconfig.json:30`
- Create: `tests/unit/submitScoreApi.test.ts`

**Interfaces:**
- Consumes: `calculateUniversalTeamScore(picks: Player[], captainId?: string | null)` from `src/engine/teamScore.ts`, `src/data/players.json`.
- Produces: `export async function handleSubmitScore(request: Request, supabaseClientOverride?: SupabaseClient): Promise<Response>` and `export async function POST(request: Request): Promise<Response>` in `api/submit-score.ts`; accepts `{ teamName, creatorName?, mode, playerIds, captainId, matchesWon, totalMatches }` and returns `201` with `GlobalLeaderboardEntry`, or `400`/`429`/`500`/`503` JSON `{ error }`.

- [ ] **Step 1: Write failing tests in `tests/unit/submitScoreApi.test.ts`**

Create `tests/unit/submitScoreApi.test.ts` covering:
- `rejects Practice Mode, 0-win runs, invalid knockout math, duplicate/missing playerIds, and invalid captainId with 400`
- `rejects malformed JSON body with 400`
- `returns 429 when rate limit count >= 5 within last 10 minutes (including when x-forwarded-for is absent)`
- `recomputes authoritative score, grade, synergiesCount, captainName, and isInvincible from playerIds and inserts via service client (201)`

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/submitScoreApi.test.ts`
Expected: FAIL (module `../../api/submit-score` not found).

- [ ] **Step 3: Implement `api/submit-score.ts`, update `vercel.json`, and include `"api"` in `tsconfig.json`**

1. Create `api/submit-score.ts` using relative imports (`../src/engine/teamScore`, `../src/data/players.json`, `../src/types/player`) and `node:crypto` `createHash('sha256')`:
   - Validate JSON body and fields (`teamName` 1–60 trimmed chars, `creatorName` null or 1–40 trimmed chars, `mode` in `['International', 'IPL', 'Daily Stumpd']`, `matchesWon`/`totalMatches` integers with `(matchesWon === 7 && totalMatches === 7) || (matchesWon >= 1 && matchesWon === totalMatches - 1 && totalMatches <= 7)`, 11 unique valid IDs in `players.json`, `captainId` in `playerIds`).
   - Initialize admin Supabase client from `process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` (return `503` if missing and no `supabaseClientOverride`).
   - Hash IP (`x-forwarded-for` first hop → `x-real-ip` → `'unknown'`) with `process.env.RATE_LIMIT_SALT || serviceKey.slice(0, 16)`. Query `leaderboard_rate_limits` count for last 10 minutes; if `>= 5` return `429`; otherwise insert rate-limit row (and best-effort delete rows older than 24h).
   - Call `calculateUniversalTeamScore(resolvedPlayers, captainId)` and insert authoritative row into `universal_leaderboard`, returning `201` mapped to `GlobalLeaderboardEntry`.
2. Update `vercel.json` rewrite `source` from `"/(.*)"` to `"/((?!api/).*)"`.
3. Update `tsconfig.json` `include` to `["src", "tests", "vite.config.ts", "api"]`.

- [ ] **Step 4: Run tests and TypeScript check**

Run: `npx vitest run tests/unit/submitScoreApi.test.ts && npx tsc --noEmit`
Expected: PASS and 0 TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add api/submit-score.ts vercel.json tsconfig.json tests/unit/submitScoreApi.test.ts
git commit -m "feat(api): add verified and rate-limited Vercel score submission endpoint"
```

---

### Task 3: Wire `/api/submit-score` Client, Error/Retry UI & Single Scoreboard Highlight

**Files:**
- Modify: `src/services/supabase.ts:18-29,123-178`
- Modify: `src/components/results/ResultsScreen.tsx:13-102,240-335`
- Modify: `src/components/scoreboard/UniversalScoreboardModal.tsx:9-28,211-220,301-315`
- Modify: `src/App.tsx:56-58,105-114,275-290`
- Modify: `tests/unit/supabase.test.ts`
- Modify: `tests/components/scoreboard.test.tsx`

**Interfaces:**
- Consumes: `POST /api/submit-score` (Task 2).
- Produces: `submitToGlobalLeaderboard(entry: NewGlobalLeaderboardEntry)` calling `fetch('/api/submit-score')` where `NewGlobalLeaderboardEntry` sends `{ teamName, creatorName?, mode, playerIds, captainId, matchesWon, totalMatches }`; `ResultsScreen` accepts optional `onOpenScoreboard?: (highlightEntryId?: string) => void`; `UniversalScoreboardModal` accepts `highlightEntryId?: string | null` (replacing ambiguous `currentUserScore`).

- [ ] **Step 1: Write failing tests for client `/api/submit-score`, double-submit guard, Practice/0-win local-only, and retry UI**

1. Update `tests/unit/supabase.test.ts` to mock `globalThis.fetch` and assert `submitToGlobalLeaderboard` sends `POST /api/submit-score` with `playerIds`/`captainId` and returns `{ data: null, error }` when HTTP status is `429` or `500`.
2. Update `tests/components/scoreboard.test.tsx` to:
   - Assert Practice Mode and `0-1` runs save locally without calling `submitToGlobalLeaderboard` and show a local-only note.
   - Assert a failed `submitToGlobalLeaderboard` shows a cloud sync error and a working `"Retry Cloud Sync"` button instead of hiding errors.
   - Assert double-clicking `"Save XI to Scoreboard"` only triggers one submission and `UniversalScoreboardModal` highlights only `highlightEntryId`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/supabase.test.ts tests/components/scoreboard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement client changes across `supabase.ts`, `ResultsScreen.tsx`, `UniversalScoreboardModal.tsx`, and `App.tsx`**

1. In `src/services/supabase.ts`: replace `NewGlobalLeaderboardEntry` fields with `{ teamName, creatorName?, mode, playerIds, captainId, matchesWon, totalMatches }` and replace the direct `.insert(...)` call in `submitToGlobalLeaderboard` with `fetch('/api/submit-score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) })`, extracting `{ error }` on `!res.ok`.
2. In `src/components/results/ResultsScreen.tsx`:
   - Add `isSubmitting`, `globalSyncError`, `savedLocalId`, `savedGlobalId`, and `isSyncingCloud` states.
   - Guard `handleSaveToLeaderboard` with `if (isSubmitting || isSaved) return;`.
   - Always call `saveToUniversalLeaderboard(...)` and store `savedLocalId`.
   - Add reusable `syncToCloud()` helper called when `gameMode !== 'Practice Mode' && winsCount >= 1 && isSupabaseConfigured()`; capture errors into `globalSyncError` and expose `"Retry Cloud Sync"` button.
   - Remove the inline `<UniversalScoreboardModal>` from `ResultsScreen.tsx` and use `onOpenScoreboard?.(savedGlobalId || savedLocalId)` (with a local modal fallback only when `onOpenScoreboard` is omitted, such as standalone component tests).
3. In `src/components/scoreboard/UniversalScoreboardModal.tsx`:
   - Replace `currentUserScore?: number` with `highlightEntryId?: string | null` and match rows by `Boolean(highlightEntryId && entry.id === highlightEntryId)`.
   - Gate `getUniversalLeaderboard()` behind `useMemo(() => (isOpen ? getUniversalLeaderboard() : []), [isOpen, activeTab])` so closed modals do zero `localStorage` parsing.
4. In `src/App.tsx`: track `scoreboardHighlightId` state (`string | null`) and pass `onOpenScoreboard={(id) => { setScoreboardHighlightId(id ?? null); setIsScoreboardOpen(true); }}` to `ResultsScreen` and `highlightEntryId={scoreboardHighlightId}` to the single `UniversalScoreboardModal`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/supabase.test.ts tests/components/scoreboard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/supabase.ts src/components/results/ResultsScreen.tsx src/components/scoreboard/UniversalScoreboardModal.tsx src/App.tsx tests/unit/supabase.test.ts tests/components/scoreboard.test.tsx
git commit -m "feat(scoreboard): route submits through API with retry UI, local-only guards, and ID highlighting"
```

---

### Task 4: Fix `draftMachine.ts` Hybrid Slots, Fallback Sorting & Valid Era Spins

**Files:**
- Modify: `src/engine/draftMachine.ts:16-38,86-242`
- Modify: `tests/unit/draftMachine.test.ts`

**Interfaces:**
- Preserves existing `draftMachine` public method signatures (`getCandidatesForSlot`, `spinSlotReels`).

- [ ] **Step 1: Write failing tests in `tests/unit/draftMachine.test.ts`**

Add tests asserting:
- Hybrid keeper-openers (e.g., `Adam Gilchrist` / `Jos Buttler` for `Opener` slot, `KL Rahul` for `Wicketkeeper` slot) appear as candidates in `directMatches` while strict primary-role players appear first.
- `Slot 7 (Allrounder)` remains strict primary-role-only (specialist bowlers with `'Allrounder'` in `secondaryRoles`, such as `Ravichandran Ashwin`, do not appear in Slot 7 `directMatches`).
- Fallback Strategies A–D also sort strict primary-role candidates ahead of secondary-role candidates.
- `spinSlotReels` never returns `'1980s'` or `'1990s'` when spinning `'Bangladesh'` or `'Afghanistan'` (run 200 seeded spins covering both).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/draftMachine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement slot role matching, shared `sortCandidatesForSlot`, and era filtering in `src/engine/draftMachine.ts`**

1. Define `const SECONDARY_ALLOWED_SINGLE_ROLES: PlayerRole[] = ['Opener', 'Wicketkeeper', 'Pacer'];`. In `matchesSlotRole`: allow `secondaryRoles` when `!strictPrimary && (slot.eligibleRoles.length > 1 || SECONDARY_ALLOWED_SINGLE_ROLES.includes(slot.eligibleRoles[0]))`, keeping `Allrounder` strict primary-role-only.
2. Extract `sortCandidatesForSlot(candidates: Player[], slot: SlotDefinition): Player[]` (sorting `strictPrimary` first, then `battingRating + bowlingRating` descending) and apply it to `directMatches` AND fallback Strategies A–D in both `getCandidatesForIPL` and `getCandidatesForInternational`.
3. In `spinSlotReels`, when `selectedTeam === 'Bangladesh' || selectedTeam === 'Afghanistan'`, select `era` from `['2000s', '2010s', 'Modern']`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/draftMachine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/draftMachine.ts tests/unit/draftMachine.test.ts
git commit -m "fix(draft): unlock Opener/WK/Pacer secondary roles, sort fallbacks, and filter empty eras"
```

---

### Task 5: Fix `LineupReorderModal` Team Wipe & `useStumpdGame` Spin/Draft Guards

**Files:**
- Modify: `src/components/draft/LineupReorderModal.tsx:21-33`
- Modify: `src/hooks/useStumpdGame.ts:48-50,103-133,204-236,315-330`
- Modify: `tests/components/DraftUI.test.tsx`
- Modify: `tests/unit/gameFlow.test.ts`

**Interfaces:**
- Preserves `LineupReorderModalProps` and `useStumpdGame()` hook interface (plus cleanup refs).

- [ ] **Step 1: Write failing tests in `tests/components/DraftUI.test.tsx` and `tests/unit/gameFlow.test.ts`**

1. In `tests/components/DraftUI.test.tsx`: render `<LineupReorderModal isOpen={false} players={[]} ... />`, then `rerender` with `isOpen={true}` and 11 players; assert all 11 player names render and clicking Confirm calls `onReorder` with all 11 players (not `[]`).
2. In `tests/unit/gameFlow.test.ts`:
   - Calling `draftPlayer` twice with the same player or a 12th time leaves `picks` at unique valid players (`<= 11`).
   - Using `vi.useFakeTimers()` in browser-like timer check (or simulating `spinReels` + `resetGame()`), assert `resetGame()` clears the spin interval so stale `currentTeam` updates do not fire after returning home.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/DraftUI.test.tsx tests/unit/gameFlow.test.ts`
Expected: FAIL (`LineupReorderModal` renders 0 players and passes `[]`; duplicate `draftPlayer` appends duplicate).

- [ ] **Step 3: Fix `LineupReorderModal.tsx` and add interval/race guards in `useStumpdGame.ts`**

1. In `src/components/draft/LineupReorderModal.tsx`: add `React.useEffect(() => { if (isOpen) setOrdered([...players]); }, [isOpen, players]);`.
2. In `src/hooks/useStumpdGame.ts`:
   - Add `spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)` and a helper `clearSpinInterval()`. Clear in `executeSpin` start, `resetGame`, and an unmount `useEffect`.
   - Guard `spinReels` and `mulligan` with `if (isSpinning) return;`.
   - Guard `draftPlayer` with `if (picks.length >= SLOTS.length || picks.some((p) => p.id === player.id)) return;`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/DraftUI.test.tsx tests/unit/gameFlow.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/draft/LineupReorderModal.tsx src/hooks/useStumpdGame.ts tests/components/DraftUI.test.tsx tests/unit/gameFlow.test.ts
git commit -m "fix(draft): sync reorder modal on open and guard spin/draft race conditions"
```

---

### Task 6: Fix Match Simulation Engine, Home Venues, Toss/Chasing & Live Suspense Flow

**Files:**
- Modify: `src/types/tournament.ts:67-78`
- Modify: `src/engine/simulator.ts:11-37,151-394`
- Modify: `src/hooks/useStumpdGame.ts:51-71,245-330,338-375`
- Modify: `src/components/match/MatchScreen.tsx:10-116`
- Modify: `src/components/match/BoxScoreCard.tsx:127-149`
- Modify: `src/App.tsx:48-71,260-273`
- Modify: `tests/unit/simulator.test.ts`
- Modify: `tests/components/MatchUI.test.tsx`
- Modify: `tests/unit/gameFlow.test.ts`

**Interfaces:**
- Produces:
  - `getMatchOpponentAndVenue(matchIndex: number, opponents: OpponentTeam[]): { opponent: OpponentTeam; venue: Venue }` exported from `src/engine/simulator.ts`.
  - `simulateMatch(userXI: Player[], opponent: OpponentTeam, venue: Venue, captainId?: string, rng?: () => number, userBatsFirst?: boolean): MatchResult` with `userBowling?: PlayerPerformance[]`, `opponentBowling?: PlayerPerformance[]`, `userBatsFirst?: boolean` on `MatchResult`.
  - `tossOutcome: { winner: string; decision: 'bat' | 'bowl'; userBatsFirst: boolean }` and `skipSimulation: () => void` returned by `useStumpdGame()` (and accepted as optional props `tossOutcome?: ...`, `onSkipSimulation?: () => void` on `MatchScreenProps` with `{ winner: 'User XI', decision: 'bat', userBatsFirst: true }` fallback so standalone renders remain compatible).

- [ ] **Step 1: Write failing tests in `tests/unit/simulator.test.ts`, `tests/components/MatchUI.test.tsx`, and `tests/unit/gameFlow.test.ts`**

1. `tests/unit/simulator.test.ts`:
   - Assert opponent captain receives +10% boost (`calculatePitchAdjustedRatings(opp.players, venue, opp.captain)` boosts the matching player by name).
   - Assert batters with `bowlingRating < 60` (`Virat Kohli`, `Rahul Dravid`) return `false` for `isSpinner` and `isPacer`.
   - Assert `getMatchOpponentAndVenue(1, IPL_OPPONENTS)` resolves `2011 CSK` at `Chepauk` (`chepauk`), not `Lord's`.
   - Assert `simulateMatch(..., userBatsFirst = false)` sets `userScore.overs <= 20`, produces wicket margin on win or run margin on loss, total `ballsFaced <= 120`, batting sum equals innings total, and includes `userBowling` / `opponentBowling`.
2. `tests/components/MatchUI.test.tsx`:
   - Pass `onSkip` and assert `LiveSimProgress` receives it when `isSimulating={true}`; expand detailed scorecard in `BoxScoreCard` and assert both `User XI` and opponent batting/bowling render; assert `TossBanner` reflects chasing when `tossOutcome.userBatsFirst === false`.
3. `tests/unit/gameFlow.test.ts`:
   - Assert `skipSimulation` resolves a pending browser simulation cleanly and `resetGame` cancels pending `simTimeoutRef`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/simulator.test.ts tests/components/MatchUI.test.tsx tests/unit/gameFlow.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement simulator fixes, shared venue lookup, scorecard tables, and live suspense timing**

1. In `src/types/tournament.ts`: add optional `userBowling?: PlayerPerformance[]`, `opponentBowling?: PlayerPerformance[]`, and `userBatsFirst?: boolean` to `MatchResult`.
2. In `src/engine/simulator.ts`:
   - `isSpinner` / `isPacer`: require `player.primaryRole === 'Spinner'` / `'Pacer'` OR (`player.bowlingRating >= 60` and matching `bowlingType`).
   - `calculatePitchAdjustedRatings`: match captain with `captainId && (player.id === captainId || player.name === captainId)`.
   - Export `getMatchOpponentAndVenue(matchIndex, opponents)` looking up `VENUES.find((v) => v.id === opponent.venueId) || VENUES[matchIndex % VENUES.length]`.
   - `distributeBattingRuns`: cap intermediate `runs` at `Math.max(0, totalRuns - runsAssigned)` so sums equal `totalRuns`; scale `ballsFaced` proportionally down if total > `120`.
   - `simulateMatch`: accept `userBatsFirst` (default `rng() < 0.5`), pass `isChasing = !userBatsFirst` for user and `isChasing = userBatsFirst` for opponent, align win/loss margin (`runs` when defending, `wickets` when chasing), convert `ballsLeft` into cricket overs format (e.g. `Math.floor((120 - ballsLeft) / 6) + ((120 - ballsLeft) % 6) / 10`) on the chasing innings, and return `userBowling`, `opponentBowling`, `userBatsFirst`.
3. In `src/hooks/useStumpdGame.ts` and `src/App.tsx`:
   - Use `getMatchOpponentAndVenue(currentMatchIndex, activeOpponents)` in both places (eliminating `selectedOpponent`/`selectedVenue` stale Match-1 state).
   - Compute deterministic/RNG `tossOutcome` for the current match (`userBatsFirst = getRng()() < 0.5` stored per fixture index), pass `tossOutcome` into `MatchScreen` -> `TossBanner`.
   - Add `simTimeoutRef` + `pendingSimRef` so `playCurrentMatch` holds `isSimulating = true` for `1800ms` in browser mode (instant in Vitest) and `skipSimulation()` commits immediately; clear `simTimeoutRef` in `resetGame` and on unmount.
4. In `src/components/match/MatchScreen.tsx` & `src/components/match/BoxScoreCard.tsx`:
   - Wire `onSkip={onSkipSimulation}` to `LiveSimProgress` and render `tossOutcome` in `TossBanner`.
   - Render `userScorecard`, `userBowling`, `opponentScorecard`, and `opponentBowling` in `BoxScoreCard`'s detailed toggle view.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/simulator.test.ts tests/components/MatchUI.test.tsx tests/unit/gameFlow.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/tournament.ts src/engine/simulator.ts src/hooks/useStumpdGame.ts src/components/match/MatchScreen.tsx src/components/match/BoxScoreCard.tsx src/App.tsx tests/unit/simulator.test.ts tests/components/MatchUI.test.tsx tests/unit/gameFlow.test.ts
git commit -m "fix(match): add opponent captain boost, home venues, toss/chasing accuracy, and live suspense timer"
```

---

### Task 7: Fix Campaign MVP, Near-Miss `5-1`/`6-1` Labels, Share URLs & `og-image` Asset

**Files:**
- Modify: `src/components/results/ResultsScreen.tsx:38-47,108-174`
- Modify: `src/components/results/TrophyHero.tsx:16-100`
- Modify: `src/utils/share.ts:3-47,65-69,159`
- Modify: `public/og-image.svg:37-39`
- Regenerate: `public/og-image.png`
- Modify: `tests/components/heartbreak.test.tsx`
- Modify: `tests/unit/share.test.ts`

**Interfaces:**
- Preserves `TrophyHeroProps` and `formatEmojiGrid` signature.

- [ ] **Step 1: Write failing tests in `tests/components/heartbreak.test.tsx` and `tests/unit/share.test.ts`**

1. In `tests/components/heartbreak.test.tsx`:
   - Test `6-1` Final loss (`[T,T,T,T,T,T,F]`) shows `"One Win From Immortality!"`, `"The Match That Broke Perfection"`, and `"6 Wins • 1 Loss"` (singular).
   - Test `5-1` Semi-Final loss (`[T,T,T,T,T,F]`) shows `"Semi-Final Exit (5-1)"` and does **not** contain `"One Win From Immortality!"` or `"6-1"`.
   - Test `4-1` (`[T,T,T,T,F]`) shows neither Heartbreak nor Semi-Final Exit card.
   - Verify `ResultsScreen` share click calls `formatEmojiGrid` with `synergiesActive > 0` when synergies exist and never picks an opponent ID as MVP.
2. In `tests/unit/share.test.ts`:
   - Assert `formatEmojiGrid([T,T,T,T,T,T,F], 'International', 90)` contains `'🥈 Finalists (6-1 Heartbreak)'` (never `'Champions'`).
   - Assert `formatEmojiGrid([T,T,T,T,T,F], 'IPL', 88)` contains `'🥈 Finalists'` (not `'6-1 Heartbreak'`).
   - Assert `shareCampaignResult` fallback URL when `window.location.origin` is `'null'` uses `'https://stumpd-app.vercel.app'`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/heartbreak.test.tsx tests/unit/share.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement results/share fixes and regenerate `public/og-image.png`**

1. In `src/components/results/ResultsScreen.tsx`:
   - Split `isFinalHeartbreak = !isChampion && winsCount === 6 && totalMatches === 7` and `isSemiFinalExit = !isChampion && winsCount === 5 && totalMatches === 6`; update near-miss card title accordingly (`"The Match That Broke Perfection"` vs `"Semi-Final Exit (5-1)"`).
   - Aggregate `runs + 25 * wickets` across `matchResults` restricted to `userIds = new Set(userXI.map((p) => p.id))` (reading `userScorecard` + `topPerformers` for user players) to compute true user campaign MVP, and pass `Math.round(teamScore.synergyPoints / 30)` as the 6th argument to `formatEmojiGrid`.
2. In `src/components/results/TrophyHero.tsx`:
   - Set `isNearMiss = !isChampion && winsCount === 6 && totalMatches === 7`; treat `winsCount === 5 && totalMatches === 6` as `isFinalist`.
   - Format losses as `${lossesCount} ${lossesCount === 1 ? 'Loss' : 'Losses'}`.
3. In `src/utils/share.ts`:
   - Update `formatEmojiGrid`: `wins === 7 && total === 7` → `'🏆 INVINCIBLE 7-0 Champions'`; `wins === 6 && total === 7 && !wonFinal` → `'🥈 Finalists (6-1 Heartbreak)'`; `wonFinal && wins >= 5` → `'🏆 Champions'`; `wins >= 4` → `'🥈 Finalists'`; else `'🏏 Campaign Completed'`.
   - Replace `'https://stumpd.pages.dev'` with `'https://stumpd-app.vercel.app'` and canvas footer `'stumpd.app • ...'` with `'stumpd-app.vercel.app • 11-Slot Tactical Cricket Drafting'`.
4. Update `public/og-image.svg` line 38 to `"Conquer historic dynasties in a tactical T20 gauntlet."` (font-size `22`, clearly left of `x=890`) and re-render `public/og-image.png` via `rsvg-convert -w 1200 -h 630 public/og-image.svg -o public/og-image.png`.

- [ ] **Step 4: Run tests and visually verify `public/og-image.png`**

Run: `npx vitest run tests/components/heartbreak.test.tsx tests/unit/share.test.ts` and inspect `public/og-image.png`.
Expected: PASS and zero text overlap in `public/og-image.png`.

- [ ] **Step 5: Commit**

```bash
git add src/components/results/ResultsScreen.tsx src/components/results/TrophyHero.tsx src/utils/share.ts public/og-image.svg public/og-image.png tests/components/heartbreak.test.tsx tests/unit/share.test.ts
git commit -m "fix(results): fix user-only MVP, 5-1/6-1 heartbreak labels, share URLs, and OG banner"
```

---

### Task 8: Tailwind Tokens, Accessibility, Dead-Code Cleanup & Full `AppFlow` Integration Test

**Files:**
- Modify: `tailwind.config.js:10-28`
- Modify: `index.html:6`
- Modify: `src/App.tsx:1-306`
- Modify: `src/components/home/HomeScreen.tsx:24-36`
- Modify: `src/types/game.ts:28`
- Modify: `src/hooks/useStumpdGame.ts` (remove `proceedFromSetupToDraft` / unused setup state)
- Delete: `src/components/setup/MatchSetupScreen.tsx`, `tests/components/MatchSetupScreen.test.tsx`, `src/hooks/useAudio.ts`
- Modify: `package.json`, `package-lock.json` (uninstall `canvas-confetti`, `@types/canvas-confetti`, `lucide-react`)
- Modify: `.gitignore` + untrack `scratch/` (`git rm -r --cached scratch`)
- Create: `tests/components/AppFlow.test.tsx`

**Interfaces:**
- Simplifies `GamePhase` to `'home' | 'draft' | 'lineup' | 'match' | 'results'`.

- [ ] **Step 1: Write failing integration test in `tests/components/AppFlow.test.tsx`**

Create `tests/components/AppFlow.test.tsx` rendering `<App />`:
- Click `Play International Tour`, spin and draft 11 slots (handling `isSpinning` synchronously under Vitest), open `Adjust Lineup & Captain` modal (`LineupReorderModal`), assert all 11 players appear, move Slot 1 down, click `Confirm Starting XI`, verify picks stay length 11 and order updated, click `Enter Tournament Campaign`, play Match 1, proceed through results (mocking `/api/submit-score` to verify both failure retry and success states).

- [ ] **Step 2: Run test to verify setup cleanup / full flow assertions**

Run: `npx vitest run tests/components/AppFlow.test.tsx`
Expected: PASS or reveal any integration wiring gap in `App.tsx`.

- [ ] **Step 3: Apply styling tokens, accessibility fix, dead-code deletion, and package/git cleanup**

1. Add `500: '#3D705C'` under `turf` and `200: '#FDE68A'` under `gold` in `tailwind.config.js`.
2. Update `index.html` viewport meta tag to `content="width=device-width, initial-scale=1.0"`.
3. Remove `HomeScreen.tsx` redundant top sound bar (`L24-36`) and `isMuted`/`onToggleMute` props if no longer used, and remove duplicate `trackEvent('mute_toggled', ...)` in `App.tsx:L118`.
4. Remove `'match-setup'` phase from `src/types/game.ts`, `<MatchSetupScreen>` branch/import from `src/App.tsx`, and `proceedFromSetupToDraft` from `src/hooks/useStumpdGame.ts`; delete `src/components/setup/MatchSetupScreen.tsx`, `tests/components/MatchSetupScreen.test.tsx`, and `src/hooks/useAudio.ts`.
5. Run `npm uninstall canvas-confetti @types/canvas-confetti lucide-react`.
6. Add `scratch/` to `.gitignore` and run `git rm -r --cached scratch`.

- [ ] **Step 4: Run full verification suite (`npm run build && npm test`)**

Run: `npm run build && npm test`
Expected: `tsc && vite build` succeeds cleanly with zero errors, and all test files pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(cleanup): fix tokens, zoom a11y, remove dead code/packages, and add AppFlow E2E test"
```
