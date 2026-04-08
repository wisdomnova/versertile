import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES, setAuthCookies } from '@/lib/auth/cookies';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'No refresh token', code: 'MISSING_TOKEN' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyToken(refreshToken);

    if (payload.type !== 'refresh' || !payload.sub) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const newAccessToken = await signAccessToken({ sub: payload.sub });
    const newRefreshToken = await signRefreshToken(payload.sub);

    const response = NextResponse.json<ApiSuccessResponse>(
      { success: true, message: 'Tokens refreshed' },
      { status: 200 }
    );

    return setAuthCookies(response, newAccessToken, newRefreshToken);
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Invalid refresh token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}
