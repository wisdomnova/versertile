import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { AuthLoginRequest, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: AuthLoginRequest = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    // Supabase client is initialized lazily when needed

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      console.error('Auth login error:', authError.message);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Authentication failed', code: 'AUTH_FAILED' },
        { status: 401 }
      );
    }

    // Fetch user data from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      console.error('User fetch error:', userError);
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Account is disabled', code: 'ACCOUNT_DISABLED' },
        { status: 403 }
      );
    }

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (updateError) {
      console.error('Last login update error:', updateError);
    }

    // Log audit event
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert([
      {
        user_id: authData.user.id,
        action: 'auth_login',
        entity_type: 'user',
        entity_id: authData.user.id,
        details: { email, method: 'email' },
        ip_address: clientIP,
        user_agent: userAgent,
      },
    ]);

    return NextResponse.json<ApiSuccessResponse>(
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
          session: authData.session,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
