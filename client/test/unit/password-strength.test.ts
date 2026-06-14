/**
 * Unit tests for lib/validation/password-strength.ts
 *
 * Scoring rules (from source):
 *   +1 if length >= 8
 *   +1 if length >= 12
 *   +1 if has lowercase AND uppercase
 *   +1 if has digit
 *   +1 if has special char (not A-Za-z0-9)
 *   Max raw score = 5, clamped to 4.
 *   level: score <= 1 → "weak", score <= 3 → "medium", score === 4 → "strong"
 */
import { describe, it, expect } from 'vitest'
import { passwordStrength } from '@/lib/validation/password-strength'
import type { StrengthLevel } from '@/lib/validation/password-strength'

describe('passwordStrength', () => {
  it('empty string → score 0, level weak', () => {
    const result = passwordStrength('')
    expect(result.score).toBe(0)
    expect(result.level).toBe<StrengthLevel>('weak')
  })

  it('< 8 chars with mixed case and digit → score 2, level medium', () => {
    // "Abc1234": 7 chars — lower+upper (+1), digit (+1) = 2, no length bonus → medium
    const result = passwordStrength('Abc1234')
    expect(result.score).toBe(2)
    expect(result.level).toBe<StrengthLevel>('medium')
  })

  it('exactly 8 chars, lowercase only → score 1, level weak', () => {
    // "abcdefgh": length >= 8 (+1), no other criteria = 1 → weak
    const result = passwordStrength('abcdefgh')
    expect(result.score).toBe(1)
    expect(result.level).toBe<StrengthLevel>('weak')
  })

  it('8 chars, lower+upper+digit → score 3, level medium', () => {
    // "Abcde123": length >= 8 (+1), lower+upper (+1), digit (+1) = 3 → medium
    const result = passwordStrength('Abcde123')
    expect(result.score).toBe(3)
    expect(result.level).toBe<StrengthLevel>('medium')
  })

  it('12+ chars, all criteria met → score 4 (clamped from 5), level strong', () => {
    // "Abcdef123!@#": all 5 criteria fire → raw 5, clamped to 4 → strong
    const result = passwordStrength('Abcdef123!@#')
    expect(result.score).toBe(4)
    expect(result.level).toBe<StrengthLevel>('strong')
  })

  it('score is always clamped at 4 regardless of criteria count', () => {
    const result = passwordStrength('Abcdef123!@#')
    expect(result.score).toBeLessThanOrEqual(4)
  })

  it('8 chars, lower+upper+special but no digit → score 3, level medium', () => {
    // "Abcdef@!": length >= 8 (+1), lower+upper (+1), special (+1) = 3 → medium
    const result = passwordStrength('Abcdef@!')
    expect(result.score).toBe(3)
    expect(result.level).toBe<StrengthLevel>('medium')
  })

  it('12 chars, lowercase only → score 2, level medium', () => {
    // "abcdefghijkl": length >= 8 (+1), length >= 12 (+1) = 2 → medium
    const result = passwordStrength('abcdefghijkl')
    expect(result.score).toBe(2)
    expect(result.level).toBe<StrengthLevel>('medium')
  })

  it('12 chars, lower+upper+digit (no special) → score 4, level strong', () => {
    // "Abcde1234567": length >= 8 (+1), length >= 12 (+1), lower+upper (+1), digit (+1) = 4 → strong
    const result = passwordStrength('Abcde1234567')
    expect(result.score).toBe(4)
    expect(result.level).toBe<StrengthLevel>('strong')
  })

  it('exactly length >= 8, no other criteria → score 1, level weak', () => {
    const result = passwordStrength('aaaaaaaa')
    expect(result.score).toBe(1)
    expect(result.level).toBe<StrengthLevel>('weak')
  })

  it('length >= 8 + digit only → score 2, level medium', () => {
    // "aaaaaaa1": length >= 8 (+1), digit (+1) = 2 → medium
    const result = passwordStrength('aaaaaaa1')
    expect(result.score).toBe(2)
    expect(result.level).toBe<StrengthLevel>('medium')
  })
})
