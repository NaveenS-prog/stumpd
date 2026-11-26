import React from 'react';

interface TossBannerProps {
  winner: string;
  decision: 'bat' | 'bowl';
  venueName: string;
  userBatsFirst?: boolean;
}

export const TossBanner: React.FC<TossBannerProps> = ({
  winner,
  decision,
  venueName,
  userBatsFirst,
}) => {
  const isUserBattingFirst =
    userBatsFirst !== undefined
      ? userBatsFirst
      : (winner.startsWith('User') && decision === 'bat') ||
        (!winner.startsWith('User') && decision === 'bowl');

  return (
    <div className="bg-gradient-to-r from-turf-900 via-turf-800 to-turf-900 border border-gold-400/40 rounded-xl p-3 shadow-md flex items-center gap-3 my-3">
      <div className="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400 flex items-center justify-center text-gold-400 font-bold text-sm shrink-0">
        🪙
      </div>
      <div>
        <span className="text-[10px] font-mono uppercase text-gold-400 font-bold tracking-widest block">
          Match Toss Result
        </span>
        <p className="text-xs text-white">
          <span className="font-bold text-gold-300">{winner}</span> won the toss and{' '}
          <span className="font-semibold text-white">elected to {decision}</span> first at{' '}
          <span className="text-turf-300">{venueName}</span>.
        </p>
        <span className="text-[11px] font-mono text-gold-300 mt-0.5 block">
          {isUserBattingFirst
            ? '🏏 User XI batting first (Setting target)'
            : '🎯 User XI bowling first (Chasing target)'}
        </span>
      </div>
    </div>
  );
};
