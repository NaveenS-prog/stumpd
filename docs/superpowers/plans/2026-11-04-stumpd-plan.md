# Stumpd Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade, mobile-first cricket drafting and tournament strategy web app (Stumpd) featuring a 500+ player database, interactive 11-slot tactical drafting with mulligans, a match-by-match tournament simulation engine against iconic historical squads with venue pitch counterplay, procedural Web Audio effects, and shareable results.

**Architecture:** Client-first modular SPA built with React 18/19, TypeScript, and Tailwind CSS. A deterministic state machine (`draftMachine.ts`) manages slot drafting, reel spinning, and candidate fallbacks. A tactical simulation engine (`simulator.ts`) calculates pitch-adjusted ratings ($BAR$ and $BOR$) across 7 sequential tournament fixtures against curated historical opponents (`opponents.ts`). A Web Audio synthesizer (`audio.ts`) generates zero-dependency audio effects.

**Tech Stack:** React 19, TypeScript 5+, Vite 6, Tailwind CSS 3/4, Lucide React, Vitest, HTML5 Web Audio API, HTML5 Canvas.

**Spec:** [`/home/naveen/Projects/stumpd/docs/superpowers/specs/2026-11-04-stumpd-design.md`](file:///home/naveen/Projects/stumpd/docs/superpowers/specs/2026-11-04-stumpd-design.md)

---

## Global Constraints
- Target workspace repository: `/home/naveen/Projects/stumpd`.
- Zero external audio files: all sounds must use procedural Web Audio API oscillators/noise buffers.
- Offline and client-side self-containment: no backend server dependencies; runs as a pure static web app.
- Mobile-first responsive touch layout with dark midnight turf aesthetic (`#0A1813`, `#12261E`, `#E5A93B`).
- Guaranteed draft candidate generation: no spin may ever yield 0 candidates.

---

## Review Focus
1. **Empty Candidate Pool Handling:** If a rare Team and Era combination has no direct role match in `players.json`, the fallback engine must guarantee at least 1 valid candidate without throwing or stranding the user.
2. **Extreme Pitch Multipliers:** Verify that extreme pitch types (e.g. +20% bowling boost on dustbowls/green seamers) do not produce negative scores or broken percentages (>100% or <0%).
3. **Daily Seed Determinism Across Days:** Changing the calendar date must produce a distinctly different sequence of 11 slot reels, but the exact same seed must reproduce the identical sequence for every run.
4. **Lineup Reorder Integrity:** Swapping batting order positions (1 through 11) must preserve all 11 drafted players without duplicates, missing slots, or losing captain designation.
5. **Web Audio Silent Context Initialization:** AudioContext must initialize on user interaction without browser auto-play policy exceptions and respect the global mute flag at all times.

---

## Tasks

### Task 1: Project Scaffolding & Build Configuration

**Files:**
- Create: `/home/naveen/Projects/stumpd/package.json`
- Create: `/home/naveen/Projects/stumpd/tsconfig.json`
- Create: `/home/naveen/Projects/stumpd/vite.config.ts`
- Create: `/home/naveen/Projects/stumpd/tailwind.config.js`
- Create: `/home/naveen/Projects/stumpd/postcss.config.js`
- Create: `/home/naveen/Projects/stumpd/index.html`
- Create: `/home/naveen/Projects/stumpd/src/index.css`
- Create: `/home/naveen/Projects/stumpd/tests/setup.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/scaffold.test.ts`

**Interfaces:**
- Consumes: None (initial setup)
- Produces: Runnable Vite dev server and Vitest test runner configuration

- [ ] **Step 1: Write the failing test**
Create `tests/unit/scaffold.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('Project Scaffolding', () => {
  it('verifies environment and test runner execution', () => {
    const appName = 'Stumpd';
    expect(appName).toBe('Stumpd');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/scaffold.test.ts`
Expected: FAIL (package or vitest not installed/configured yet).

- [ ] **Step 3: Scaffold Vite + React + TypeScript + Tailwind + Vitest**
Initialize `package.json` with `react`, `react-dom`, `lucide-react`, `tailwindcss`, `vite`, `vitest`, `@testing-library/react`, and configure `vite.config.ts`, `tailwind.config.js`, and `src/index.css` with the Stumpd turf palette. Install dependencies via `npm install`.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/scaffold.test.ts`
Expected: PASS with 1 passed test.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git init
git add .
git commit -m "chore: scaffold Vite, TypeScript, Tailwind, and Vitest test suite"
```

---

### Task 2: Data Models & Expanded 500+ Player Roster

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/types/player.ts`
- Create: `/home/naveen/Projects/stumpd/src/types/game.ts`
- Create: `/home/naveen/Projects/stumpd/src/types/tournament.ts`
- Create: `/home/naveen/Projects/stumpd/src/data/teams.ts`
- Create: `/home/naveen/Projects/stumpd/src/data/slots.ts`
- Create: `/home/naveen/Projects/stumpd/src/data/venues.ts`
- Create: `/home/naveen/Projects/stumpd/src/data/opponents.ts`
- Create: `/home/naveen/Projects/stumpd/src/data/players.json`
- Test: `/home/naveen/Projects/stumpd/tests/unit/rosterData.test.ts`

**Interfaces:**
- Consumes: Type contracts from Section 5.2 & 5.3 of the spec
- Produces: `Player`, `Team`, `SlotDefinition`, `Venue`, `OpponentTeam`, and `PLAYERS_DB` dataset

- [ ] **Step 1: Write the failing test**
Create `tests/unit/rosterData.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import playersData from '../../src/data/players.json';
import { SLOTS } from '../../src/data/slots';
import { TEAMS } from '../../src/data/teams';
import { OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';

describe('Player & Tournament Datasets', () => {
  it('contains at least 500 valid player entries with dual ratings', () => {
    expect(playersData.length).toBeGreaterThanOrEqual(500);
    for (const p of playersData) {
      expect(p.id).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.battingRating).toBeGreaterThanOrEqual(40);
      expect(p.battingRating).toBeLessThanOrEqual(99);
      expect(p.bowlingRating).toBeGreaterThanOrEqual(20);
      expect(p.bowlingRating).toBeLessThanOrEqual(99);
      expect(['Right', 'Left']).toContain(p.battingHand);
      expect(p.eras.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('defines 11 valid batting slots and 7 curated historical opponents', () => {
    expect(SLOTS.length).toBe(11);
    expect(OPPONENTS.length).toBe(7);
    expect(VENUES.length).toBeGreaterThanOrEqual(7);
    expect(TEAMS.length).toBeGreaterThanOrEqual(20); // 10 Nations + 10 IPL Teams
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/rosterData.test.ts`
Expected: FAIL with missing modules.

- [ ] **Step 3: Implement schemas and populate datasets**
Create `src/types/player.ts`, `src/types/game.ts`, `src/types/tournament.ts`, `src/data/teams.ts`, `src/data/slots.ts`, `src/data/venues.ts`, `src/data/opponents.ts`, and populate `src/data/players.json` with 500+ cricketers with authentic ratings, roles, and eras across India, Australia, England, WI, Pakistan, SA, NZ, Sri Lanka, Bangladesh, Afghanistan, and all 10 IPL franchises (MI, CSK, RCB, KKR, RR, SRH, DC, PK, LSG, GT).

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/rosterData.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/types src/data tests/unit/rosterData.test.ts
git commit -m "feat: add player, team, slot, venue, and 500+ player roster dataset"
```

---

### Task 3: Procedural Web Audio Sound Synthesizer

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/engine/audio.ts`
- Create: `/home/naveen/Projects/stumpd/src/hooks/useAudio.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/audio.test.ts`

**Interfaces:**
- Consumes: HTML5 Web Audio API
- Produces: `playReelTick(pitchOffset)`, `playCardPick()`, `playBatCrack()`, `playVictoryFanfare()`, `playLossSting()`, `setMuted(muted)`, `isMuted()`

- [ ] **Step 1: Write the failing test**
Create `tests/unit/audio.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { soundEngine } from '../../src/engine/audio';

describe('Web Audio Synthesizer', () => {
  beforeEach(() => {
    soundEngine.setMuted(false);
  });

  it('respects mute state and does not throw when playing sound effects', () => {
    expect(soundEngine.isMuted()).toBe(false);
    soundEngine.setMuted(true);
    expect(soundEngine.isMuted()).toBe(true);

    // Audio calls must not throw even if Web Audio is mocked or muted
    expect(() => soundEngine.playReelTick(1)).not.toThrow();
    expect(() => soundEngine.playBatCrack()).not.toThrow();
    expect(() => soundEngine.playVictoryFanfare()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/audio.test.ts`
Expected: FAIL with "soundEngine not defined".

- [ ] **Step 3: Implement procedural Web Audio engine**
In `src/engine/audio.ts`, implement a zero-external-dependency sound generator using `AudioContext` oscillators (sine/square/triangle) and white noise buffer decay for the bat crack, with volume gating and local storage persistence. Handle browser autoplay policies gracefully.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/audio.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/engine/audio.ts src/hooks/useAudio.ts tests/unit/audio.test.ts
git commit -m "feat: implement procedural Web Audio synthesizer with mute toggle"
```

---

### Task 4: Drafting Engine, Slot Validation, & Smart Fallback

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/engine/draftMachine.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/draftMachine.test.ts`

**Interfaces:**
- Consumes: `Player`, `SlotDefinition`, `PLAYERS_DB`, `teams.ts`
- Produces: `filterCandidates(slot, team, era, currentPicks)`, `spinSlotReels(slotIndex, prng?)`, `resolveSmartFallback(slot, team, era, currentPicks)`

- [ ] **Step 1: Write the failing test**
Create `tests/unit/draftMachine.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { draftMachine } from '../../src/engine/draftMachine';
import { SLOTS } from '../../src/data/slots';

describe('Draft Machine & Candidate Resolution', () => {
  it('filters eligible players for a slot and avoids duplicate selections', () => {
    const slot1 = SLOTS[0]; // Opener 1
    const candidates = draftMachine.getCandidatesForSlot(slot1, 'India', '2000s', []);
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    candidates.forEach(c => {
      expect(['Opener']).toContain(c.primaryRole);
    });

    // If Sachin is already picked, he cannot appear in candidates again
    const firstPick = candidates[0];
    const nextCandidates = draftMachine.getCandidatesForSlot(SLOTS[1], 'India', '2000s', [firstPick]);
    expect(nextCandidates.some(c => c.id === firstPick.id)).toBe(false);
  });

  it('guarantees valid candidate through smart fallback when combination is sparse', () => {
    // Spinner slot with an IPL team in 1980s (IPL did not exist in 1980s)
    const spinnerSlot = SLOTS[8];
    const fallbackCandidates = draftMachine.getCandidatesForSlot(spinnerSlot, 'CSK', '1980s', []);
    expect(fallbackCandidates.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/draftMachine.test.ts`
Expected: FAIL with "draftMachine not defined".

- [ ] **Step 3: Implement candidate filtering and smart fallback algorithms**
In `src/engine/draftMachine.ts`, filter `players.json` by team, era, slot role, and exclude already picked players. If count is 0, activate fallback heuristics: search adjacent era, search national counterpart for franchise, or select an iconic historical player matching the slot role.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/draftMachine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/engine/draftMachine.ts tests/unit/draftMachine.test.ts
git commit -m "feat: implement draft candidate filtering and guaranteed fallback engine"
```

---

### Task 5: Tactical Pitch Counterplay & Match Simulation Engine

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/engine/simulator.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/simulator.test.ts`

**Interfaces:**
- Consumes: User `DraftPick[]`, `OpponentTeam`, `Venue`, `captainId`
- Produces: `simulateMatch(userXI, opponent, venue, captainId, prng?) -> MatchResult`, `calculatePitchAdjustedRatings(players, venue)`

- [ ] **Step 1: Write the failing test**
Create `tests/unit/simulator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { simulateMatch, calculatePitchAdjustedRatings } from '../../src/engine/simulator';
import { OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';
import playersData from '../../src/data/players.json';

describe('Tactical Match Simulation Engine', () => {
  const sampleUserXI = playersData.slice(0, 11);
  const dustbowlVenue = VENUES.find(v => v.pitchType === 'Dustbowl')!;
  const greenSeamerVenue = VENUES.find(v => v.pitchType === 'GreenSeamer')!;

  it('boosts spinners on dustbowls and pacers on green seamers', () => {
    const dustbowlAdj = calculatePitchAdjustedRatings(sampleUserXI, dustbowlVenue);
    const seamerAdj = calculatePitchAdjustedRatings(sampleUserXI, greenSeamerVenue);

    const spinner = sampleUserXI.find(p => p.primaryRole === 'Spinner')!;
    const pacer = sampleUserXI.find(p => p.primaryRole === 'Pacer')!;

    if (spinner) {
      expect(dustbowlAdj.bowlingRatings[spinner.id]).toBeGreaterThan(seamerAdj.bowlingRatings[spinner.id]);
    }
    if (pacer) {
      expect(seamerAdj.bowlingRatings[pacer.id]).toBeGreaterThan(dustbowlAdj.bowlingRatings[pacer.id]);
    }
  });

  it('produces complete match results with scorecards and realistic totals', () => {
    const opp = OPPONENTS[0];
    const result = simulateMatch(sampleUserXI, opp, dustbowlVenue, sampleUserXI[0].id);

    expect(typeof result.won).toBe('boolean');
    expect(result.userScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.userScore.wickets).toBeLessThanOrEqual(10);
    expect(result.opponentScore.runs).toBeGreaterThanOrEqual(100);
    expect(result.topPerformers.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/simulator.test.ts`
Expected: FAIL with "simulateMatch not defined".

- [ ] **Step 3: Implement tactical simulation engine**
Implement `calculatePitchAdjustedRatings` using venue pitch modifiers. Compute Team Performance Score ($TPS$) based on pitch-adjusted batting/bowling ratings, team balance bonuses, and captain bonuses. Implement the logistic win probability formula and generate realistic box score figures and key moments.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/simulator.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/engine/simulator.ts tests/unit/simulator.test.ts
git commit -m "feat: implement tactical pitch matchup calculations and match simulation engine"
```

---

### Task 6: Deterministic Daily Seed Engine & Local Storage Tracker

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/engine/dailySeed.ts`
- Create: `/home/naveen/Projects/stumpd/src/utils/storage.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/dailySeed.test.ts`

**Interfaces:**
- Consumes: JavaScript `Date` and `localStorage`
- Produces: `getDailySeed(dateStr?: string)`, `createSeededRandom(seed: number)`, `saveGameResult(result)`, `getGameStats()`, `isDailyCompletedToday()`

- [ ] **Step 1: Write the failing test**
Create `tests/unit/dailySeed.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { getDailySeed, createSeededRandom, getDailyDateString } from '../../src/engine/dailySeed';

describe('Daily Seed & Deterministic PRNG', () => {
  it('generates reproducible pseudo-random numbers from the same calendar date seed', () => {
    const seed1 = getDailySeed('2026-11-04');
    const seed2 = getDailySeed('2026-11-04');
    expect(seed1).toBe(seed2);

    const prngA = createSeededRandom(seed1);
    const prngB = createSeededRandom(seed2);

    for (let i = 0; i < 20; i++) {
      expect(prngA()).toBeCloseTo(prngB(), 6);
    }
  });

  it('produces distinct seeds for different dates', () => {
    const seedToday = getDailySeed('2026-11-04');
    const seedTomorrow = getDailySeed('2026-11-05');
    expect(seedToday).not.toBe(seedTomorrow);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/dailySeed.test.ts`
Expected: FAIL with "getDailySeed not defined".

- [ ] **Step 3: Implement seeded PRNG (MurmurHash3 / Mulberry32) and storage tracker**
In `src/engine/dailySeed.ts`, implement date-string hashing and Mulberry32 PRNG. In `src/utils/storage.ts`, implement typed helpers to save completed runs, tournament streaks, wins/losses, and daily attempt locking.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/dailySeed.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/engine/dailySeed.ts src/utils/storage.ts tests/unit/dailySeed.test.ts
git commit -m "feat: implement deterministic daily seed generator and local storage tracker"
```

---

### Task 7: UI Components — Wheels, Candidates, Team Sheet & Lineup Reorder

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/components/draft/SlotProgress.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/draft/SpinWheels.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/draft/CandidateList.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/draft/CandidateCard.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/draft/TeamSheet.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/draft/LineupReorderModal.tsx`
- Test: `/home/naveen/Projects/stumpd/tests/components/DraftUI.test.tsx`

**Interfaces:**
- Consumes: `useStumpdGame` hook, `SlotDefinition`, `Player`, `DraftPick`
- Produces: Interactive drafting screen components with reel ticking and card selection

- [ ] **Step 1: Write the failing test**
Create `tests/components/DraftUI.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TeamSheet } from '../../src/components/draft/TeamSheet';
import { SLOTS } from '../../src/data/slots';
import playersData from '../../src/data/players.json';

describe('Draft UI Components', () => {
  it('renders all 11 slots and displays picked players with dual ratings', () => {
    const picks = [playersData[0]]; // Opener 1 picked
    render(
      <TeamSheet
        slots={SLOTS}
        picks={picks}
        currentSlotIndex={1}
        captainId={picks[0].id}
        onSelectCaptain={vi.fn()}
      />
    );

    expect(screen.getByText(picks[0].name)).toBeDefined();
    expect(screen.getByText(SLOTS[1].name)).toBeDefined(); // Slot 2 empty placeholder
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/components/DraftUI.test.tsx`
Expected: FAIL with "TeamSheet not defined".

- [ ] **Step 3: Implement drafting UI components**
Create `SlotProgress`, `SpinWheels` (with CSS ticker animation), `CandidateCard` (displaying handedness, bowling style, dual ratings), `CandidateList`, `TeamSheet`, and `LineupReorderModal` (supporting reordering and captain selection).

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/components/DraftUI.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/components/draft tests/components/DraftUI.test.tsx
git commit -m "feat: build drafting UI components with wheels, candidate cards, and team sheet"
```

---

### Task 8: UI Components — Fixture Preview, Toss, Box Score & Match Screen

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/components/match/FixturePreview.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/match/PitchCard.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/match/TossBanner.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/match/LiveSimProgress.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/match/BoxScoreCard.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/match/MatchScreen.tsx`
- Test: `/home/naveen/Projects/stumpd/tests/components/MatchUI.test.tsx`

**Interfaces:**
- Consumes: `MatchResult`, `Venue`, `OpponentTeam`, `DraftPick[]`
- Produces: Match-by-match interactive tournament screen and tactical counterplay UI

- [ ] **Step 1: Write the failing test**
Create `tests/components/MatchUI.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PitchCard } from '../../src/components/match/PitchCard';
import { VENUES } from '../../src/data/venues';

describe('Match UI Components', () => {
  it('renders pitch condition details and tactical boosts', () => {
    const venue = VENUES[0];
    render(<PitchCard venue={venue} />);
    expect(screen.getByText(venue.name)).toBeDefined();
    expect(screen.getByText(venue.pitchDescription)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/components/MatchUI.test.tsx`
Expected: FAIL with "PitchCard not defined".

- [ ] **Step 3: Implement Match UI components**
Create `FixturePreview` displaying opponent threat ratings, `PitchCard` displaying tactical modifiers, `TossBanner`, `LiveSimProgress` with cricket ball rotation and commentary pulses, and `BoxScoreCard` presenting runs, wickets, and individual performances.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/components/MatchUI.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/components/match tests/components/MatchUI.test.tsx
git commit -m "feat: build match-by-match interactive campaign screens and scorecard components"
```

---

### Task 9: Home Screen, Results Podium & Social Sharing

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/components/home/HomeScreen.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/results/ResultsScreen.tsx`
- Create: `/home/naveen/Projects/stumpd/src/components/results/TrophyHero.tsx`
- Create: `/home/naveen/Projects/stumpd/src/utils/share.ts`
- Test: `/home/naveen/Projects/stumpd/tests/unit/share.test.ts`

**Interfaces:**
- Consumes: Tournament completion record, `localStorage` stats
- Produces: Home mode picker, trophy celebration, HTML5 Canvas visual card generator, and copyable emoji grid

- [ ] **Step 1: Write the failing test**
Create `tests/unit/share.test.ts`:
```typescript
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
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/share.test.ts`
Expected: FAIL with "formatEmojiGrid not defined".

- [ ] **Step 3: Implement Home, Results, and Canvas Share generator**
Implement `HomeScreen` with mode selection (Spin Mode, Daily Stumpd, Practice), `ResultsScreen` with `TrophyHero` (Champions / Finalists / Valiant Effort) and MVP spotlight. In `src/utils/share.ts`, implement `formatEmojiGrid` and canvas-based image export of the user's Playing XI.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/share.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/components/home src/components/results src/utils/share.ts tests/unit/share.test.ts
git commit -m "feat: implement home mode picker, tournament results screen, and social share generator"
```

---

### Task 10: Reactive Game State Controller & End-to-End Integration

**Files:**
- Create: `/home/naveen/Projects/stumpd/src/hooks/useStumpdGame.ts`
- Modify: `/home/naveen/Projects/stumpd/src/App.tsx`
- Test: `/home/naveen/Projects/stumpd/tests/unit/gameFlow.test.ts`

**Interfaces:**
- Consumes: All engines (`draftMachine`, `simulator`, `dailySeed`, `audio`) and UI components
- Produces: Integrated top-level application managing complete player lifecycle from Home $\rightarrow$ Draft $\rightarrow$ Match Campaign $\rightarrow$ Results

- [ ] **Step 1: Write the failing test**
Create `tests/unit/gameFlow.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStumpdGame } from '../../src/hooks/useStumpdGame';

describe('Game State Flow Integration', () => {
  it('manages draft lifecycle through all 11 slots and into tournament fixtures', () => {
    const { result } = renderHook(() => useStumpdGame());
    expect(result.current.screen).toBe('home');

    act(() => {
      result.current.startMode('spin');
    });
    expect(result.current.screen).toBe('draft');
    expect(result.current.currentSlotIndex).toBe(0);
    expect(result.current.mulligansRemaining).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/gameFlow.test.ts`
Expected: FAIL with "useStumpdGame not defined".

- [ ] **Step 3: Implement useStumpdGame controller and connect App.tsx**
Assemble the centralized reactive state hook in `src/hooks/useStumpdGame.ts` wiring up drafting, candidate selection, mulligans, lineup reordering, match-by-match tournament stepping, and sound effects. Connect it seamlessly to `src/App.tsx` with top navbar, audio toggle, and footer.

- [ ] **Step 4: Run test to verify it passes**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run tests/unit/gameFlow.test.ts`
Expected: PASS.

- [ ] **Step 5: Run full test suite to verify whole-branch green status**
Run: `cd /home/naveen/Projects/stumpd && npx vitest run`
Expected: All tests PASS across the entire project.

- [ ] **Step 6: Build verification**
Run: `cd /home/naveen/Projects/stumpd && npm run build`
Expected: Vite production bundle builds cleanly with zero TypeScript or styling errors.

- [ ] **Step 7: Commit**
```bash
cd /home/naveen/Projects/stumpd
git add src/hooks/useStumpdGame.ts src/App.tsx tests/unit/gameFlow.test.ts
git commit -m "feat: complete end-to-end game state controller integration and verify production build"
```
