import { describe, it, expect, beforeEach } from 'vitest';
import { soundEngine } from '../../src/engine/audio';

describe('Web Audio Synthesizer', () => {
  beforeEach(() => {
    soundEngine.setMuted(false);
  });

  it('respects mute state and does not throw when playing sound effects', () => {
    expect(soundEngine.isMuted()).toBe(false);
    soundEngine.setMuted(true);
    expect(soundEngine.isMuted()).toBe(true);

    // Audio calls must not throw even if Web Audio is mocked or muted
    expect(() => soundEngine.playReelTick(1)).not.toThrow();
    expect(() => soundEngine.playCardPick()).not.toThrow();
    expect(() => soundEngine.playBatCrack()).not.toThrow();
    expect(() => soundEngine.playVictoryFanfare()).not.toThrow();
    expect(() => soundEngine.playLossSting()).not.toThrow();
  });

  it('toggles mute status correctly', () => {
    soundEngine.setMuted(false);
    const toggled = soundEngine.toggleMute();
    expect(toggled).toBe(true);
    expect(soundEngine.isMuted()).toBe(true);
    const toggledBack = soundEngine.toggleMute();
    expect(toggledBack).toBe(false);
    expect(soundEngine.isMuted()).toBe(false);
  });
});
