import { getPlatforms } from '@/services/platformService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const platforms = await getPlatforms();
    return successResponse(platforms);
  } catch {
    return errorResponse('Failed to fetch platforms', 500);
  }
}
