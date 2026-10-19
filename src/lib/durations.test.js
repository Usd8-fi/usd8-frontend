import { describe, expect, it } from 'vitest';
import { durationAdjective, durationPhrase } from './durations.js';

describe('deployment durations', () => {
  it('names the largest exact unit', () => {
    expect(durationPhrase(604_800)).toBe('7 days');
    expect(durationPhrase(86_400)).toBe('1 day');
    expect(durationPhrase(3_600)).toBe('1 hour');
    expect(durationPhrase(300)).toBe('5 minutes');
    expect(durationPhrase(45)).toBe('45 seconds');
    expect(durationAdjective(604_800)).toBe('7-day');
    expect(durationAdjective(300)).toBe('5-minute');
  });

  it('rounds uneven durations to whole minutes', () => {
    expect(durationPhrase(5_430)).toBe('91 minutes');
  });

  it('returns null rather than guessing when the configured value is unknown', () => {
    for (const value of [null, undefined, 0, -1, Number.NaN]) {
      expect(durationPhrase(value)).toBeNull();
      expect(durationAdjective(value)).toBeNull();
    }
  });
});
