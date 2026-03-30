import type { NextRequest } from 'next/server';
import {
  connectPlatform,
  disconnectPlatform,
  syncPlatform,
} from '@/services/platformService';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platform = await connectPlatform(id);
    if (!platform) return errorResponse('Platform not found', 404);
    return successResponse(platform);
  } catch {
    return errorResponse('Failed to connect platform', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platform = await disconnectPlatform(id);
    if (!platform) return errorResponse('Platform not found', 404);
    return successResponse(platform);
  } catch {
    return errorResponse('Failed to disconnect platform', 500);
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await syncPlatform(id);
    return successResponse(result);
  } catch {
    return errorResponse('Failed to sync platform', 500);
  }
}
