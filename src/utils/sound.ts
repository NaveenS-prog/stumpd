/**
 * Sound Controller & Audio Mute Manager for Stumpd.
 */
import { soundEngine } from '../engine/audio';

const STORAGE_KEY_MUTED = 'stumpd_muted';
let memoryMuted = false;

function safeGetMuted(): boolean {
  if (typeof window === 'undefined') return memoryMuted;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MUTED);
    if (raw !== null) {
      return raw === 'true';
    }
    return memoryMuted;
  } catch {
    return memoryMuted;
  }
}

function safeSetMuted(muted: boolean): void {
  memoryMuted = muted;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MUTED, String(muted));
  } catch {
    // Ignore private browsing errors
  }
}

export function getAudioMuted(): boolean {
  return safeGetMuted();
}

export function setAudioMuted(muted: boolean): void {
  safeSetMuted(muted);
  soundEngine.setMuted(muted);
}

export function toggleAudioMuted(): boolean {
  const next = !getAudioMuted();
  setAudioMuted(next);
  return next;
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const dummyCtx = new AudioCtx();
        if (dummyCtx.state === 'suspended') {
          dummyCtx.resume().catch(() => {});
        }
      }
    } catch {
      // Ignore
    }
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}
