'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AppNav } from '@/components/AppNav';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/lib/auth/context';
import {
  Flame,
  BookOpen,
  Heart,
  Eye,
  TrendingUp,
  ArrowRight,
  FileText,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

interface DashboardData {
  stats: {
    total_analyses: number;
    total_works: number;
    total_published_works: number;
    total_likes: number;
    total_reads: number;
    average_poem_score: number | null;
    reputation_score: number;
    total_earnings: number;
  };
  recent_analyses: Array<{
    id: string;
    overall_score: number;
    originality_score: number;
    quality_score: number;
    expression_score: number;
    created_at: string;
    is_published: boolean;
    text_length: number;
  }>;
  recent_works: Array<{
    id: string;
    title: string;
    genre: string | null;
    poem_score: number | null;
    view_count: number;
    like_count: number;
    is_published: boolean;
    created_at: string;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

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

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AppNav />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-14"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-10 sm:mb-14">
          <p className="label mb-3">Dashboard</p>
          <h1 className="font-serif text-[var(--color-text-primary)] mb-2">
            {user?.full_name
              ? `Welcome, ${user.full_name}`
              : user?.username
              ? `@${user.username}`
              : 'Your Dashboard'}
          </h1>
          <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light">
            Track your creative output and engagement
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden mb-10 sm:mb-14"
        >
          <StatCard
            label="Analyses"
            value={stats?.total_analyses || 0}
            icon={<Flame className="w-4 h-4" strokeWidth={1.5} />}
          />
          <StatCard
            label="Published"
            value={stats?.total_published_works || 0}
            icon={<BookOpen className="w-4 h-4" strokeWidth={1.5} />}
          />
          <StatCard
            label="Avg Score"
            value={stats?.average_poem_score ? Math.round(stats.average_poem_score) : '—'}
            icon={<TrendingUp className="w-4 h-4" strokeWidth={1.5} />}
          />
          <StatCard
            label="Total Reads"
            value={stats?.total_reads || 0}
            icon={<Eye className="w-4 h-4" strokeWidth={1.5} />}
          />
          <StatCard
            label="Total Likes"
            value={stats?.total_likes || 0}
            icon={<Heart className="w-4 h-4" strokeWidth={1.5} />}
          />
          <StatCard
            label="Reputation"
            value={stats?.reputation_score || 0}
            icon={<TrendingUp className="w-4 h-4" strokeWidth={1.5} />}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Analyses */}
          <motion.div variants={item}>
            <Card padding="lg" border>
              <div className="flex items-center justify-between mb-6">
                <span className="label">Recent Analyses</span>
                <Link href="/poem">
                  <Button variant="ghost" size="sm">
                    New Analysis
                    <ArrowRight className="ml-1.5 w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </Link>
              </div>

              {data?.recent_analyses && data.recent_analyses.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_analyses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-[var(--color-text-dim)]" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.8rem] text-[var(--color-text-primary)] truncate">
                            {a.text_length.toLocaleString()} chars
                          </p>
                          <p className="text-[0.65rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em]">
                            {new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[1.1rem] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] font-light">
                            {a.overall_score}
                          </span>
                          <span className="text-[0.65rem] text-[var(--color-text-dim)] ml-0.5">/100</span>
                        </div>
                        {a.is_published && (
                          <span className="text-[0.6rem] text-[var(--color-text-dim)] uppercase tracking-[0.1em] font-[family-name:var(--font-mono)]">
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Flame className="w-6 h-6 text-[var(--color-text-dim)] mx-auto mb-3" strokeWidth={1} />
                  <p className="text-[0.8rem] text-[var(--color-text-dim)] font-light">
                    No analyses yet
                  </p>
                  <Link href="/poem" className="mt-3 inline-block">
                    <Button variant="outline" size="sm">
                      Analyze Your First Work
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Published Works */}
          <motion.div variants={item}>
            <Card padding="lg" border>
              <div className="flex items-center justify-between mb-6">
                <span className="label">Published Works</span>
                <Link href="/explore">
                  <Button variant="ghost" size="sm">
                    Explore All
                    <ArrowRight className="ml-1.5 w-3 h-3" strokeWidth={1.5} />
                  </Button>
                </Link>
              </div>

              {data?.recent_works && data.recent_works.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_works.map((w) => (
                    <Link
                      key={w.id}
                      href={`/work/${w.id}`}
                      className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors duration-300 block"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.8rem] text-[var(--color-text-primary)] truncate">
                          {w.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {w.genre && (
                            <span className="text-[0.6rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.08em] uppercase">
                              {w.genre}
                            </span>
                          )}
                          <span className="text-[0.6rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em]">
                            {new Date(w.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-3">
                        <div className="flex items-center gap-1 text-[0.7rem] text-[var(--color-text-dim)]">
                          <Eye className="w-3 h-3" strokeWidth={1.5} />
                          {w.view_count}
                        </div>
                        <div className="flex items-center gap-1 text-[0.7rem] text-[var(--color-text-dim)]">
                          <Heart className="w-3 h-3" strokeWidth={1.5} />
                          {w.like_count}
                        </div>
                        {w.poem_score && (
                          <span className="text-[0.8rem] font-[family-name:var(--font-mono)] text-[var(--color-text-muted)]">
                            {w.poem_score}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="w-6 h-6 text-[var(--color-text-dim)] mx-auto mb-3" strokeWidth={1} />
                  <p className="text-[0.8rem] text-[var(--color-text-dim)] font-light">
                    No published works yet
                  </p>
                  <Link href="/poem" className="mt-3 inline-block">
                    <Button variant="outline" size="sm">
                      Analyze &amp; Publish
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-bg-primary)] p-5 sm:p-6 group hover:bg-[var(--color-bg-elevated)] transition-colors duration-500">
      <div className="text-[var(--color-text-dim)] mb-3">{icon}</div>
      <div className="text-[1.4rem] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] font-light tracking-tight mb-1">
        {value}
      </div>
      <div className="text-[0.6rem] text-[var(--color-text-dim)] tracking-[0.1em] uppercase font-[family-name:var(--font-mono)]">
        {label}
      </div>
    </div>
  );
}
