import { useState, useCallback, useEffect } from 'react';
import { soundEngine } from '../engine/audio';

export function useAudio() {
  const [isMuted, setIsMutedState] = useState<boolean>(() => soundEngine.isMuted());

  useEffect(() => {
    setIsMutedState(soundEngine.isMuted());
  }, []);

  const toggleMute = useCallback(() => {
    const next = soundEngine.toggleMute();
    setIsMutedState(next);
    return next;
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    soundEngine.setMuted(muted);
    setIsMutedState(muted);
  }, []);

  const playReelTick = useCallback((pitchOffset?: number) => {
    soundEngine.playReelTick(pitchOffset);
  }, []);

  const playCardPick = useCallback(() => {
    soundEngine.playCardPick();
  }, []);

  const playBatCrack = useCallback(() => {
    soundEngine.playBatCrack();
  }, []);

  const playVictoryFanfare = useCallback(() => {
    soundEngine.playVictoryFanfare();
  }, []);

  const playLossSting = useCallback(() => {
    soundEngine.playLossSting();
  }, []);

  return {
    isMuted,
    toggleMute,
    setMuted,
    playReelTick,
    playCardPick,
    playBatCrack,
    playVictoryFanfare,
    playLossSting,
  };
}
