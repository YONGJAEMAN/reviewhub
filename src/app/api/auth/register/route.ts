import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });

    return successResponse(
      { id: user.id, name: user.name, email: user.email },
      201
    );
  } catch {
    return errorResponse('Failed to create account', 500);
  }
}
