import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInviteCode, listInviteCodes } from '@/services/inviteCodeService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const codes = await listInviteCodes();
    return successResponse(codes);
  } catch {
    return errorResponse('Failed to fetch invite codes', 500);
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const [code] = await createInviteCode(1);
    return successResponse(code, 201);
  } catch {
    return errorResponse('Failed to generate invite code', 500);
  }
}
