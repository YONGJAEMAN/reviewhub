/**
 * @jest-environment node
 */
import { validatePassword } from '../passwordPolicy';

describe('validatePassword', () => {
  it('rejects empty / non-string', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword(null).valid).toBe(false);
    expect(validatePassword(undefined).valid).toBe(false);
  });

  it('rejects too short', () => {
    const r = validatePassword('Ab1');
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/8 characters/);
  });

  it('rejects too long', () => {
    const r = validatePassword('a'.repeat(129) + '1');
    expect(r.valid).toBe(false);
  });

  it('rejects no letter', () => {
    expect(validatePassword('12345678').valid).toBe(false);
  });

  it('rejects no digit', () => {
    expect(validatePassword('abcdefghi').valid).toBe(false);
  });

  it('rejects blocklisted commons', () => {
    expect(validatePassword('password1').valid).toBe(false);
    expect(validatePassword('PASSWORD1').valid).toBe(false); // case-insensitive
    expect(validatePassword('reviewhub123').valid).toBe(false);
  });

  it('accepts reasonable password', () => {
    expect(validatePassword('myDog Loves Tacos 7').valid).toBe(true);
    expect(validatePassword('correct-horse-battery-staple-9').valid).toBe(true);
  });
});
