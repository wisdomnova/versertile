import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { sanitizeText } from '@/lib/auth/sanitize';
import type { PublishWorkRequest, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const url = request.nextUrl;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 50);
  const genre = url.searchParams.get('genre');
  const sort = url.searchParams.get('sort') || 'recent';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('works')
    .select('id, user_id, title, description, genre, poem_score, view_count, like_count, rating_average, rating_count, created_at, published_at, content_length', { count: 'exact' })
    .eq('is_published', true)
    .is('deleted_at', null);

  if (genre) {
    query = query.eq('genre', genre);
  }

  if (sort === 'top') {
    query = query.order('poem_score', { ascending: false, nullsFirst: false });
  } else if (sort === 'popular') {
    query = query.order('like_count', { ascending: false });
  } else {
    query = query.order('published_at', { ascending: false, nullsFirst: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: works, count, error } = await query;

  if (error) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Failed to fetch works', code: 'DB_ERROR' },
      { status: 500 }
    );
  }

  const userIds = [...new Set((works || []).map((w) => w.user_id))];
  let authors: Record<string, { id: string; username: string | null; full_name: string | null; avatar_url: string | null; wallet_address: string | null }> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, wallet_address')
      .in('id', userIds);

    if (users) {
      authors = Object.fromEntries(users.map((u) => [u.id, u]));
    }
  }

  const enriched = (works || []).map((w) => ({
    ...w,
    author: authors[w.user_id] || null,
  }));

  return NextResponse.json<ApiSuccessResponse>(
    {
      success: true,
      data: {
        works: enriched,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
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

  const body: PublishWorkRequest = await request.json();
  const title = sanitizeText(body.title || '');
  const description = body.description ? sanitizeText(body.description) : null;
  const content = sanitizeText(body.content || '');
  const genre = body.genre ? sanitizeText(body.genre) : null;

  if (!title || title.length < 1) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Title is required', code: 'MISSING_TITLE' },
      { status: 400 }
    );
  }

  if (!content || content.length < 10) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Content is too short', code: 'CONTENT_TOO_SHORT' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  let poemScore: number | null = null;
  if (body.analysis_id) {
    const { data: analysis } = await supabase
      .from('analyses')
      .select('overall_score, user_id')
      .eq('id', body.analysis_id)
      .eq('user_id', userId)
      .single();

    if (analysis) {
      poemScore = analysis.overall_score;

      await supabase
        .from('analyses')
        .update({ is_published: true })
        .eq('id', body.analysis_id);
    }
  }

  const { data: work, error: dbError } = await supabase
    .from('works')
    .insert([
      {
        user_id: userId,
        analysis_id: body.analysis_id || null,
        title,
        description,
        content,
        content_length: content.length,
        genre,
        poem_score: poemScore,
        is_published: true,
        published_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (dbError) {
    console.error('Work creation error:', dbError);
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Failed to publish work', code: 'DB_ERROR' },
      { status: 500 }
    );
  }

  try {
    await supabase.rpc('upsert_user_stats', { user_id: userId });
  } catch {
    /* non-critical — DB triggers handle stats */
  }

  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  await supabase.from('audit_logs').insert([
    {
      user_id: userId,
      action: 'work_published',
      entity_type: 'work',
      entity_id: work.id,
      details: { title, genre, poem_score: poemScore },
      ip_address: clientIP,
      user_agent: userAgent,
    },
  ]);

  return NextResponse.json<ApiSuccessResponse>(
    {
      success: true,
      data: { work },
      message: 'Work published successfully',
    },
    { status: 201 }
  );
}
