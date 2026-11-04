# Stumpd: Cricket XI Drafting & Tournament Strategy Game
## System Design & Architecture Specification

- **Date:** 2026-11-04
- **Status:** Approved Draft (Refined via Builder Check)
- **Author:** Antigravity Pair Programming
- **Target Repository:** `/home/naveen/Projects/stumpd`

---

## 1. Intent and the "Why"
**Stumpd** is a digital tactical cricket strategy game inspired by the draft mechanics of sports card games, cricket trivia, and daily puzzle games (like Wordle and Immaculate Grid). 

The goal is to elevate a standalone prototype into a production-grade, responsive, mobile-first web application where cricket enthusiasts can:
1. Test their cricket acumen by drafting a balanced Playing XI slot-by-slot under randomized team and era constraints.
2. Strategically counter dynamic venue pitch conditions (dustbowls, green seamers, batting paradises) fixture-by-fixture.
3. Experience a punchy, suspenseful match-by-match tournament campaign against legendary historical and franchise squads with tactical feedback, box scores, and shareable results.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Full Modern Web Application:** Responsive, mobile-first SPA built on React 18/19, Vite, TypeScript, and Tailwind CSS with luxury sports styling and fluid reel/slot animations.
- **Deep & Balanced Player Roster:** 500+ legendary, active, and cult-hero cricketers spanning 10 Test-playing nations and all 10 IPL franchises across five distinct eras (1980s, 1990s, 2000s, 2010s, Modern).
- **Dual Attribute System:** Separate granular Batting and Bowling ratings (0–99), plus handedness (LHB/RHB), bowling style, and primary/secondary roles, replacing flat one-dimensional ratings.
- **Tactical Drafting Engine:** 11-slot batting-order draft with 3 Mulligan reroll tokens, guaranteed non-empty candidate fallbacks, and pre-match lineup reordering.
- **Match-by-Match Interactive Campaign:** 7 sequential tournament fixtures played one-by-one. Before each match, players preview venue conditions (e.g. Chennai Dustbowl, Lord's Green Seamer, Chinnaswamy Batting Deck), tweak batting order, assign the Captain, view the toss, and inspect the match box score.
- **Curated Iconic Opponents:** 7 distinct historical squads (e.g., 2003 Australia, 2011 India, 1999 Pakistan, 1980s West Indies, 2019 England, 2018 CSK, 2016 RCB) with authentic player lineups and tactical strengths.
- **Multiple Game Modes:**
  1. *Spin Mode* (Flagship randomized 11-slot run with 3 mulligans).
  2. *Daily Stumpd* (Deterministic daily seed, identical spin constraints and candidate draws globally, no mulligans, 1 attempt/day, shareable emoji grid).
  3. *Practice Mode* (Unlimited rerolls, instant resets, sandbox experimentation).
- **Web Audio Soundscape:** Zero-dependency procedural Web Audio sound synthesis (wheel clicks, bat crack, crowd cheers) with instant global mute toggle.
- **Shareable Bragging Rights:** High-fidelity visual scorecard export and copyable Wordle-style emoji grid for WhatsApp and social sharing.

### Non-Goals (V1)
- Real-time multiplayer draft lobbies (V1 is client-side asynchronous / solo).
- Heavy 3D graphics or manual ball-by-ball gameplay (the core is drafting and strategic tactical simulation).
- Backend user account authentication or persistent server database in V1.

### Anti-Goals
- **No external audio file dependencies:** Audio must never fail or throw errors due to missing or blocked `.mp3`/`.wav` assets.
- **No frustrating dead-ends:** A spin must never produce zero candidates and strand the player; intelligent fallback pools ensure valid choices exist.
- **No sluggish load times:** Zero heavy WASM or server roundtrips; first paint under 500ms.

---

## 3. Constraints
- **Client-Side Portability:** Pure static/SPA bundle executable on any static hosting (Vercel, GitHub Pages, Netlify) or locally without external backend dependencies.
- **Device Support:** 100% mobile-optimized touch interface (designed for thumbs on mobile phones) while gracefully expanding to desktop screens.
- **Standardized Web Standards:** Built using modern ECMAScript standards, Tailwind CSS, Vite, and HTML5 Web Audio API.

---

## 4. Architectural Approaches Evaluated

### Approach 1: Modular Client-First SPA with Typed Data Engine & Synthetic Web Audio (Selected)
- **Stack:** React + Vite + TypeScript + Tailwind CSS + Lucide Icons.
- **Architecture:** Client-side state machine managing draft rounds, tactical lineup modifications, and match-by-match simulation. Normalized JSON database of 500+ players.
- **Audio:** Web Audio API oscillator synthesis.
- **Rationale:** Delivers lightning-fast performance, offline play, zero operational costs, and rapid development with clean testability.

### Approach 2: SQLite-WASM Embedded Architecture (Rejected)
- Included `sql.js` for SQL querying of players.
- *Reason for Rejection:* Added ~2.5 MB of WASM bundle overhead, slower mobile cold starts, and unnecessary complexity for a curated 500-player dataset.

### Approach 3: Full-Stack Next.js with Server-Side Match Engine & Edge DB (Rejected)
- Included Next.js App Router and server API routes for simulation and anti-cheat leaderboards.
- *Reason for Rejection:* Incurred hosting requirements, network latency between spin steps, and removed offline capability without significant V1 benefits.

---

## 5. Detailed System Design & Components

### 5.1 Project Structure
```
stumpd/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── player.ts        # Player, Role, Handedness, BowlingType, Era, Team
│   │   ├── game.ts          # GameState, Slot, DraftPick, GameMode, Mulligan
│   │   └── tournament.ts    # Match, Venue, PitchType, MatchResult, Scorecard, Opponent
│   ├── data/
│   │   ├── players.json     # 500+ cricketers with dual ratings & metadata
│   │   ├── teams.ts         # Team definitions (Nations + IPL franchises)
│   │   ├── venues.ts        # Venues and pitch condition definitions
│   │   ├── opponents.ts     # 7 curated iconic historical opponent squads
│   │   └── slots.ts         # 11 slot definitions with positional role requirements
│   ├── engine/
│   │   ├── draftMachine.ts  # State transitions, wheel spinning, candidate filtering, fallback logic
│   │   ├── simulator.ts     # Pitch modifier calculation, match resolution, player stats generation
│   │   ├── dailySeed.ts     # Deterministic PRNG for Daily Stumpd challenge
│   │   └── audio.ts         # Web Audio API sound synthesizer (ticker, bat crack, fanfare)
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, AudioToggle, ModeBadge
│   │   ├── home/            # ModeSelector, DailyCard, StatsOverview
│   │   ├── draft/           # Wheels, SlotProgress, CandidateCard, TeamSheet, OrderEditor
│   │   ├── match/           # FixturePreview, PitchConditions, TossBanner, LiveSimProgress, BoxScoreCard
│   │   ├── results/         # TrophyHero, TournamentSummary, MVPSpotlight, ShareModal
│   │   └── ui/              # Button, Card, Badge, Modal, Tooltip
│   ├── hooks/
│   │   ├── useStumpdGame.ts # Primary reactive game controller
│   │   └── useAudio.ts      # Audio hook with mute persistence in localStorage
│   └── utils/
│       ├── share.ts         # Canvas card generator & clipboard emoji formatter
│       └── storage.ts       # LocalStorage persistence for stats and daily completions
└── tests/
    ├── unit/
    │   ├── draftMachine.test.ts
    │   ├── simulator.test.ts
    │   └── dailySeed.test.ts
    └── components/
        └── TeamSheet.test.tsx
```

### 5.2 Player Data Model
```typescript
export type PlayerRole = 'Opener' | 'TopOrder' | 'MiddleOrder' | 'Finisher' | 'Allrounder' | 'Wicketkeeper' | 'Spinner' | 'Pacer';
export type BattingHand = 'Right' | 'Left';
export type BowlingType = 'Fast' | 'FastMedium' | 'Medium' | 'OffSpin' | 'LegSpin' | 'LeftArmOrthodox' | 'LeftArmUnorthodox' | 'None';
export type Era = '1980s' | '1990s' | '2000s' | '2010s' | 'Modern';

export interface Player {
  id: string;
  name: string;
  country: string;              // Primary nationality
  franchise?: string[];         // Associated IPL franchises (e.g. ['CSK', 'MI'])
  eras: Era[];                  // Active eras where player qualifies
  primaryRole: PlayerRole;
  secondaryRoles?: PlayerRole[];
  battingRating: number;        // 0-99
  bowlingRating: number;        // 0-99
  battingHand: BattingHand;
  bowlingType: BowlingType;
  isCaptainCandidate?: boolean; // Bonus leadership potential
  rarity?: 'Legend' | 'Icon' | 'Pro';
}
```

### 5.3 The 11 Batting-Order Slots
1. **Slot 1 - Opener 1:** Roles: `Opener`
2. **Slot 2 - Opener 2:** Roles: `Opener`
3. **Slot 3 - No. 3 (Anchor):** Roles: `TopOrder`, `Opener`
4. **Slot 4 - No. 4 (Core):** Roles: `TopOrder`, `MiddleOrder`
5. **Slot 5 - No. 5 (Dynamic):** Roles: `MiddleOrder`, `Allrounder`
6. **Slot 6 - No. 6 (Finisher / AR):** Roles: `MiddleOrder`, `Finisher`, `Allrounder`
7. **Slot 7 - Allrounder:** Roles: `Allrounder`
8. **Slot 8 - Wicketkeeper:** Roles: `Wicketkeeper`
9. **Slot 9 - Lead Spinner:** Roles: `Spinner`, `Allrounder` (with spin bowling type)
10. **Slot 10 - Strike Pacer 1:** Roles: `Pacer`
11. **Slot 11 - Strike Pacer 2:** Roles: `Pacer`

### 5.4 Drafting Mechanics & Smart Fallback
- **Wheels:** Reel 1 = Team / Franchise (10 Nations + 10 IPL Teams). Reel 2 = Era (`1980s`, `1990s`, `2000s`, `2010s`, `Modern`).
- **Mulligans:** Players start with 3 Mulligan tokens in Spin Mode (unlimited in Practice Mode, 0 in Daily Stumpd). Clicking "Mulligan" re-spins the wheels without penalty.
- **Smart Fallback:** If a spin yields 0 matching players (e.g., an era where an IPL team didn't exist or a country lacked a specific role), the engine automatically widens the era to the adjacent era or includes iconic domestic/international wildcards, guaranteeing 1–3 valid candidate cards.

### 5.5 Tournament Progression & Match-by-Match Engine
The tournament features 7 sequential fixtures against iconic opponents at diverse venues:
1. **Match 1:** vs. **2016 RCB** @ M. Chinnaswamy (Flat Batting Paradise: +15% Batting, High Scores)
2. **Match 2:** vs. **1999 Pakistan** @ Lord's Cricket Ground (Green Seamer: +20% Pacer Rating, Early Collapses)
3. **Match 3:** vs. **2018 CSK** @ MA Chidambaram Chepauk (Dustbowl Turner: +20% Spinners, Tricky Chase)
4. **Match 4:** vs. **1980s West Indies** @ Kensington Oval / WACA (Express Bouncy Track: +15% Fast Bowling)
5. **Match 5:** vs. **2019 England** @ The Oval (Sporting Balanced Deck: Equitable Bat/Ball)
6. **Match 6 (Semi-Final):** vs. **2011 India** @ Wankhede Stadium (Dew Factor & Spin Clash)
7. **Match 7 (Final):** vs. **2003 Australia** @ MCG (High Pressure Mega-Clash)

#### Interactive Match Loop:
1. **Fixture Preview:** Displays opponent lineup, venue, pitch type, and key threat player.
2. **Tactical Tweaks:** Player can re-order their 1–11 batting order and designate a Captain suited for the pitch (e.g. promoting spin-hitters on dustbowls or solid anchors on green seamers).
3. **Toss:** Automated toss flip with tactical decision (Bat first on flat decks, Bowl first on damp seamers).
4. **Match Simulation & Box Score:** Calculates runs, wickets, strike-rates, and figures for both teams based on pitch-adjusted ratings ($BAR$ and $BOR$).
5. **Post-Match:** Shows result (Win/Loss), updated tournament standings, and transitions to the next fixture.
6. **Tournament Finale:** Shows final trophy tier (🏆 Champions 6-7 wins, 🥈 Finalists 4-5 wins, 🏅 Top 4 for 3 wins), tournament stats, MVP honors, and shareable scorecard.

### 5.6 Audio Synthesizer (Web Audio API)
- **Reel Click:** Procedural audio buffer pulse mimicking mechanical wheel click (pitch escalating as reel slows down).
- **Player Select:** Resonant wooden chime.
- **Bat Crack:** White noise burst with low-pass filter decay mimicking leather on willow.
- **Trophy / Win:** Procedural ascending pentatonic arpeggio.
- **Mute Control:** Floating toggle button in header, state persisted in `localStorage`.

### 5.7 UI & Visual Design System
- **Palette:**
  - Background Base: `#0A1813` (Deep Midnight Turf)
  - Surface Cards: `#12261E` (Pitch Emerald), borders `#214436`
  - Cricket Gold: `#E5A93B` (Trophy & Accent), Hover `#F5BE58`
  - Text Primary: `#F0FDF4` (Crisp Off-white), Text Muted: `#8BA89B`
  - Win Green: `#22C55E`, Loss Red: `#EF4444`
- **Typography:** Modern clean sans-serif (`Inter` or system athletic font) with bold tabular figures for ratings.
- **Export & Share:**
  - Generate visual share card using HTML5 Canvas (`Stumpd Playing XI`).
  - Generate clipboard text with emoji grid (e.g. `🏏 Stumpd #42 🏆 Champions (6-1) [🟩🟩🟩🟥🟩🟩🟩]`).

---

## 6. What's Left to the Builder
- Selection of specific modern build tooling and scripts (Vite, Vitest, Tailwind config).
- Curating and formatting the 500+ player records in `players.json`.
- Visual layout refinement of the wheel animation (canvas vs CSS transform reel).
- Unit test suite coverage for the draft engine, fallback handlers, and pitch simulation calculations.
