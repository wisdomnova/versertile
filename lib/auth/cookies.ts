import { NextResponse } from 'next/server';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'vrs_access',
  REFRESH_TOKEN: 'vrs_refresh',
} as const;

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, REFRESH_COOKIE_OPTIONS);
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, '', {
    ...ACCESS_COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, '', {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
