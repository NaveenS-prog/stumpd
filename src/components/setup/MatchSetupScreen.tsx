import React from 'react';
import { GameMode } from '../../types/game';
import { OpponentTeam, Venue, PitchType } from '../../types/tournament';

export interface MatchSetupScreenProps {
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

function getPitchBadge(pitchType: PitchType) {
  switch (pitchType) {
    case 'Dustbowl':
      return {
        label: '🌪️ Dustbowl Turn',
        classes: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
      };
    case 'GreenSeamer':
      return {
        label: '🌿 Green Seamer',
        classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
      };
    case 'FlatBatting':
      return {
        label: '🏏 Flat Batting',
        classes: 'bg-sky-950/80 text-sky-300 border-sky-600/40',
      };
    case 'ExpressBouncy':
      return {
        label: '⚡ Express Bounce',
        classes: 'bg-rose-950/80 text-rose-300 border-rose-600/40',
      };
    case 'SportingBalanced':
    default:
      return {
        label: '⚖️ Sporting Deck',
        classes: 'bg-teal-950/80 text-teal-300 border-teal-600/40',
      };
  }
}

function getTacticalTip(venue: Venue, opponent: OpponentTeam): string {
  switch (venue.pitchType) {
    case 'Dustbowl':
      return `Spin Paradise: ${venue.name} heavily favors spin bowling (+${Math.round((venue.modifier.spinBoost ?? 0.2) * 100)}%). Prioritize mystery spinners and spin-countering batsmen like Joe Root against ${opponent.captain}'s lineup.`;
    case 'GreenSeamer':
      return `Seam Ambush: ${venue.name} offers pronounced seam movement (+${Math.round((venue.modifier.pacerBoost ?? 0.2) * 100)}% pace boost). Draft world-class quicks to rip through ${opponent.name}'s top order.`;
    case 'FlatBatting':
      return `High-Octane Shootout: Batting paradise at ${venue.city}. Par score reaches 190+. Prioritize explosive boundary hitters and death overs yorker specialists.`;
    case 'ExpressBouncy':
      return `Hostile Carry: Fast, bouncing track rewards tall seamers and fearless hook/pull shotmakers. Wicketkeepers with sharp reflexes are essential.`;
    case 'SportingBalanced':
    default:
      return `Tactical Equilibrium: True sporting balance between bat and ball. A well-rounded XI with 2+ pacers, 1+ spinner, a specialist wicketkeeper, and genuine allrounders will hold the tactical edge.`;
  }
}

export const MatchSetupScreen: React.FC<MatchSetupScreenProps> = ({
  gameMode,
  opponents,
  venues,
  selectedOpponent,
  selectedVenue,
  onSelectOpponent,
  onSelectVenue,
  onProceedToDraft,
  onBackToHome,
}) => {
  const pitchBadge = getPitchBadge(selectedVenue.pitchType);
  const tacticalTip = getTacticalTip(selectedVenue, selectedOpponent);

  return (
    <div className="min-h-screen bg-[#07110D] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-900/60 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black tracking-wider text-amber-400">STUMPD</span>
              <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                {gameMode} Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white">
              Match Setup & Tactical Intel
            </h1>
            <p className="text-sm text-emerald-400/80">
              Select your targeted opposition, home venue, and pitch conditions before entering the draft room.
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="px-4 py-2 text-sm rounded-lg border border-emerald-800/80 text-emerald-300 hover:bg-emerald-950/70 hover:border-emerald-600 transition"
          >
            ← Back to Home
          </button>
        </header>

        {/* Section 1: Choose Opposition */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">1.</span> Choose Your Opponent
              </h2>
              <p className="text-xs text-gray-400">
                Pick the historic dynasty you wish to challenge in this campaign match.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              {opponents.length} Dynasties Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {opponents.map((opp) => {
              const isSelected = opp.id === selectedOpponent.id;
              return (
                <button
                  key={opp.id}
                  onClick={() => onSelectOpponent(opp)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#162f23] to-[#0d1e16] border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/40'
                      : 'bg-[#0d1e16]/80 border-emerald-900/70 hover:border-emerald-600/70 hover:bg-[#12291e]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl">
                      Selected Target
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        {opp.era}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                      {opp.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {opp.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/60 text-xs space-y-1">
                    <div className="text-gray-300">
                      <span className="text-gray-500">Captain:</span> {opp.captain}
                    </div>
                    <div className="text-gray-300">
                      <span className="text-gray-500">Key Star:</span>{' '}
                      <span className="text-amber-300 font-semibold">{opp.keyPlayer}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opp.strengths.slice(0, 2).map((st, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800/40"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Choose Stadium & Pitch */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">2.</span> Choose Stadium & Pitch Deck
              </h2>
              <p className="text-xs text-gray-400">
                Stadiums carry authentic, unyielding turf characteristics affecting spin, pace, and scoring tempo.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">
              {venues.length} World Stadiums
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {venues.map((venue) => {
              const isSelected = venue.id === selectedVenue.id;
              const badge = getPitchBadge(venue.pitchType);

              return (
                <button
                  key={venue.id}
                  onClick={() => onSelectVenue(venue)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#143224] to-[#0c2017] border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/40'
                      : 'bg-[#0d1e16]/80 border-emerald-900/70 hover:border-emerald-600/70 hover:bg-[#12291e]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-emerald-400 text-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl">
                      Active Venue
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs text-gray-400">
                        {venue.city}, {venue.country}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {venue.name}
                    </h3>

                    <div className="mt-2">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                      {venue.pitchDescription}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-900/60 text-xs">
                    <span className="text-amber-400 font-medium">Modifier: </span>
                    <span className="text-gray-300">{venue.modifier.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 3: Tactical Intel Summary Card */}
        <section className="bg-gradient-to-r from-[#0d2218] via-[#122e20] to-[#0d2218] rounded-2xl border border-amber-400/40 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
                  Tactical Match Briefing
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border ${pitchBadge.classes}`}>
                  {pitchBadge.label}
                </span>
              </div>

              <div className="text-lg sm:text-xl font-extrabold text-white">
                <span className="text-gray-400 font-normal">Fixture: </span>
                <span className="text-amber-300">{selectedOpponent.name}</span>
                <span className="text-gray-400 font-normal"> vs </span>
                <span className="text-emerald-400">Your Drafted XI</span>
              </div>

              <div className="text-sm text-gray-300">
                <span className="text-gray-500 font-medium">Venue: </span>
                <span className="font-semibold text-white">{selectedVenue.name}</span>
                <span className="text-gray-400"> ({selectedVenue.city}, {selectedVenue.country})</span>
              </div>

              <div className="bg-[#07130e]/80 border border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-200/90 leading-relaxed">
                💡 <span className="font-bold text-amber-300">Tactical Recommendation: </span>
                {tacticalTip}
              </div>
            </div>

            {/* Lock Fixture & Proceed Action */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-center gap-3">
              <button
                onClick={onProceedToDraft}
                className="w-full md:w-64 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-black text-base uppercase tracking-wider shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Lock Fixture & Begin Draft</span>
                <span>→</span>
              </button>
              <span className="text-[11px] text-gray-400 text-center">
                Conditions lock permanently for the draft
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
