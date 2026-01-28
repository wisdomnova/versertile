import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { AuthSignupRequest, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

// Password validation rules
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    const supabase = getSupabaseClient();
    const body: AuthSignupRequest = await request.json();

    // Validation
    const { email, password, password_confirm, full_name, wallet_address } = body;

    // Email validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Invalid email address', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Password validation
    if (!password || !password_confirm) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Password fields are required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    if (password !== password_confirm) {
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

    // Supabase client is initialized lazily when needed

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name: full_name || null,
        },
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Failed to create account',
          code: 'AUTH_ERROR',
          details: { message: authError.message },
        },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'User creation failed', code: 'USER_CREATION_FAILED' },
        { status: 500 }
      );
    }

    // Create user record in users table
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email.toLowerCase(),
          full_name: full_name || null,
          wallet_address: wallet_address || null,
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database user creation error:', dbError);
      // Clean up auth user if db insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Failed to create user record',
          code: 'DB_ERROR',
          details: { message: dbError.message },
        },
        { status: 500 }
      );
    }

    // Create initial user stats
    const { error: statsError } = await supabase.from('user_stats').insert([
      {
        user_id: authData.user.id,
      },
    ]);

    if (statsError) {
      console.error('User stats creation error:', statsError);
      // Log but don't fail - stats can be created later
    }

    // Log audit event
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
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

    return NextResponse.json<ApiSuccessResponse>(
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
          message: 'Account created successfully. Please verify your email.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
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
