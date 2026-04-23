import * as Sentry from '@sentry/nextjs';

/**
 * Log + forward an error to Sentry. Safe to call in environments where
 * Sentry isn't configured — it no-ops if SENTRY_DSN is absent (see
 * sentry.server.config.ts).
 *
 * Prefer this over raw `console.error` inside cron / webhook handlers so
 * we get both local stdout AND an issue in Sentry.
 */
export function captureError(
  err: unknown,
  context?: { tag?: string; extra?: Record<string, unknown> },
): void {
  const tag = context?.tag ?? 'app';
  // eslint-disable-next-line no-console
  console.error(`[${tag}]`, err);
  try {
    Sentry.captureException(err, {
      tags: { source: tag },
      extra: context?.extra,
    });
  } catch {
    // Sentry init may have failed — don't crash the caller.
  }
}

/**
 * Wrap an async operation with uniform logging + Sentry capture.
 * Resolves to `{ ok: true, data }` or `{ ok: false, error }` — handlers can
 * then produce the right HTTP response without try/catch boilerplate.
 */
export async function safeRun<T>(
  tag: string,
  fn: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; error: unknown }> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    captureError(error, { tag });
    return { ok: false, error };
  }
}
