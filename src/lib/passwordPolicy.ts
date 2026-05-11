/**
 * Password policy — enforced at registration and password reset.
 *
 * Rules:
 * - >= 8 characters
 * - At least one letter
 * - At least one digit
 * - Not on a small built-in blocklist of obvious passwords
 *
 * We deliberately avoid forcing symbol/case mixing — those rules push users
 * toward predictable transformations ("Password1!") without improving entropy.
 * Length matters more.
 */
const BLOCKLIST = new Set([
  'password', 'password1', 'password123', 'qwerty', 'qwerty123', 'letmein',
  '12345678', '123456789', 'iloveyou', 'admin1234', 'welcome1', 'changeme',
  'reviewhub', 'reviewhub1', 'reviewhub123',
]);

export interface PasswordValidation {
  valid: boolean;
  error?: string;
}

export function validatePassword(raw: string | null | undefined): PasswordValidation {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (raw.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (raw.length > 128) {
    return { valid: false, error: 'Password must be at most 128 characters' };
  }
  if (!/[A-Za-z]/.test(raw)) {
    return { valid: false, error: 'Password must contain a letter' };
  }
  if (!/[0-9]/.test(raw)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  if (BLOCKLIST.has(raw.toLowerCase())) {
    return { valid: false, error: 'This password is too common. Please choose another.' };
  }
  return { valid: true };
}
