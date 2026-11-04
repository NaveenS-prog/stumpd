import { useState } from 'react';
import { useStumpdGame } from './hooks/useStumpdGame';
import { HomeScreen } from './components/home/HomeScreen';
import { SlotProgress } from './components/draft/SlotProgress';
import { SpinWheels } from './components/draft/SpinWheels';
import { CandidateList } from './components/draft/CandidateList';
import { TeamSheet } from './components/draft/TeamSheet';
import { LineupReorderModal } from './components/draft/LineupReorderModal';
import { MatchScreen } from './components/match/MatchScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { SLOTS } from './data/slots';
import { OPPONENTS } from './data/opponents';
import { VENUES } from './data/venues';

export default function App() {
  const {
    screen,
    gameMode,
    currentSlotIndex,
    picks,
    captainId,
    mulligansRemaining,
    currentTeam,
    currentEra,
    currentCandidates,
    isSpinning,
    currentMatchIndex,
    matchResults,
    lastResult,
    isSimulating,
    stats,
    isDailyLocked,
    isMuted,
    startMode,
    spinReels,
    mulligan,
    draftPlayer,
    setCaptain,
    reorderLineup,
    proceedToMatches,
    playCurrentMatch,
    nextMatch,
    resetGame,
    toggleMute,
  } = useStumpdGame();

  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const currentOpponent = OPPONENTS[currentMatchIndex] || OPPONENTS[0];
  const currentVenue = VENUES[currentMatchIndex % VENUES.length];

  return (
    <div className="min-h-screen bg-turf-950 text-white flex flex-col justify-between selection:bg-gold-400 selection:text-turf-950">
      {/* Top Persistent Navigation Bar */}
      <header className="sticky top-0 z-40 bg-turf-950/90 backdrop-blur-md border-b border-turf-800/80 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center gap-2 group text-left"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🏏</span>
            <div>
              <span className="text-lg font-black tracking-wider text-white font-mono leading-none block">
                STUMPD<span className="text-gold-400">.</span>
              </span>
              <span className="text-[10px] text-turf-400 font-sans uppercase tracking-wider">
                {screen !== 'home' ? gameMode : 'Cricket Strategy'}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-turf-900 border border-turf-700 hover:border-gold-400/50 text-xs text-turf-300 hover:text-white transition-all"
              title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              aria-label="Toggle Sound"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {screen !== 'home' && (
              <button
                type="button"
                onClick={resetGame}
                className="py-1.5 px-3 rounded-lg bg-turf-900 hover:bg-turf-800 border border-turf-700 text-xs font-mono text-turf-300 hover:text-white transition-all"
              >
                Exit to Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {screen === 'home' && (
          <HomeScreen
            onStartGame={startMode}
            stats={stats}
            isDailyLocked={isDailyLocked}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}

        {screen === 'draft' && (
          <div className="w-full">
            <SlotProgress
              slots={SLOTS}
              currentSlotIndex={currentSlotIndex}
              picks={picks}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Spin Controls & Candidates (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-6">
                {picks.length < SLOTS.length ? (
                  <>
                    <SpinWheels
                      currentTeam={currentTeam}
                      currentEra={currentEra}
                      isSpinning={isSpinning}
                      mulligansRemaining={mulligansRemaining}
                      onSpin={spinReels}
                      onMulligan={mulligan}
                      disableMulligan={gameMode === 'Daily Stumpd'}
                    />

                    <CandidateList
                      candidates={currentCandidates}
                      onSelectPlayer={draftPlayer}
                      isSpinning={isSpinning}
                    />
                  </>
                ) : (
                  <div className="bg-turf-900 border border-gold-400/50 rounded-2xl p-8 text-center shadow-2xl">
                    <div className="text-5xl mb-3">🏏</div>
                    <h3 className="text-2xl font-black text-white uppercase font-mono">
                      Drafting Complete!
                    </h3>
                    <p className="text-sm text-turf-300 mt-2 max-w-md mx-auto">
                      All 11 positions have been filled. Finalize your batting order and lead your squad into the tournament gauntlet.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReorderModalOpen(true)}
                        className="py-3 px-5 rounded-xl bg-turf-800 hover:bg-turf-700 border border-turf-600 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        Adjust Lineup &amp; Captain
                      </button>
                      <button
                        type="button"
                        onClick={proceedToMatches}
                        className="py-3 px-6 rounded-xl bg-gold-400 hover:bg-gold-300 text-turf-950 font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95"
                      >
                        Enter Tournament Campaign ➔
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: 11-Slot Team Sheet (5 cols on desktop) */}
              <div className="lg:col-span-5">
                <TeamSheet
                  slots={SLOTS}
                  picks={picks}
                  currentSlotIndex={currentSlotIndex}
                  captainId={captainId}
                  onSelectCaptain={setCaptain}
                  onOpenReorder={() => setIsReorderModalOpen(true)}
                />
              </div>
            </div>

            {/* Lineup Reorder Modal */}
            <LineupReorderModal
              isOpen={isReorderModalOpen}
              players={picks}
              captainId={captainId}
              onSelectCaptain={setCaptain}
              onReorder={reorderLineup}
              onClose={() => setIsReorderModalOpen(false)}
            />
          </div>
        )}

        {screen === 'match' && (
          <MatchScreen
            matchIndex={currentMatchIndex}
            totalMatches={OPPONENTS.length}
            opponent={currentOpponent}
            venue={currentVenue}
            userXI={picks}
            captainId={captainId}
            lastResult={lastResult}
            isSimulating={isSimulating}
            onPlayMatch={playCurrentMatch}
            onNextMatch={nextMatch}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            userXI={picks}
            captainId={captainId}
            matchResults={matchResults}
            opponents={OPPONENTS}
            gameMode={gameMode}
            onPlayAgain={resetGame}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-turf-950 border-t border-turf-900 py-4 px-4 text-center">
        <p className="text-xs font-mono text-turf-500">
          STUMPD. • Tactical Cricket XI Drafting &amp; Tournament Gauntlet • 500+ Legends
        </p>
      </footer>
    </div>
  );
}
