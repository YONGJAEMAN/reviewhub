import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { listFacebookPages } from '@/lib/facebook';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    // Get Facebook access token from Account model
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'facebook' },
    });

    if (!account?.access_token) {
      return errorResponse('No Facebook account linked. Please sign in with Facebook first.', 400);
    }

    const pages = await listFacebookPages(account.access_token);
    return successResponse(pages);
  } catch (error) {
    console.error('Failed to list Facebook pages:', error);
    return errorResponse('Failed to fetch Facebook pages', 500);
  }
}
