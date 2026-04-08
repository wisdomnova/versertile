import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth/jwt';
import { COOKIE_NAMES } from '@/lib/auth/cookies';
import { sanitizeText } from '@/lib/auth/sanitize';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workId } = await params;
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
  const { type } = body;

  if (!['like', 'comment', 'rate', 'share'].includes(type)) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Invalid engagement type', code: 'INVALID_TYPE' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  const { data: work } = await supabase
    .from('works')
    .select('id, user_id')
    .eq('id', workId)
    .eq('is_published', true)
    .single();

  if (!work) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Work not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (type === 'like') {
    const { data: existing } = await supabase
      .from('engagements')
      .select('id')
      .eq('user_id', userId)
      .eq('work_id', workId)
      .eq('engagement_type', 'like')
      .maybeSingle();

    if (existing) {
      await supabase.from('engagements').delete().eq('id', existing.id);
      await supabase
        .from('works')
        .update({ like_count: Math.max(0, (await supabase.from('works').select('like_count').eq('id', workId).single()).data?.like_count - 1 || 0) })
        .eq('id', workId);

      return NextResponse.json<ApiSuccessResponse>(
        { success: true, data: { liked: false }, message: 'Like removed' },
        { status: 200 }
      );
    }

    await supabase.from('engagements').insert([
      { user_id: userId, work_id: workId, engagement_type: 'like' },
    ]);

    const { data: workData } = await supabase.from('works').select('like_count').eq('id', workId).single();
    await supabase
      .from('works')
      .update({ like_count: (workData?.like_count || 0) + 1 })
      .eq('id', workId);

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, data: { liked: true }, message: 'Liked' },
      { status: 201 }
    );
  }

  if (type === 'comment') {
    const commentText = sanitizeText(body.comment || '');
    if (!commentText || commentText.length < 1) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Comment text is required', code: 'MISSING_COMMENT' },
        { status: 400 }
      );
    }

    const { data: engagement, error: engError } = await supabase
      .from('engagements')
      .insert([
        {
          user_id: userId,
          work_id: workId,
          engagement_type: 'comment',
          comment_text: commentText,
        },
      ])
      .select()
      .single();

    if (engError) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Failed to post comment', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, data: { engagement }, message: 'Comment posted' },
      { status: 201 }
    );
  }

  if (type === 'rate') {
    const ratingValue = parseInt(body.rating, 10);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Rating must be between 1 and 5', code: 'INVALID_RATING' },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from('engagements')
      .select('id')
      .eq('user_id', userId)
      .eq('work_id', workId)
      .eq('engagement_type', 'rate')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('engagements')
        .update({ rating_value: ratingValue })
        .eq('id', existing.id);
    } else {
      await supabase.from('engagements').insert([
        {
          user_id: userId,
          work_id: workId,
          engagement_type: 'rate',
          rating_value: ratingValue,
        },
      ]);
    }

    const { data: allRatings } = await supabase
      .from('engagements')
      .select('rating_value')
      .eq('work_id', workId)
      .eq('engagement_type', 'rate');

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((s, r) => s + (r.rating_value || 0), 0) / allRatings.length;
      await supabase
        .from('works')
        .update({ rating_average: Math.round(avg * 100) / 100, rating_count: allRatings.length })
        .eq('id', workId);
    }

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, data: { rated: ratingValue }, message: 'Rating submitted' },
      { status: 200 }
    );
  }

  if (type === 'share') {
    await supabase.from('engagements').insert([
      { user_id: userId, work_id: workId, engagement_type: 'share' },
    ]);

    const { data: workData } = await supabase.from('works').select('share_count').eq('id', workId).single();
    await supabase
      .from('works')
      .update({ share_count: (workData?.share_count || 0) + 1 })
      .eq('id', workId);

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, message: 'Share recorded' },
      { status: 201 }
    );
  }

  return NextResponse.json<ApiErrorResponse>(
    { success: false, error: 'Invalid request', code: 'INVALID_REQUEST' },
    { status: 400 }
  );
}
