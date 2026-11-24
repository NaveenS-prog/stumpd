/**
 * Sound Controller & Audio Mute Manager for Stumpd.
 */
import { soundEngine } from '../engine/audio';

export function getAudioMuted(): boolean {
  return soundEngine.isMuted();
}

export function setAudioMuted(muted: boolean): void {
  soundEngine.setMuted(muted);
}

export function toggleAudioMuted(): boolean {
  return soundEngine.toggleMute();
}

let isUnlocked = false;

/**
 * Attaches a one-time user-gesture event listener for mobile Safari / iOS
 * to unlock Web Audio context before playback.
 */
export function initAudioUnlock(): void {
  if (typeof window === 'undefined' || isUnlocked) return;

  const unlock = () => {
    isUnlocked = true;
    try {
      soundEngine.unlockContext();
    } catch {
      // Ignore
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}
