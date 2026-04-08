import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/cookies';
import { sanitizeEmail, sanitizePassword, sanitizeText, sanitizeEthAddress } from '@/lib/auth/sanitize';
import type { AuthSignupRequest, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase credentials not configured');
  return createClient(url, key);
}

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (!PASSWORD_REGEX.test(password)) {
    errors.push('Password must contain uppercase, lowercase, number, and special character');
  }
  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body: AuthSignupRequest = await request.json();

    let email: string;
    try {
      email = sanitizeEmail(body.email);
    } catch {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid email address', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const password = sanitizePassword(body.password);
    const passwordConfirm = sanitizePassword(body.password_confirm);
    const fullName = body.full_name ? sanitizeText(body.full_name) : null;

    let walletAddress: string | null = null;
    if (body.wallet_address) {
      try {
        walletAddress = sanitizeEthAddress(body.wallet_address);
      } catch {
        return NextResponse.json<ApiErrorResponse>(
          { success: false, error: 'Invalid wallet address', code: 'INVALID_WALLET' },
          { status: 400 }
        );
      }
    }

    if (!password || !passwordConfirm) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Password fields are required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (password !== passwordConfirm) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Passwords do not match', code: 'PASSWORD_MISMATCH' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Password does not meet requirements',
          code: 'WEAK_PASSWORD',
          details: { errors: passwordValidation.errors },
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError || !authData.user) {
      console.error('Auth signup error:', authError);
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Failed to create account', code: 'AUTH_ERROR' },
        { status: 500 }
      );
    }

    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email,
          full_name: fullName,
          wallet_address: walletAddress,
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database user creation error:', dbError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Failed to create user record', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    await supabase.from('user_stats').insert([{ user_id: authData.user.id }]);

    const accessToken = await signAccessToken({
      sub: newUser.id,
      email: newUser.email,
    });
    const refreshToken = await signRefreshToken(newUser.id);

    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert([
      {
        user_id: authData.user.id,
        action: 'auth_signup',
        entity_type: 'user',
        entity_id: authData.user.id,
        details: { email, method: 'email' },
        ip_address: clientIP,
        user_agent: userAgent,
      },
    ]);

    const response = NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            wallet_address: newUser.wallet_address,
            email_verified: newUser.email_verified,
            is_active: newUser.is_active,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at,
          },
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    );

    return setAuthCookies(response, accessToken, refreshToken);
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
