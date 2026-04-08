import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/cookies';
import type { ApiSuccessResponse } from '@/lib/types/api';

export async function POST() {
  const response = NextResponse.json<ApiSuccessResponse>(
    { success: true, message: 'Logged out' },
    { status: 200 }
  );
  return clearAuthCookies(response);
}
