import { useState, useEffect } from 'react';
import { useStumpdGame } from './hooks/useStumpdGame';
import { HomeScreen } from './components/home/HomeScreen';
import { MatchSetupScreen } from './components/setup/MatchSetupScreen';
import { SlotProgress } from './components/draft/SlotProgress';
import { SpinWheels } from './components/draft/SpinWheels';
import { CandidateList } from './components/draft/CandidateList';
import { TeamSheet } from './components/draft/TeamSheet';
import { LineupReorderModal } from './components/draft/LineupReorderModal';
import { MatchScreen } from './components/match/MatchScreen';
import { ResultsScreen } from './components/results/ResultsScreen';
import { UniversalScoreboardModal } from './components/scoreboard/UniversalScoreboardModal';
import { SLOTS } from './data/slots';
import { VENUES } from './data/venues';
import { initAudioUnlock } from './utils/sound';

export default function App() {
  const {
    screen,
    gameMode,
    activeOpponents,
    selectedOpponent,
    selectedVenue,
    setSelectedOpponent,
    setSelectedVenue,
    proceedFromSetupToDraft,
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
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);

  useEffect(() => {
    initAudioUnlock();
  }, []);

  const currentOpponent =
    currentMatchIndex === 0 && selectedOpponent
      ? selectedOpponent
      : activeOpponents[currentMatchIndex] || activeOpponents[0];
  const currentVenue =
    currentMatchIndex === 0 && selectedVenue
      ? selectedVenue
      : VENUES[currentMatchIndex % VENUES.length];

  const getModeTitle = () => {
    switch (gameMode) {
      case 'IPL':
        return 'IPL Championship';
      case 'International':
        return 'International Tour';
      default:
        return gameMode;
    }
  };

  return (
    <div className="min-h-screen bg-[#07110D] text-[#F0FDF4] flex flex-col justify-between selection:bg-gold-400 selection:text-turf-950 font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A1813]/95 backdrop-blur-md border-b border-[#1F3F32] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={resetGame}
            className="flex items-center gap-2 text-left group"
          >
            <span className="text-2xl">🏏</span>
            <div>
              <span className="text-xl font-black tracking-tight text-white font-mono leading-none block">
                STUMPD<span className="text-gold-400">.</span>
              </span>
              <span className="text-[10px] text-turf-400 uppercase tracking-widest font-mono">
                {screen !== 'home' ? getModeTitle() : 'Cricket Strategy'}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScoreboardOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-[#12261E] hover:bg-[#1A382C] border border-gold-400/40 text-xs font-mono text-gold-300 hover:text-gold-200 transition-all flex items-center gap-1.5"
            >
              <span>🏆 My Best Teams</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-[#12261E] border border-[#1F3F32] hover:border-gold-400/50 text-xs text-turf-300 hover:text-white transition-all"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Sound"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            {screen !== 'home' && (
              <button
                type="button"
                onClick={resetGame}
                className="py-1.5 px-3 rounded-lg bg-[#12261E] hover:bg-[#1A382C] border border-[#1F3F32] text-xs font-mono text-turf-300 hover:text-white transition-all"
              >
                Quit to Home
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {screen === 'home' && (
          <HomeScreen
            onStartGame={startMode}
            stats={stats}
            isDailyLocked={isDailyLocked}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}

        {screen === 'match-setup' && (
          <MatchSetupScreen
            gameMode={gameMode}
            opponents={activeOpponents}
            venues={VENUES}
            selectedOpponent={selectedOpponent}
            selectedVenue={selectedVenue}
            onSelectOpponent={setSelectedOpponent}
            onSelectVenue={setSelectedVenue}
            onProceedToDraft={proceedFromSetupToDraft}
            onBackToHome={resetGame}
          />
        )}

        {screen === 'draft' && (
          <div className="w-full">
            <SlotProgress
              slots={SLOTS}
              currentSlotIndex={currentSlotIndex}
              picks={picks}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
              {/* Left Column: Spin Wheels & Candidates */}
              <div className="lg:col-span-7">
                {picks.length < SLOTS.length ? (
                  <>
                    <SpinWheels
                      currentTeam={currentTeam}
                      currentEra={currentEra}
                      isSpinning={isSpinning}
                      mulligansRemaining={mulligansRemaining}
                      gameMode={gameMode}
                      fixtureInfo={{
                        opponentName: selectedOpponent.name,
                        venueName: selectedVenue.name,
                        pitchType: selectedVenue.pitchType,
                        pitchDescription: selectedVenue.pitchDescription,
                      }}
                      onSpin={spinReels}
                      onMulligan={mulligan}
                      disableMulligan={gameMode === 'Daily Stumpd'}
                    />

                    <CandidateList
                      candidates={currentCandidates}
                      onSelectPlayer={draftPlayer}
                      isSpinning={isSpinning}
                      gameMode={gameMode}
                      currentPicks={picks}
                    />
                  </>
                ) : (
                  <div className="bg-[#12261E] border border-gold-400/50 rounded-2xl p-6 sm:p-8 text-center shadow-2xl mb-6">
                    <div className="text-4xl mb-2">🏆</div>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase font-mono">
                      Playing XI Complete!
                    </h3>
                    <p className="text-xs sm:text-sm text-turf-300 mt-1 max-w-md mx-auto">
                      All 11 slots are drafted. Check your batting order and lead your team into the 7-match tournament gauntlet.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReorderModalOpen(true)}
                        className="py-2.5 px-4 rounded-xl bg-[#0A1813] hover:bg-[#152e24] border border-[#1F3F32] text-white font-bold text-xs uppercase tracking-wider transition-all"
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

              {/* Right Column: Starting XI Team Sheet */}
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
            totalMatches={activeOpponents.length}
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
            opponents={activeOpponents}
            gameMode={gameMode}
            onPlayAgain={resetGame}
          />
        )}
      </main>

      <UniversalScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-[#0A1813] border-t border-[#1F3F32] py-4 px-4 text-center space-y-1">
        <p className="text-[11px] font-mono text-turf-400 font-medium">
          STUMPD. • Tactical Cricket XI Drafting &amp; 7-0 Gauntlet Strategy
        </p>
        <p className="text-[10px] font-mono text-turf-500">
          Unofficial fan project. Not affiliated with BCCI, ICC, IPL, or any official team/franchise.
        </p>
        <p className="text-[10px] font-mono text-turf-600">
          Historical cricket match statistics and records inspired by open data from Cricsheet.
        </p>
      </footer>
    </div>
  );
}
