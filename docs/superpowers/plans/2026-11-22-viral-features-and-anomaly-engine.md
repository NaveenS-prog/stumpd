# Viral Mechanics & Anomaly Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement the 4 high-impact viral features inspired by 82-0 and Wordle into Stumpd: (1) The "Invincible 7-0" & Heartbreak Near-Miss Screen with 1-tap re-spin, (2) Daily Stumpd with a deterministic global seed and Wordle-style shareable emoji cards, (3) Clutch Death-Overs Suspense Simulator with animated commentary & trait popups, and (4) Cricket "Cheat Code" Anomaly Cards with holographic borders.

**Architecture:**
- **Anomaly Engine**: Extend `Player` schema with `isAnomaly`, `anomalySeason`, and `anomalyBadge`. Tag iconic single-season god-mode versions in `players.json`. Provide special holographic visual styling in `CandidateCard.tsx` and custom audio cues in `audio.ts`.
- **Clutch Death-Overs Simulator**: Refactor `LiveSimProgress.tsx` into an animated multi-phase tension builder (Powerplay -> Middle Overs -> Final 2 Overs Climax) with dynamic play-by-play commentary, trait activation alerts, and a "Skip to Scorecard" escape hatch.
- **Invincible 7-0 & Heartbreak Breakdown**: In `ResultsScreen.tsx` and `TrophyHero.tsx`, create the prestigious "Invincible 7-0" gold crest for flawless runs. For 5-2 or 6-1 finishes, generate a tactical Heartbreak diagnostic identifying the exact over/match that broke the streak, accompanied by an instant "⚡ Run It Back" 1-tap replay button.
- **Daily Mode & Enhanced Viral Share**: Wire `Daily Stumpd` in `HomeScreen.tsx` and `useStumpdGame.ts` with a global date-derived PRNG seed, 0 mulligans, and a high-contrast copyable WhatsApp/X scorecard in `share.ts`.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind CSS v3, Vitest, Web Audio API

---

## Tasks

- [x] **Task 1: Anomaly Data Model & God-Mode Players**
  - Added `isAnomaly`, `anomalySeason`, `anomalyBadge` to `Player` interface in `src/types/player.ts`.
  - Updated `src/data/players.json` with authentic single-season anomaly cards (2016 Kohli, 2013 Gayle, 1999 Klusener, 2023 Maxwell, 1980s Marshall, 1993 Warne).
  - Added tests in `tests/unit/anomalies.test.ts`.

- [x] **Task 2: Holographic Reel & Candidate Card Presentation**
  - Updated `src/components/draft/CandidateCard.tsx` to display a shimmering holographic gold/amber border, glowing badge (`🌟 ANOMALY [Season]`), and elevated stat emphasis.
  - Added custom sound cue in `src/engine/audio.ts` for anomaly pulls (`playAnomalyChime`) and wired in `useAudio.ts`.
  - Verified with unit tests.

- [x] **Task 3: Clutch Death-Overs Suspense Simulator**
  - Redesigned `src/components/match/LiveSimProgress.tsx` to run a fast-paced 3-stage match sequence with authentic play-by-play commentary ticker and trait trigger popups.
  - Included a "⚡ Skip to Result" button for instant gratification.
  - Tested suspense sequence transitions in `tests/components/clutchSim.test.tsx`.

- [x] **Task 4: The "Invincible 7-0" Trophy & Heartbreak Breakdown**
  - Updated `src/components/results/TrophyHero.tsx` with dedicated "INVINCIBLE 7-0 CHAMPIONS" styling and glowing golden border.
  - Added Heartbreak diagnostic logic to `src/components/results/ResultsScreen.tsx` analyzing the pivotal lost match for near-misses.
  - Added prominent "⚡ Run It Back (Re-spin)" 1-tap button.
  - Wrote comprehensive tests in `tests/components/heartbreak.test.tsx`.

- [x] **Task 5: Daily Stumpd Seed & Wordle-Style WhatsApp/X Share Card**
  - Wired Daily mode in `src/hooks/useStumpdGame.ts` and `src/components/home/HomeScreen.tsx` to enforce 0 mulligans and lock daily runs.
  - Enhanced `src/utils/share.ts` to output clean, high-signal emoji cards featuring streak status, venue marks, MVP, and chemistry synergies.
  - All unit tests verified.

- [x] **Task 6: Full Regression Verification & Second Brain Update**
  - Ran full test suite (52/52 Vitest tests passing across 17 test suites) and verified production build.
  - Synced Second Brain documentation and daily logs.
