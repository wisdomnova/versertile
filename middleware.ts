import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';

const PROTECTED_ROUTES = ['/poem', '/dashboard', '/explore', '/settings', '/work'];
const AUTH_ROUTES = ['/auth/login', '/auth/signup'];

function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();
  addSecurityHeaders(response);

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtected && !isAuthRoute) return response;

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  let isAuthenticated = false;

  if (accessToken) {
    try {
      const payload = await verifyToken(accessToken);
      if (payload.type === 'access') isAuthenticated = true;
    } catch {
      /* expired or invalid – try refresh below */
    }
  }

  if (!isAuthenticated && refreshToken) {
    try {
      const refreshPayload = await verifyToken(refreshToken);
      if (refreshPayload.type === 'refresh' && refreshPayload.sub) {
        const newAccess = await signAccessToken({ sub: refreshPayload.sub });
        const newRefresh = await signRefreshToken(refreshPayload.sub);

        const dest = isProtected
          ? NextResponse.next()
          : NextResponse.redirect(new URL('/', request.url));

        addSecurityHeaders(dest);

        dest.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, newAccess, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 15 * 60,
        });
        dest.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, newRefresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });

        isAuthenticated = true;

        if (isAuthRoute) {
          return NextResponse.redirect(new URL('/poem', request.url));
        }

        return dest;
      }
    } catch {
      /* refresh token also invalid */
    }
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/poem', request.url));
  }

  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|VERSERTILE|api).*)',
  ],
};
