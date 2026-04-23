import { createInviteCode, listInviteCodes } from '@/services/inviteCodeService';
import { successResponse, errorResponse } from '@/lib/api';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const codes = await listInviteCodes();
    return successResponse(codes);
  } catch {
    return errorResponse('Failed to fetch invite codes', 500);
  }
}

export async function POST() {
  try {
    const guard = await requireAdmin();
    if (guard) return guard;

    const [code] = await createInviteCode(1);
    return successResponse(code, 201);
  } catch {
    return errorResponse('Failed to generate invite code', 500);
  }
}
