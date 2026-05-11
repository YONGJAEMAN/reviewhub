import { NextResponse } from 'next/server';
import { captureError } from '@/lib/observability';

/**
 * Wrap a Next.js Route Handler with timing + error logging.
 *
 * Usage in a route file:
 *
 *   import { withTiming } from '@/lib/apiTiming';
 *   export const GET = withTiming('reviews.list', async (req) => { ... });
 *
 * What it does:
 *   - Records wall-clock duration
 *   - Adds `Server-Timing` header so DevTools shows the time in the
 *     network panel
 *   - Logs to stdout when handler exceeds `slowThresholdMs` (default 1000)
 *   - Captures unhandled exceptions to Sentry, then re-throws so Next can
 *     return its default 500
 *
 * The route name (first arg) is the tag used in logs/Sentry — keep it
 * stable so dashboards can chart it.
 */
type RouteHandler<C = unknown> = (
  req: Request,
  ctx: C,
) => Promise<Response> | Response;

interface Options {
  slowThresholdMs?: number;
}

export function withTiming<C = unknown>(
  routeName: string,
  handler: RouteHandler<C>,
  options: Options = {},
): RouteHandler<C> {
  const slowMs = options.slowThresholdMs ?? 1000;

  return async function timedHandler(req: Request, ctx: C) {
    const start = performance.now();
    let response: Response;
    let threw: unknown = null;

    try {
      response = await handler(req, ctx);
    } catch (err) {
      threw = err;
      captureError(err, {
        tag: `api:${routeName}`,
        extra: { url: req.url, method: req.method },
      });
      // Re-wrap as a 500 response rather than letting it bubble — that
      // keeps timing/headers consistent.
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }

    const durationMs = Math.round(performance.now() - start);

    // Best-effort Server-Timing header. Some response types are immutable;
    // swallow that case.
    try {
      response.headers.set(
        'Server-Timing',
        `app;dur=${durationMs};desc="${routeName}"`,
      );
    } catch {
      /* ignore */
    }

    // Surface slow handlers in logs so we can investigate.
    if (durationMs > slowMs || threw) {
      console.warn(
        `[api] ${routeName} ${req.method} ${response.status} ${durationMs}ms` +
          (threw ? ' ERROR' : ''),
      );
    }

    return response;
  };
}
