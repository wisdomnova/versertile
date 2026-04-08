'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppNav } from '@/components/AppNav';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { Textarea } from '@/components/Textarea';
import { useAuth } from '@/lib/auth/context';
import {
  Heart,
  Eye,
  Star,
  Share2,
  ArrowLeft,
  Send,
  MessageCircle,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

interface WorkDetail {
  id: string;
  title: string;
  description: string | null;
  content: string;
  genre: string | null;
  poem_score: number | null;
  view_count: number;
  like_count: number;
  share_count: number;
  average_rating: number | null;
  rating_count: number;
  published_at: string;
  author: {
    id: string;
    username: string | null;
    full_name: string | null;
    wallet_address: string | null;
  };
  comments: Array<{
    id: string;
    comment_text: string;
    created_at: string;
    user: {
      username: string | null;
      full_name: string | null;
      wallet_address: string | null;
    };
  }>;
  user_engagement: {
    liked: boolean;
    rated: number | null;
  };
}

export default function WorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<WorkDetail['comments']>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/works/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const w = res.data;
          setWork(w);
          setLiked(w.user_engagement?.liked || false);
          setLikeCount(w.like_count);
          setUserRating(w.user_engagement?.rated || null);
          setComments(w.comments || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const engage = async (type: string, data?: Record<string, unknown>) => {
    const res = await fetch(`/api/works/${id}/engage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
    return res.json();
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    await engage('like');
  };

  const handleRate = async (value: number) => {
    setUserRating(value);
    await engage('rate', { value });
  };

  const handleShare = async () => {
    if (typeof navigator.share !== 'undefined') {
      try {
        await navigator.share({
          title: work?.title,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
    engage('share');
  };

  const handleComment = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    const res = await engage('comment', { text: comment });
    if (res.success) {
      setComments((prev) => [
        {
          id: res.data?.engagement_id || Date.now().toString(),
          comment_text: comment,
          created_at: new Date().toISOString(),
          user: {
            username: user?.username || null,
            full_name: user?.full_name || null,
            wallet_address: user?.wallet_address || null,
          },
        },
        ...prev,
      ]);
      setComment('');
    }
    setSubmitting(false);
  };

  const authorName =
    work?.author.full_name ||
    (work?.author.username ? `@${work.author.username}` : null) ||
    (work?.author.wallet_address
      ? `${work.author.wallet_address.slice(0, 6)}...${work.author.wallet_address.slice(-4)}`
      : 'Anonymous');

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <AppNav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading />
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <AppNav />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-[var(--color-text-muted)]">Work not found.</p>
          <Link href="/explore" className="mt-4 inline-block">
            <Button variant="outline" size="sm">
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AppNav />

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase hover:text-[var(--color-text-muted)] transition-colors duration-300 mb-8"
          >
            <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
            Back to Explore
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-10"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              {work.genre && (
                <span className="label mb-3 block">{work.genre}</span>
              )}
              <h1 className="font-serif text-[var(--color-text-primary)] text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.15]">
                {work.title}
              </h1>
            </div>
            {work.poem_score && (
              <div className="shrink-0 text-center">
                <span className="text-[2rem] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] font-light leading-none block">
                  {work.poem_score}
                </span>
                <span className="text-[0.55rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.12em] uppercase">
                  P.O.E.M.
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-[0.7rem] text-[var(--color-text-dim)]">
            <span className="font-[family-name:var(--font-mono)] tracking-[0.06em]">
              {authorName}
            </span>
            <span className="text-[var(--color-border)]">·</span>
            <span className="font-[family-name:var(--font-mono)] tracking-[0.06em]">
              {new Date(work.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {work.description && (
            <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light mt-4 leading-relaxed">
              {work.description}
            </p>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          <Card border padding="lg">
            <div className="prose prose-invert max-w-none">
              <div className="text-[0.9rem] text-[var(--color-text-secondary)] leading-[1.9] font-light whitespace-pre-wrap">
                {work.content}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Engagement Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="flex items-center justify-between border-y border-[var(--color-border)] py-4 my-8"
        >
          <div className="flex items-center gap-5">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-[0.75rem] transition-colors duration-300 ${
                liked
                  ? 'text-red-400'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)]'
              }`}
            >
              <Heart
                className="w-4 h-4"
                strokeWidth={1.5}
                fill={liked ? 'currentColor' : 'none'}
              />
              {likeCount}
            </button>

            {/* Views */}
            <span className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-text-dim)]">
              <Eye className="w-4 h-4" strokeWidth={1.5} />
              {work.view_count}
            </span>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[0.75rem] text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors duration-300"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              {work.share_count}
            </button>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <span className="text-[0.65rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] mr-2 uppercase">
              Rate
            </span>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => handleRate(v)}
                onMouseEnter={() => setHoverRating(v)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-0.5 transition-colors duration-200"
              >
                <Star
                  className={`w-4 h-4 ${
                    v <= (hoverRating || userRating || 0)
                      ? 'text-amber-400'
                      : 'text-[var(--color-text-dim)]'
                  }`}
                  strokeWidth={1.5}
                  fill={
                    v <= (hoverRating || userRating || 0)
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            ))}
            {work.average_rating && (
              <span className="text-[0.65rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] ml-2">
                {work.average_rating.toFixed(1)} ({work.rating_count})
              </span>
            )}
          </div>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease }}
        >
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-4 h-4 text-[var(--color-text-dim)]" strokeWidth={1.5} />
            <span className="label">
              Comments ({comments.length})
            </span>
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <Textarea
              label=""
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on this work..."
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleComment}
                disabled={!comment.trim() || submitting}
              >
                {submitting ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1.5" strokeWidth={1.5} />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => {
                const cAuthor =
                  c.user.full_name ||
                  (c.user.username ? `@${c.user.username}` : null) ||
                  (c.user.wallet_address
                    ? `${c.user.wallet_address.slice(0, 6)}...${c.user.wallet_address.slice(-4)}`
                    : 'Anonymous');
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[0.7rem] text-[var(--color-text-muted)] font-[family-name:var(--font-mono)] tracking-[0.04em]">
                        {cAuthor}
                      </span>
                      <span className="text-[0.6rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em]">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[0.8rem] text-[var(--color-text-secondary)] font-light leading-relaxed">
                      {c.comment_text}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[0.8rem] text-[var(--color-text-dim)] font-light py-8">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
