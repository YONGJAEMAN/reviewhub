import { auth } from '@/lib/auth';
import { getGoogleAccessToken, listGoogleAccounts } from '@/lib/google';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse('Unauthorized', 401);

    const accessToken = await getGoogleAccessToken(session.user.id);
    if (!accessToken) {
      return errorResponse('No Google account linked. Please sign in with Google first.', 400);
    }

    const accounts = await listGoogleAccounts(accessToken);
    return successResponse(accounts);
  } catch (error) {
    console.error('Failed to list Google accounts:', error);
    return errorResponse('Failed to fetch Google accounts', 500);
  }
}
