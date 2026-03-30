import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
