# 📋 Stumpd — Future Feature Roadmap & Prioritized To-Do List

> Live Production: [stumpd-app.vercel.app](https://stumpd-app.vercel.app/)  
> Repository: [github.com/NaveenS-prog/stumpd](https://github.com/NaveenS-prog/stumpd)

---

## 🎨 Priority 1: Complete Visual & UI/UX Overhaul *(Top Priority)*
Transform the interface from a generic dark sports layout into a distinctive, tactile, high-energy cricket experience.

- [ ] **Aesthetic Direction & Brand System**:
  - Transition from dark green/gold to a high-contrast modern stadium broadcast or retro-arcade aesthetic (custom bespoke typography, stadium night glow, crisp card shadows).
  - Distinctive team jersey/card styling: Each drafted player looks like an authentic physical trading card with tactile foil borders (holographic shimmer for Anomalies/S-tier legends).
- [ ] **Interactive Draft Machine Polish**:
  - Redesign slot reel animations: Physical weighted mechanical reel stop effect, satisfying audio-visual clacks on stop.
  - Quick-pick gesture controls: Swipe right to lock, swipe left to reroll on mobile devices.
- [ ] **Dynamic Live Match Experience**:
  - Replace static score tickers with an animated visual wagon-wheel or mini stadium pitch animation showing where boundaries land.
  - High-impact momentum transitions for wicket falls, sixes, and super overs.
- [ ] **Post-Match Trophy & Results Screen**:
  - Full-screen cinematic champion/heartbreak presentation with dynamic confetti and sound stings.
  - Downloadable graphic card: Instagram story & WhatsApp-ready team sheet graphic generated in 1080×1920 portrait canvas.
- [ ] **Responsive & Mobile-First Polish**:
  - Zero-scroll drafting sheet on standard smartphones (iPhone, Galaxy) with floating bottom action dock.
  - Haptic feedback integration (Vibration API) on button taps, sixes, and wicket drops on supported mobile browsers.

---

## ⚔️ Priority 2: 1v1 Friend Multiplayer Mode ("Head-to-Head Derby")
Allow two friends to challenge each other directly to draft custom Playing XIs and face off in an intense simulated showdown.

- [ ] **Lobby & Matchmaking System**:
  - **Room Creation**: Host creates a private 4-letter lobby code (e.g., `CRIC`) or direct shareable link (`stumpd-app.vercel.app/vs/CRIC`).
  - **Realtime Sync**: Powered by Supabase Realtime Channels (WebSocket presence & broadcast events).
- [ ] **Live Interactive Draft Modes**:
  - **Snake Draft**: Host picks 1st player, Friend picks 2nd & 3rd, Host picks 4th & 5th from shared candidate pools.
  - **Blind Auction / Simultaneous Draft**: Both players draft from synchronized reels without seeing opponent's XI until the reveal.
- [ ] **Head-to-Head Match Simulation**:
  - Over-by-over live duel: Friend A's batting lineup faces Friend B's bowling attack, followed by the chase in the 2nd innings.
  - Interactive Captaincy Call: Players make 1 mid-innings tactical substitution or promote a pinch hitter.
- [ ] **Derby History & Bragging Rights**:
  - Win/Loss rivalry tracker stored between friends.
  - One-tap shareable Derby card: *"I bowled out Naveen's XI for 142 and won the Mumbai Derby! 🏆"*.

---

## 🧭 Priority 3: Daily Side Quests & Trivia Quiz ("The Pavilion Challenge")
Lightweight daily quests that test cricket knowledge and award drafting modifiers.

- [ ] **Daily Trivia Mini-Quiz**:
  - 3 fast-paced daily cricket questions (e.g., historical match situations, iconic world records, who played for both franchises).
  - Timed 15-second response window to prevent cheating.
- [ ] **Tactical "Scenario" Challenges**:
  - Solve tactical puzzles: *"Defend 15 runs in the final over against Russell and Pollard with 1 specialist bowler."*
  - Pick the winning ball trajectory or field placement.
- [ ] **Side Quest Rewards & Perks**:
  - Completing daily trivia unlocks tournament modifiers:
    - 🎟️ **Free Mulligan / Re-Spin**: Swap one candidate card during the tournament draft.
    - ⚡ **Chemistry Boost**: +10 bonus power for your captain.
- [ ] **Pavilion Trophy Cabinet & Streak Tracking**:
  - Consecutive daily quiz streak tracker.
  - Collectible retro cricket badges (e.g., *1983 Lord's Balcony Badge*, *2007 Bowl-Out Badge*, *2011 Six at Wankhede*).

---

## 📊 Priority 4: Advanced Tactical Depth & Seasonal Play
- [ ] **Pitch & Weather Archetypes**:
  - Green Seamer (boosts swing fast bowlers), Rank Turner (spins big for wrist spinners), Flat Highway (favors power hitters).
- [ ] **Historical Era Expansions**:
  - 90s ODI World Cup era pool (Tendulkar, Warne, Akram, Lara).
  - 2008–2014 Classic Early IPL Nostalgia mode.
- [ ] **Universal Leaderboard Seasons**:
  - Monthly season resets with Hall of Fame archiving for all-time top scores.
