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

  const supabase = getSupabaseClient();

  const [statsRes, analysesRes, worksRes] = await Promise.all([
    supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('analyses')
      .select('id, overall_score, originality_score, quality_score, expression_score, feedback, created_at, is_published, text_length')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('works')
      .select('id, title, genre, poem_score, view_count, like_count, is_published, created_at, published_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json<ApiSuccessResponse>(
    {
      success: true,
      data: {
        stats: statsRes.data || {
          total_analyses: 0,
          total_works: 0,
          total_published_works: 0,
          total_engagement_count: 0,
          total_reads: 0,
          total_likes: 0,
          average_poem_score: null,
          reputation_score: 0,
          total_earnings: 0,
        },
        recent_analyses: analysesRes.data || [],
        recent_works: worksRes.data || [],
      },
    },
    { status: 200 }
  );
}
