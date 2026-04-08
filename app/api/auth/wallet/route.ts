import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import {
  consumeNonce,
  parseSiweMessage,
  verifySiweSignature,
  validateSiweMessage,
} from '@/lib/auth/siwe';
import { sanitizeEthAddress } from '@/lib/auth/sanitize';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, address } = body;

    if (!message || !signature || !address) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Message, signature, and address are required', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    let cleanAddress: string;
    try {
      cleanAddress = sanitizeEthAddress(address);
    } catch {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid Ethereum address', code: 'INVALID_ADDRESS' },
        { status: 400 }
      );
    }

    const recoveredAddress = verifySiweSignature(message, signature);
    if (recoveredAddress.toLowerCase() !== cleanAddress.toLowerCase()) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Signature verification failed', code: 'INVALID_SIGNATURE' },
        { status: 401 }
      );
    }

    const parsed = parseSiweMessage(message);
    const host = request.headers.get('host') || '';
    const validation = validateSiweMessage(parsed, host, cleanAddress);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: validation.error || 'Invalid message', code: 'INVALID_SIWE' },
        { status: 401 }
      );
    }

    if (!consumeNonce(parsed.nonce, cleanAddress)) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid or expired nonce', code: 'INVALID_NONCE' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', cleanAddress.toLowerCase())
      .single();

    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: `${cleanAddress.toLowerCase().slice(0, 10)}@wallet.versertile`,
            wallet_address: cleanAddress.toLowerCase(),
            email_verified: false,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Wallet user creation error:', createError);
        return NextResponse.json<ApiErrorResponse>(
          { success: false, error: 'Failed to create user', code: 'DB_ERROR' },
          { status: 500 }
        );
      }

      await supabase.from('user_stats').insert([{ user_id: newUser.id }]);
      user = newUser;
    }

    if (!user.is_active) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Account is disabled', code: 'ACCOUNT_DISABLED' },
        { status: 403 }
      );
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const accessToken = await signAccessToken({
      sub: user.id,
      wallet: cleanAddress.toLowerCase(),
    });
    const refreshToken = await signRefreshToken(user.id);

    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert([
      {
        user_id: user.id,
        action: 'auth_wallet',
        entity_type: 'user',
        entity_id: user.id,
        details: { wallet: cleanAddress, method: 'siwe' },
        ip_address: clientIP,
        user_agent: userAgent,
      },
    ]);

    const response = NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            wallet_address: user.wallet_address,
            username: user.username,
            avatar_url: user.avatar_url,
            email_verified: user.email_verified,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_login: user.last_login,
          },
        },
        message: 'Wallet authentication successful',
      },
      { status: 200 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Authentication failed', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
