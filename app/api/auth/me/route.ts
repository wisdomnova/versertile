import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Not authenticated', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  try {
    const payload = await verifyToken(token);

    if (payload.type !== 'access' || !payload.sub) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select(
        'id, email, full_name, wallet_address, username, avatar_url, email_verified, is_active, created_at, updated_at, last_login'
      )
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, data: { user } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Invalid token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }
}
