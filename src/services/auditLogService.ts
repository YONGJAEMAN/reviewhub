import { prisma } from '@/lib/prisma';
import { captureError } from '@/lib/observability';

/**
 * Append-only audit log writer.
 *
 * Safe-by-default: never throws — a logging failure shouldn't break the
 * caller. We capture failures to Sentry so observability isn't lost.
 *
 * Action names are dotted verbs ("team.member_added", "billing.plan_changed",
 * "account.deletion_requested") — keep them stable so dashboards can chart them.
 */
export interface AuditEntry {
  actorId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  businessId?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        businessId: entry.businessId ?? null,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  } catch (err) {
    captureError(err, {
      tag: 'audit',
      extra: { action: entry.action, actorId: entry.actorId },
    });
  }
}

/**
 * Extract caller IP + UA from a Next.js request for audit context.
 */
export function auditContextFromRequest(req: Request): { ip: string | null; userAgent: string | null } {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null;
  const userAgent = req.headers.get('user-agent') ?? null;
  return { ip, userAgent };
}
