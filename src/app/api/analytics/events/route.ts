import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { trackEvent } from '@/services/productAnalytics';
import { rateLimitOrResponse } from '@/lib/rateLimit';

/**
 * Client-side event ingestion.
 *
 * Used from the browser to record funnel steps (pricing.viewed, onboarding
 * step transitions, etc). Server-side events should call trackEvent()
 * directly rather than going through this endpoint.
 *
 * The endpoint is intentionally permissive — it accepts events from
 * authenticated and anonymous sessions both — but rate-limited per IP so
 * a misbehaving client can't flood the DB.
 *
 * Body: { name: string, properties?: Record<string, unknown>, businessId?: string, sessionId?: string }
 */
const ALLOWED_PREFIXES = ['onboarding.', 'pricing.', 'checkout.', 'ai.', 'feature.'];

export async function POST(request: Request) {
  const limited = rateLimitOrResponse(request, {
    name: 'analytics-events',
    windowMs: 60 * 1000,
    max: 60, // 1/sec on average is plenty for a UI funnel
  });
  if (limited) return limited;

  let body: {
    name?: string;
    properties?: Record<string, unknown>;
    businessId?: string;
    sessionId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  const { name, properties, businessId, sessionId } = body;
  if (!name || typeof name !== 'string') return errorResponse('name is required', 400);
  // Guardrail: reject arbitrary event names so the table doesn't fill with
  // experiment debris. Add new prefixes here as needed.
  if (!ALLOWED_PREFIXES.some((p) => name.startsWith(p))) {
    return errorResponse('Unknown event prefix', 400);
  }
  if (name.length > 100) return errorResponse('name too long', 400);

  const session = await auth();
  await trackEvent({
    name,
    userId: session?.user?.id ?? null,
    businessId: businessId ?? null,
    sessionId: sessionId ?? null,
    properties: properties ?? null,
  });

  return successResponse({ ok: true });
}
