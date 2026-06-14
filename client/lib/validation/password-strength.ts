/**
 * Deterministic password strength heuristic (design §5, REQ-05).
 * Informative only — never blocks submit (8..128 chars is the only gate).
 * Pure and testable.
 */
export type StrengthLevel = "weak" | "medium" | "strong";

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  level: StrengthLevel;
}

export function passwordStrength(pw: string): PasswordStrength {
  let score = 0;

  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;

  // Clamp to 0..4
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const level: StrengthLevel =
    clamped <= 1 ? "weak" : clamped <= 3 ? "medium" : "strong";

  return { score: clamped, level };
}
