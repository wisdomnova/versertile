import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { sanitizeText, sanitizeEmail } from '@/lib/auth/sanitize';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (!token) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  let userId: string;
  try {
    const payload = await verifyToken(token);
    if (payload.type !== 'access' || !payload.sub) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    userId = payload.sub;
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const updates: Record<string, string | null> = {};

  if (body.full_name !== undefined) {
    updates.full_name = body.full_name ? sanitizeText(body.full_name).slice(0, 100) : null;
  }
  if (body.username !== undefined) {
    const username = body.username ? sanitizeText(body.username).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30) : null;
    if (username && username.length < 3) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Username must be at least 3 characters', code: 'INVALID_USERNAME' },
        { status: 400 }
      );
    }
    updates.username = username;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'No fields to update', code: 'NO_CHANGES' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  if (updates.username) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', updates.username)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Username is already taken', code: 'USERNAME_TAKEN' },
        { status: 409 }
      );
    }
  }

  const { data: user, error: dbError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, email, full_name, wallet_address, username, avatar_url, email_verified, is_active, created_at, updated_at, last_login')
    .single();

  if (dbError) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Failed to update profile', code: 'DB_ERROR' },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiSuccessResponse>(
    { success: true, data: { user }, message: 'Profile updated' },
    { status: 200 }
  );
}
