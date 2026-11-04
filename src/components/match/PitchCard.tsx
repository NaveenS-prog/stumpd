import React from 'react';
import { Venue } from '../../types/tournament';

interface PitchCardProps {
  venue: Venue;
}

export const PitchCard: React.FC<PitchCardProps> = ({ venue }) => {
  const getBadgeColor = (pitchType: string) => {
    switch (pitchType) {
      case 'Dustbowl':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'GreenSeamer':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'FlatBatting':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'ExpressBouncy':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
  };

  return (
    <div className="bg-turf-900 border border-turf-700/80 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[10px] font-mono uppercase text-turf-400 tracking-wider">
            Match Venue & Pitch Surface
          </span>
          <h3 className="text-base font-bold text-white">
            {venue.name}
          </h3>
          <p className="text-xs text-turf-400">
            {venue.city}, {venue.country}
          </p>
        </div>

        <span
          className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${getBadgeColor(
            venue.pitchType
          )}`}
        >
          {venue.pitchType}
        </span>
      </div>

      <p className="text-xs text-turf-300 leading-relaxed mb-3">
        {venue.pitchDescription}
      </p>

      {/* Tactical Boost Callout */}
      <div className="bg-turf-950/90 border border-gold-400/30 rounded-lg p-2.5 flex items-center gap-2">
        <span className="text-base">⚡</span>
        <div>
          <span className="text-[10px] font-mono uppercase text-gold-400 font-bold tracking-wider block">
            Tactical Modifier
          </span>
          <span className="text-xs font-medium text-white">
            {venue.modifier.description}
          </span>
        </div>
      </div>
    </div>
  );
};
