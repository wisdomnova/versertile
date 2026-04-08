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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseClient();

  const { data: work, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single();

  if (error || !work) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Work not found', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  try {
    await supabase.rpc('increment_work_view_count', { work_id: id });
  } catch {
    /* non-critical */
  }

  const { data: author } = await supabase
    .from('users')
    .select('id, username, full_name, avatar_url, wallet_address')
    .eq('id', work.user_id)
    .single();

  const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  let userEngagement: { liked: boolean; rated: number | null } = { liked: false, rated: null };

  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload.sub) {
        const { data: like } = await supabase
          .from('engagements')
          .select('id')
          .eq('user_id', payload.sub)
          .eq('work_id', id)
          .eq('engagement_type', 'like')
          .maybeSingle();

        const { data: rate } = await supabase
          .from('engagements')
          .select('rating_value')
          .eq('user_id', payload.sub)
          .eq('work_id', id)
          .eq('engagement_type', 'rate')
          .maybeSingle();

        userEngagement = {
          liked: !!like,
          rated: rate?.rating_value ?? null,
        };
      }
    } catch {
      // not authenticated – fine, just skip user engagement
    }
  }

  const { data: comments } = await supabase
    .from('engagements')
    .select('id, user_id, comment_text, created_at')
    .eq('work_id', id)
    .eq('engagement_type', 'comment')
    .order('created_at', { ascending: true })
    .limit(50);

  let commentAuthors: Record<string, { username: string | null; full_name: string | null; avatar_url: string | null }> = {};
  if (comments && comments.length > 0) {
    const commentUserIds = [...new Set(comments.map((c) => c.user_id))];
    const { data: cUsers } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url')
      .in('id', commentUserIds);
    if (cUsers) {
      commentAuthors = Object.fromEntries(cUsers.map((u) => [u.id, u]));
    }
  }

  const enrichedComments = (comments || []).map((c) => ({
    ...c,
    author: commentAuthors[c.user_id] || null,
  }));

  return NextResponse.json<ApiSuccessResponse>(
    {
      success: true,
      data: {
        work: { ...work, author: author || null },
        comments: enrichedComments,
        userEngagement,
      },
    },
    { status: 200 }
  );
}
