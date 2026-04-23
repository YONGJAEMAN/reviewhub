import { auth } from '@/lib/auth';
import { errorResponse } from '@/lib/api';
import type { NextResponse } from 'next/server';

/**
 * Admin authorization — email-based allowlist.
 *
 * Set `ADMIN_EMAILS` env var as a comma-separated list of admin emails.
 * In dev, if the variable is not set, admin access is effectively disabled
 * (nobody is admin) — secure-by-default. Never open it up to "first user"
 * or "any OWNER" heuristics: every registered user is a business OWNER
 * in this app by design.
 */
export function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? '';
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().has(email.toLowerCase());
}

/**
 * Call from an admin API route. Returns:
 *   - `null` — authorized, continue
 *   - `NextResponse` — 401/403 to send back immediately
 *
 * Usage:
 *   const guard = await requireAdmin();
 *   if (guard) return guard;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('Unauthorized', 401);
  if (!isAdminEmail(session.user.email)) return errorResponse('Forbidden', 403);
  return null;
}
