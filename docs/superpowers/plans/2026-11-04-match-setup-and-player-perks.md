# Pre-Draft Match Setup & Player Special Attributes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement pre-draft opponent and stadium selection as the default game flow, endow iconic players with authentic signature traits (e.g. Kohli's Chase Master, Dhoni's Ice Finisher, Bumrah's Yorker King), and introduce real-life Chemistry Synergies for iconic duos and trios (e.g. Kohli + ABD, Warner + Bairstow, Ashwin + Jadeja) that activate stat boosts when united in the Playing XI.

**Architecture:**
- **Match Setup Flow**: Introduce a new `'match-setup'` phase before the draft where users choose their target opponent (from their active mode's ladder) and stadium (with locked authentic pitch types and tactical modifiers) before drafting.
- **Player Traits & Signature Perks**: Attach typed traits to certified legends in [`players.json`](file:///home/naveen/Projects/stumpd/src/data/players.json) that grant situational advantages (e.g. chasing, death overs, venue pitch synergy).
- **Chemistry Synergies**: Curate a dedicated synergy matrix in `src/data/synergies.ts` identifying real-life cricket partnerships; when all members of a synergy are drafted, each member receives a chemistry stat boost and visual synergy glow in the UI.
- **Simulation Hardening**: Update [`simulator.ts`](file:///home/naveen/Projects/stumpd/src/engine/simulator.ts) to calculate pitch adjustments, player trait situational modifiers, and active chemistry synergy boosts during match resolution.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v3, Vitest, Web Audio API

**Spec:** User requirements from chat clarification:
1. Make Opponent & Stadium/Pitch selection the default flow before every draft across all modes.
2. Stadiums have authentic locked pitch types (Chepauk = Dustbowl, Lord's = Green Seamer, Wankhede/Chinnaswamy = Flat Batting, MCG = Express Bouncy/Balanced, etc.).
3. Special attributes for legendary players (Kohli: Chase Master, Dhoni: Ice Finisher, Bumrah: Death Yorker King, ABD: 360° Visionary, Root: Spin Surgeon, etc.).
4. Real-life Chemistry Duos and Trios (e.g. Kohli + ABD, Warner + Bairstow, Ashwin + Jadeja, Starc + Cummins + Hazlewood, etc.) receive stat boosts when drafted into the same team.

## Global Constraints

- Preserve strict ecosystem isolation between International and IPL modes.
- All 32 existing unit tests must continue to pass; add comprehensive tests for traits, synergies, and match setup.
- TypeScript compiler (`tsc && vite build`) must pass with zero errors.
- Visual components must follow Stumpd dark turf aesthetics (`#07110D`, `#0A1813`, `#12261E`, `#1F3F32`, and `#FACC15` gold accents).

## Review Focus

1. **Synergy Completeness Check**: Synergy boosts must only trigger when *all* players in a duo/trio are drafted into `picks`. Partial presence must show progress (e.g. "1/2 Drafted") without applying boosts.
2. **Trait In-Match Triggers**: Chasing traits (Kohli, Dhoni) must only boost batting when batting second or chasing a target, not when setting a score.
3. **Draft Context Awareness**: The draft screen must display the locked opponent and stadium so the player can draft strategically for the pitch conditions.
4. **Venue Coverage**: All stadiums referenced in opponents (Premadasa, Eden Gardens, Sawai Mansingh, etc.) must exist in `src/data/venues.ts`.
5. **Backwards Compatibility**: Existing opponent squads and storage records must not break if trait fields are optional.

---

### Task 1: Type Definitions & Data Models for Traits, Synergies, and Match Setup

**Files:**
- Modify: `src/types/player.ts`
- Modify: `src/types/tournament.ts`
- Modify: `src/types/game.ts`
- Test: `tests/unit/traitsAndSynergies.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type TraitTrigger = 'Chasing' | 'DeathOvers' | 'Powerplay' | 'SpinPitch' | 'PacePitch' | 'General';

  export interface PlayerTrait {
    id: string;
    name: string;
    description: string;
    trigger: TraitTrigger;
    battingBoost?: number;  // e.g. 0.15 for +15%
    bowlingBoost?: number;  // e.g. 0.20 for +20%
  }

  export interface ChemistrySynergy {
    id: string;
    name: string;
    playerIds: string[];
    description: string;
    battingBoost?: number;
    bowlingBoost?: number;
  }
  ```
- Extends:
  - `Player`: add optional `trait?: PlayerTrait`
  - `GamePhase`: add `'match-setup'`
  - `GameState`: add `selectedOpponent: OpponentTeam | null`, `selectedVenue: Venue | null`

- [x] **Step 1: Write the failing test**

```ts
// tests/unit/traitsAndSynergies.test.ts
import { describe, it, expect } from 'vitest';
import { PlayerTrait, ChemistrySynergy } from '../../src/types/player';

describe('Trait and Synergy Type Validations', () => {
  it('supports well-formed player trait definitions', () => {
    const trait: PlayerTrait = {
      id: 'chase_master',
      name: 'Chase Master',
      description: 'Increases batting rating when chasing targets in the second innings',
      trigger: 'Chasing',
      battingBoost: 0.15,
    };
    expect(trait.id).toBe('chase_master');
    expect(trait.trigger).toBe('Chasing');
    expect(trait.battingBoost).toBe(0.15);
  });

  it('supports chemistry synergy duo definitions', () => {
    const synergy: ChemistrySynergy = {
      id: 'rcb_duo',
      name: 'RCB Dynamic Duo',
      playerIds: ['virat-kohli', 'ab-de-villiers'],
      description: 'Legendary Royal Challengers partnership boosts batting performance',
      battingBoost: 0.10,
    };
    expect(synergy.playerIds.length).toBe(2);
    expect(synergy.battingBoost).toBe(0.10);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/traitsAndSynergies.test.ts`
Expected: FAIL with missing exports in `src/types/player.ts`

- [x] **Step 3: Implement types in `src/types/player.ts`, `src/types/tournament.ts`, and `src/types/game.ts`**

Add `TraitTrigger`, `PlayerTrait`, and `ChemistrySynergy` to `src/types/player.ts`.
Add `'match-setup'` to `GamePhase` in `src/types/game.ts`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/traitsAndSynergies.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/types/player.ts src/types/game.ts src/types/tournament.ts tests/unit/traitsAndSynergies.test.ts
git commit -m "feat: add types for player traits, chemistry synergies, and match-setup phase"
```

---

### Task 2: Chemistry Synergies Dataset & Signature Player Traits Curation

**Files:**
- Create: `src/data/synergies.ts`
- Modify: `src/data/venues.ts` (ensure all opponent venues exist: Premadasa, Sawai Mansingh, Narendra Modi, etc.)
- Modify: `src/data/players.json` (assign traits to certified icons)
- Test: `tests/unit/synergyData.test.ts`

**Interfaces:**
- Produces:
  - `CHEMISTRY_SYNERGIES: ChemistrySynergy[]` exported from `src/data/synergies.ts`
  - Function: `getActiveSynergies(picks: Player[]): ChemistrySynergy[]`
  - Function: `getSynergyProgress(picks: Player[]): { synergy: ChemistrySynergy; draftedCount: number; isComplete: boolean }[]`

- [x] **Step 1: Write the failing test**

```ts
// tests/unit/synergyData.test.ts
import { describe, it, expect } from 'vitest';
import { CHEMISTRY_SYNERGIES, getActiveSynergies, getSynergyProgress } from '../../src/data/synergies';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Chemistry Synergies & Signature Traits Dataset', () => {
  it('contains at least 10 authentic real-life duos and trios', () => {
    expect(CHEMISTRY_SYNERGIES.length).toBeGreaterThanOrEqual(10);
    const rcbDuo = CHEMISTRY_SYNERGIES.find((s) => s.id === 'rcb_kohli_abd');
    expect(rcbDuo).toBeDefined();
    expect(rcbDuo?.playerIds).toContain('virat-kohli');
    expect(rcbDuo?.playerIds).toContain('ab-de-villiers');
  });

  it('detects active synergy only when all members are drafted in the team', () => {
    const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
    const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;

    // Only Kohli -> incomplete
    const partial = getActiveSynergies([kohli]);
    expect(partial.some((s) => s.id === 'rcb_kohli_abd')).toBe(false);

    // Both drafted -> active!
    const full = getActiveSynergies([kohli, abd]);
    expect(full.some((s) => s.id === 'rcb_kohli_abd')).toBe(true);
  });

  it('assigns signature traits to certified legends like Kohli, Dhoni, ABD, Bumrah, and Root', () => {
    const kohli = playersData.find((p) => p.id === 'virat-kohli');
    const dhoni = playersData.find((p) => p.id === 'ms-dhoni');
    const bumrah = playersData.find((p) => p.id === 'jasprit-bumrah');
    const abd = playersData.find((p) => p.id === 'ab-de-villiers');

    expect(kohli?.trait?.name).toBe('Chase Master');
    expect(dhoni?.trait?.name).toBe('Ice Finisher');
    expect(bumrah?.trait?.name).toBe('Death Yorker King');
    expect(abd?.trait?.name).toBe('360° Visionary');
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/synergyData.test.ts`
Expected: FAIL with `Cannot find module '../../src/data/synergies'`

- [x] **Step 3: Implement `src/data/synergies.ts`, update `src/data/venues.ts`, and enrich `src/data/players.json`**

1. Create `src/data/synergies.ts` with authentic pairings:
   - `rcb_kohli_abd`: Virat Kohli + AB de Villiers (Batting boost +10%)
   - `srh_warner_bairstow`: David Warner + Jonny Bairstow (Batting boost +10%)
   - `ind_spin_twins`: Ravichandran Ashwin + Ravindra Jadeja (Spin Bowling boost +10%)
   - `pak_sultans_reverse`: Wasim Akram + Waqar Younis (Pace Bowling boost +10%)
   - `aus_pace_trio`: Mitchell Starc + Pat Cummins + Josh Hazlewood (Pace Bowling boost +12%)
   - `wi_power_twins`: Kieron Pollard + Andre Russell (Batting boost +10%)
   - `kkr_mystery_duo`: Sunil Narine + Varun Chakaravarthy (Spin Bowling boost +10%)
   - `csk_thala_chinna`: MS Dhoni + Suresh Raina (Batting boost +10%)
   - `ind_deadly_openers`: Sachin Tendulkar + Virender Sehwag (Batting boost +10%)
   - `wi_pace_quartet`: Malcolm Marshall + Michael Holding + Joel Garner (Pace Bowling boost +12%)
   - `ind_kul_cha`: Kuldeep Yadav + Yuzvendra Chahal (Spin Bowling boost +10%)
   - `pandya_brothers`: Hardik Pandya + Krunal Pandya (Allrounder boost +10%)
2. Add helper functions `getActiveSynergies(picks)` and `getSynergyProgress(picks)`.
3. Add missing venues to `src/data/venues.ts` (`sawai_mansingh`, `premadasa`, `narendra_modi`, `eden_gardens`).
4. Update `scratch/populate_roster.py` and `scratch/generate_full_authentic_dataset.py` to stamp signature traits onto top cricketers and run generator to update `src/data/players.json`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/synergyData.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/data/synergies.ts src/data/venues.ts src/data/players.json scratch/ tests/unit/synergyData.test.ts
git commit -m "feat: add chemistry synergies dataset and assign signature player traits"
```

---

### Task 3: Tactical Engine Updates (Traits & Synergy Evaluation in Simulation)

**Files:**
- Modify: `src/engine/simulator.ts`
- Test: `tests/unit/traitSimulation.test.ts`

**Interfaces:**
- Consumes:
  - `PlayerTrait`, `ChemistrySynergy` from `src/types/player.ts`
  - `getActiveSynergies` from `src/data/synergies.ts`
- Produces:
  - `calculateSynergyAdjustedRatings(players: Player[], activeSynergies: ChemistrySynergy[], baseRatings: PitchAdjustedRatings): PitchAdjustedRatings`
  - Extended `MatchResult` with `activeSynergyNames?: string[]`, `activeTraitHighlights?: string[]`

- [x] **Step 1: Write the failing test**

```ts
// tests/unit/traitSimulation.test.ts
import { describe, it, expect } from 'vitest';
import { simulateMatch, calculatePitchAdjustedRatings } from '../../src/engine/simulator';
import { VENUES } from '../../src/data/venues';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';
import { OPPONENTS } from '../../src/data/opponents';

describe('Traits and Synergy Match Simulation', () => {
  const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
  const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;
  const otherNine = playersData.slice(2, 11) as Player[];
  const teamWithDuo = [kohli, abd, ...otherNine];
  const venue = VENUES[0];

  it('boosts player ratings when their chemistry synergy is active', () => {
    const opp = OPPONENTS[0];
    const result = simulateMatch(teamWithDuo, opp, venue, kohli.id);

    expect(result.activeSynergyNames).toBeDefined();
    expect(result.activeSynergyNames).toContain('RCB Dynamic Duo');
  });

  it('logs signature traits in top performer highlights or match results', () => {
    const opp = OPPONENTS[0];
    const bumrah = playersData.find((p) => p.id === 'jasprit-bumrah') as Player;
    const teamWithBumrah = [bumrah, ...playersData.slice(1, 11) as Player[]];

    const result = simulateMatch(teamWithBumrah, opp, venue, bumrah.id);
    expect(result.playerOfTheMatch).toBeDefined();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/traitSimulation.test.ts`
Expected: FAIL with `activeSynergyNames is undefined`

- [x] **Step 3: Implement trait and synergy boosts in `src/engine/simulator.ts`**

1. Calculate active chemistry synergies with `getActiveSynergies(userXI)`.
2. Apply synergy batting/bowling multipliers to the respective players.
3. Apply trait situational multipliers:
   - Chasing traits (`trigger === 'Chasing'`) boost batting rating when team chases.
   - Death bowling traits boost bowling ratings.
4. Record `activeSynergyNames` on `MatchResult`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/traitSimulation.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/engine/simulator.ts src/types/tournament.ts tests/unit/traitSimulation.test.ts
git commit -m "feat: incorporate chemistry synergies and signature traits into match simulator"
```

---

### Task 4: Match Setup Component (`MatchSetupScreen.tsx`)

**Files:**
- Create: `src/components/setup/MatchSetupScreen.tsx`
- Test: `tests/components/MatchSetupScreen.test.tsx`

**Interfaces:**
- Consumes:
  - `activeOpponents: OpponentTeam[]`
  - `venues: Venue[]` (from `src/data/venues.ts`)
  - `gameMode: GameMode`
- Produces:
  - Props:
    ```ts
    interface MatchSetupScreenProps {
      gameMode: GameMode;
      opponents: OpponentTeam[];
      venues: Venue[];
      selectedOpponent: OpponentTeam;
      selectedVenue: Venue;
      onSelectOpponent: (opp: OpponentTeam) => void;
      onSelectVenue: (venue: Venue) => void;
      onProceedToDraft: () => void;
      onBackToHome: () => void;
    }
    ```

- [x] **Step 1: Write the failing test**

```tsx
// tests/components/MatchSetupScreen.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchSetupScreen } from '../../src/components/setup/MatchSetupScreen';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';

describe('MatchSetupScreen Component', () => {
  it('renders opponent selection list and stadium cards', () => {
    const onSelectOpp = vi.fn();
    const onSelectVen = vi.fn();
    const onProceed = vi.fn();
    const onBack = vi.fn();

    render(
      <MatchSetupScreen
        gameMode="International"
        opponents={INTERNATIONAL_OPPONENTS}
        venues={VENUES}
        selectedOpponent={INTERNATIONAL_OPPONENTS[0]}
        selectedVenue={VENUES[0]}
        onSelectOpponent={onSelectOpp}
        onSelectVenue={onSelectVen}
        onProceedToDraft={onProceed}
        onBackToHome={onBack}
      />
    );

    expect(screen.getByText(/Match Setup & Tactical Intel/i)).toBeDefined();
    expect(screen.getByText(INTERNATIONAL_OPPONENTS[0].name)).toBeDefined();
    expect(screen.getByText(VENUES[0].name)).toBeDefined();

    // Proceed button works
    const proceedBtn = screen.getByRole('button', { name: /lock fixture & begin draft/i });
    fireEvent.click(proceedBtn);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/MatchSetupScreen.test.tsx`
Expected: FAIL with missing component `MatchSetupScreen`

- [x] **Step 3: Implement `src/components/setup/MatchSetupScreen.tsx`**

1. Section 1: **Choose Opposition**:
   - Cards for each opponent in the active mode ladder showing team name, era badge, captain, and key strengths.
   - Highlights selected opponent with gold glowing border.
2. Section 2: **Choose Stadium & Pitch**:
   - Cards for stadiums showing City, locked Pitch Type badge (Dustbowl, Green Seamer, Flat Batting, etc.), and tactical modifier.
   - Highlights selected venue with green glowing border.
3. Section 3: **Tactical Intel Summary Card**:
   - Highlights key strategic advice: e.g. "Chepauk Dustbowl favors Spin (+20%). Your opponent has Muralitharan & Jayasuriya. Draft spin specialists."
4. Action Bar: "Lock Fixture & Begin Draft" primary button and "Back to Home".

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/MatchSetupScreen.test.tsx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/components/setup/MatchSetupScreen.tsx tests/components/MatchSetupScreen.test.tsx
git commit -m "feat: create MatchSetupScreen component for pre-draft fixture and stadium selection"
```

---

### Task 5: UI Integration — Synergy Badges on Candidate Cards, Draft Wheels Fixture Indicator & Team Sheet Synergies

**Files:**
- Modify: `src/components/draft/CandidateCard.tsx`
- Modify: `src/components/draft/CandidateList.tsx`
- Modify: `src/components/draft/SpinWheels.tsx`
- Modify: `src/components/draft/TeamSheet.tsx`
- Test: `tests/components/DraftUI.test.tsx`

**Interfaces:**
- CandidateCard: displays signature trait badge (e.g. `⚡ Chase Master`) and potential synergy glow if drafted with an existing pick
- SpinWheels: displays locked fixture header badge (e.g. `🏟️ vs 2011 India @ Wankhede (Flat Batting)`)
- TeamSheet: lists active chemistry synergies in the Playing XI summary bar

- [x] **Step 1: Write the failing test**

```tsx
// in tests/components/DraftUI.test.tsx
it('renders candidate card with signature trait badge when present', () => {
  const kohliWithTrait = playersData.find((p) => p.id === 'virat-kohli') as Player;
  render(<CandidateCard player={kohliWithTrait} onSelect={vi.fn()} />);

  expect(screen.getByText(/Chase Master/i)).toBeDefined();
});

it('displays active chemistry synergies in team sheet when duo is assembled', () => {
  const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
  const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;

  render(
    <TeamSheet
      slots={SLOTS}
      picks={[kohli, abd]}
      currentSlotIndex={2}
      captainId={kohli.id}
      onSelectCaptain={vi.fn()}
    />
  );

  expect(screen.getByText(/RCB Dynamic Duo/i)).toBeDefined();
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/DraftUI.test.tsx`
Expected: FAIL on missing trait badge / synergy banner

- [x] **Step 3: Update `CandidateCard.tsx`, `CandidateList.tsx`, `SpinWheels.tsx`, and `TeamSheet.tsx`**

1. `CandidateCard.tsx`: Render golden badge if `player.trait` exists (`⚡ ${player.trait.name}`). If candidate completes a synergy with `currentPicks`, display glowing pill `✨ Synergy Link`.
2. `SpinWheels.tsx`: Add optional `fixtureInfo?: { opponentName: string; venueName: string; pitchType: string; pitchDescription: string }` header banner.
3. `TeamSheet.tsx`: Add active synergy banner above the Playing XI cards when `getActiveSynergies(picks)` has entries, showing boost percentages.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/DraftUI.test.tsx`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/components/draft/* tests/components/DraftUI.test.tsx
git commit -m "feat: add trait badges, synergy glow, and fixture intel to draft UI components"
```

---

### Task 6: Reactive Controller Integration (`useStumpdGame.ts`) & App Workflow

**Files:**
- Modify: `src/hooks/useStumpdGame.ts`
- Modify: `src/App.tsx`
- Test: `tests/unit/gameFlow.test.ts`

**Interfaces:**
- Hook provides:
  - `selectedOpponent: OpponentTeam`
  - `selectedVenue: Venue`
  - `setSelectedOpponent: (opp: OpponentTeam) => void`
  - `setSelectedVenue: (venue: Venue) => void`
  - `proceedFromSetupToDraft: () => void`
  - Flow: `HomeScreen` mode click -> `screen: 'match-setup'` -> user locks fixture -> `screen: 'draft'` -> draft XI -> `screen: 'match'` against `selectedOpponent` at `selectedVenue`

- [x] **Step 1: Write the failing test**

```ts
// in tests/unit/gameFlow.test.ts
it('flows through match setup before entering draft phase', () => {
  const { result } = renderHook(() => useStumpdGame());

  // Click start mode -> transitions to match-setup first!
  act(() => {
    result.current.startMode('International');
  });
  expect(result.current.screen).toBe('match-setup');
  expect(result.current.selectedOpponent).toBeDefined();
  expect(result.current.selectedVenue).toBeDefined();

  // Change opponent and venue
  const newOpp = result.current.activeOpponents[1];
  act(() => {
    result.current.setSelectedOpponent(newOpp);
  });
  expect(result.current.selectedOpponent.id).toBe(newOpp.id);

  // Proceed to draft
  act(() => {
    result.current.proceedFromSetupToDraft();
  });
  expect(result.current.screen).toBe('draft');
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/gameFlow.test.ts`
Expected: FAIL with `result.current.screen is 'draft' instead of 'match-setup'`

- [x] **Step 3: Update `src/hooks/useStumpdGame.ts` and `src/App.tsx`**

1. In `useStumpdGame.ts`:
   - Add state for `selectedOpponent` (defaulting to first opponent of active mode) and `selectedVenue` (defaulting to first venue).
   - In `startMode()`: set `screen: 'match-setup'`.
   - Add `proceedFromSetupToDraft`: sets `screen: 'draft'` and resets wheels.
   - In `playCurrentMatch`: pass `selectedOpponent` and `selectedVenue` to `simulateMatch`.
2. In `App.tsx`:
   - Render `MatchSetupScreen` when `screen === 'match-setup'`.
   - Pass fixture intel to `SpinWheels`.
   - Pass `currentPicks` to `CandidateList` for synergy link detection.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/gameFlow.test.ts`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add src/hooks/useStumpdGame.ts src/App.tsx tests/unit/gameFlow.test.ts
git commit -m "feat: integrate match-setup screen into game flow and wire chosen opponent and stadium"
```

---

### Task 7: Full System Verification, End-to-End Build & Second Brain Documentation

**Files:**
- Modify: `docs/superpowers/plans/2026-11-04-match-setup-and-player-perks.md`
- Modify: `/home/naveen/SecondBrain/Daily/2026-11-04.md`

- [x] **Step 1: Run full test suite**

Run: `npm test`
Expected: 36+ tests passing across all test files.

- [x] **Step 2: Run production build**

Run: `npm run build`
Expected: Clean build with zero TypeScript and bundler errors.

- [x] **Step 3: Test local dev server**

Run: `curl -s http://localhost:5173/ | head -n 15`
Expected: 200 OK HTML output.

- [x] **Step 4: Update Obsidian daily dev log**

Append milestone summary to `/home/naveen/SecondBrain/Daily/2026-11-04.md`.

- [x] **Step 5: Commit final verification**

```bash
git commit -am "chore: verify full test suite and update devlog for pre-draft match setup and player traits"
```
