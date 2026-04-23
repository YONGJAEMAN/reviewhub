/**
 * Environment variable validation — centralized, framework-agnostic.
 *
 * Goals:
 * 1. Hard-fail at boot if CRITICAL vars are missing (DB, Auth).
 * 2. Warn (not fail) for OPTIONAL integrations so dev works without every
 *    third-party key.
 * 3. Surface one clear report instead of scattered `process.env.FOO!` crashes
 *    deep inside request handlers.
 *
 * Usage:
 *   - `validateEnv()` — call once at server startup; throws on missing critical.
 *   - `requireEnv('STRIPE_SECRET_KEY')` — call inside handlers that need a specific
 *     integration; throws a clear error if not configured.
 *   - `hasEnv('STRIPE_SECRET_KEY')` — boolean check.
 */

type EnvKey = string;

interface EnvSpec {
  key: EnvKey;
  description: string;
  critical: boolean;
}

const SPEC: EnvSpec[] = [
  // Critical — app cannot function without these
  { key: 'DATABASE_URL', description: 'Postgres connection (Supabase pooler)', critical: true },
  { key: 'NEXTAUTH_SECRET', description: 'NextAuth session signing secret', critical: true },

  // Integration-level — warn only, handlers that use them throw on demand
  { key: 'DIRECT_URL', description: 'Postgres direct connection (migrations)', critical: false },
  { key: 'NEXTAUTH_URL', description: 'Canonical app URL for auth callbacks', critical: false },
  { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth / Business Profile', critical: false },
  { key: 'GOOGLE_CLIENT_SECRET', description: 'Google OAuth / Business Profile', critical: false },
  { key: 'GOOGLE_PLACES_API_KEY', description: 'Competitor tracking', critical: false },
  { key: 'FACEBOOK_CLIENT_ID', description: 'Facebook Graph API (Page reviews)', critical: false },
  { key: 'FACEBOOK_CLIENT_SECRET', description: 'Facebook Graph API', critical: false },
  { key: 'YELP_API_KEY', description: 'Yelp Fusion API', critical: false },
  { key: 'WHATSAPP_API_TOKEN', description: 'WhatsApp Business Cloud API', critical: false },
  { key: 'WHATSAPP_PHONE_NUMBER_ID', description: 'WhatsApp sender phone id', critical: false },
  { key: 'STRIPE_SECRET_KEY', description: 'Stripe payments', critical: false },
  { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signature verification', critical: false },
  { key: 'ANTHROPIC_API_KEY', description: 'Claude AI (suggest-reply, sentiment)', critical: false },
  { key: 'RESEND_API_KEY', description: 'Transactional email', critical: false },
  { key: 'CRON_SECRET', description: 'Vercel Cron authorization', critical: false },
  { key: 'SENTRY_DSN', description: 'Error monitoring', critical: false },
  { key: 'ADMIN_EMAILS', description: 'Comma-separated admin email allowlist', critical: false },
];

export function hasEnv(key: EnvKey): boolean {
  const v = process.env[key];
  return typeof v === 'string' && v.length > 0;
}

export function requireEnv(key: EnvKey): string {
  const v = process.env[key];
  if (!v) {
    const spec = SPEC.find((s) => s.key === key);
    const hint = spec ? ` — ${spec.description}` : '';
    throw new Error(`Missing required env var: ${key}${hint}`);
  }
  return v;
}

export interface EnvReport {
  ok: boolean;
  missingCritical: EnvSpec[];
  missingOptional: EnvSpec[];
}

export function checkEnv(): EnvReport {
  const missingCritical: EnvSpec[] = [];
  const missingOptional: EnvSpec[] = [];
  for (const spec of SPEC) {
    if (!hasEnv(spec.key)) {
      if (spec.critical) missingCritical.push(spec);
      else missingOptional.push(spec);
    }
  }
  return {
    ok: missingCritical.length === 0,
    missingCritical,
    missingOptional,
  };
}

/**
 * Call once at server startup. Throws on missing critical envs.
 * Logs a single warning block for optional integrations.
 *
 * Safe to call multiple times — only the first invocation logs.
 */
let _validated = false;
export function validateEnv(): EnvReport {
  const report = checkEnv();
  if (_validated) return report;
  _validated = true;

  if (report.missingCritical.length > 0) {
    const list = report.missingCritical
      .map((s) => `  - ${s.key}: ${s.description}`)
      .join('\n');
    throw new Error(
      `Fatal: missing critical environment variables:\n${list}\n` +
        `Refer to .env.example for the full list.`,
    );
  }

  // Skip optional-env warnings during `next build` static generation — the
  // hundreds of route bundles each reload this module and flood the build
  // log. They still fire at real runtime on the first request.
  const isBuildPhase =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NEXT_PHASE === 'phase-export';
  if (
    report.missingOptional.length > 0 &&
    process.env.NODE_ENV !== 'test' &&
    !isBuildPhase
  ) {
    const list = report.missingOptional
      .map((s) => `  - ${s.key}: ${s.description}`)
      .join('\n');
    // One concise block so ops can spot it in logs.
    console.warn(
      `[env] ${report.missingOptional.length} optional integrations are not configured:\n${list}`,
    );
  }

  return report;
}
