/**
 * Deterministic PRNG and Daily Challenge Seed Generator for Stumpd.
 */

export function getDailyDateString(date: Date = new Date()): string {
  // Offset by UTC + 5 hours 30 minutes for Indian Standard Time (IST)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(date.getTime() + istOffsetMs);
  const yyyy = istTime.getUTCFullYear();
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istTime.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h;
}

export function getDailySeed(dateStr?: string): number {
  const effectiveDate = dateStr || getDailyDateString();
  return hashString(`stumpd-daily-challenge-v1-${effectiveDate}`);
}

/**
 * Fast, high-quality 32-bit Mulberry32 PRNG.
 * Returns deterministic pseudo-random floats in [0, 1).
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return function mulberry32(): number {
    let t = (s += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
