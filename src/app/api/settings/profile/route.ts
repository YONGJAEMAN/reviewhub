import type { NextRequest } from 'next/server';
import { getProfile, updateProfile } from '@/services/settingsService';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const profile = await getProfile();
    return successResponse(profile);
  } catch {
    return errorResponse('Failed to fetch profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = await updateProfile(body);
    return successResponse(profile);
  } catch {
    return errorResponse('Failed to update profile', 500);
  }
}
