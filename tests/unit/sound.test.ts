import { describe, it, expect, beforeEach } from 'vitest';
import { getAudioMuted, setAudioMuted, toggleAudioMuted } from '../../src/utils/sound';

describe('Sound Manager Controller', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to unmuted (false)', () => {
    expect(getAudioMuted()).toBe(false);
  });

  it('toggles and persists mute state in localStorage', () => {
    expect(toggleAudioMuted()).toBe(true);
    expect(getAudioMuted()).toBe(true);
    expect(toggleAudioMuted()).toBe(false);
    expect(getAudioMuted()).toBe(false);
  });

  it('explicitly sets mute state', () => {
    setAudioMuted(true);
    expect(getAudioMuted()).toBe(true);
    setAudioMuted(false);
    expect(getAudioMuted()).toBe(false);
  });
});
