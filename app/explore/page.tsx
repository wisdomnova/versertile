'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { AppNav } from '@/components/AppNav';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import {
  Eye,
  Heart,
  Star,
  ArrowRight,
  Search,
  ChevronDown,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

const GENRES = [
  'All',
  'Poetry',
  'Prose',
  'Fiction',
  'Non-Fiction',
  'Essay',
  'Spoken Word',
  'Screenplay',
  'Song Lyrics',
] as const;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'top', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
] as const;

interface WorkItem {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  poem_score: number | null;
  view_count: number;
  like_count: number;
  average_rating: number | null;
  published_at: string;
  author: {
    username: string | null;
    full_name: string | null;
    wallet_address: string | null;
  };
}

export default function Explore() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const perPage = 12;
  const totalPages = Math.ceil(total / perPage);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(perPage),
      sort,
    });
    if (genre !== 'All') params.set('genre', genre.toLowerCase());

    const res = await fetch(`/api/works?${params}`);
    const json = await res.json();
    if (json.success) {
      setWorks(json.data.works);
      setTotal(json.data.total);
    }
    setLoading(false);
  }, [page, sort, genre]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleGenre = (g: string) => {
    setGenre(g);
    setPage(1);
  };

  const handleSort = (s: string) => {
    setSort(s);
    setPage(1);
    setShowSortMenu(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AppNav />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 sm:mb-14"
        >
          <p className="label mb-3">Explore</p>
          <h1 className="font-serif text-[var(--color-text-primary)] mb-2">
            Discover Published Works
          </h1>
          <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light max-w-md">
            Browse and engage with creative works analyzed by the P.O.E.M. Engine
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          {/* Genre Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => handleGenre(g)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[0.7rem] tracking-[0.06em] font-[family-name:var(--font-mono)] uppercase transition-all duration-300 ${
                  genre === g
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[0.7rem] tracking-[0.06em] font-[family-name:var(--font-mono)] uppercase text-[var(--color-text-dim)] hover:border-[var(--color-border-hover)] transition-colors duration-300"
            >
              {SORT_OPTIONS.find((s) => s.value === sort)?.label}
              <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden z-20 min-w-[140px]"
                >
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleSort(s.value)}
                      className={`block w-full text-left px-3 py-2 text-[0.7rem] tracking-[0.06em] font-[family-name:var(--font-mono)] uppercase transition-colors duration-200 ${
                        sort === s.value
                          ? 'text-[var(--color-text-primary)] bg-[var(--color-bg-primary)]'
                          : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-bg-primary)]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Works Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loading />
          </div>
        ) : works.length > 0 ? (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {works.map((w) => (
                <motion.div key={w.id} variants={item}>
                  <Link href={`/work/${w.id}`} className="block group">
                    <Card border padding="lg" className="h-full hover:border-[var(--color-border-hover)] transition-colors duration-400">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[0.95rem] text-[var(--color-text-primary)] font-light leading-snug line-clamp-2 group-hover:text-white transition-colors duration-300">
                            {w.title}
                          </h3>
                          <p className="text-[0.65rem] text-[var(--color-text-dim)] mt-1.5 font-[family-name:var(--font-mono)] tracking-[0.06em]">
                            {w.author.full_name ||
                              w.author.username ||
                              (w.author.wallet_address
                                ? `${w.author.wallet_address.slice(0, 6)}...${w.author.wallet_address.slice(-4)}`
                                : 'Anonymous')}
                          </p>
                        </div>
                        {w.poem_score && (
                          <div className="shrink-0 text-right">
                            <span className="text-[1.3rem] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] font-light">
                              {w.poem_score}
                            </span>
                            <span className="text-[0.5rem] text-[var(--color-text-dim)] block font-[family-name:var(--font-mono)] tracking-[0.12em] uppercase">
                              P.O.E.M.
                            </span>
                          </div>
                        )}
                      </div>

                      {w.description && (
                        <p className="text-[0.75rem] text-[var(--color-text-dim)] font-light leading-relaxed line-clamp-2 mb-4">
                          {w.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                        <div className="flex items-center gap-3 text-[0.65rem] text-[var(--color-text-dim)]">
                          {w.genre && (
                            <span className="font-[family-name:var(--font-mono)] tracking-[0.08em] uppercase">
                              {w.genre}
                            </span>
                          )}
                          <span className="font-[family-name:var(--font-mono)] tracking-[0.06em]">
                            {new Date(w.published_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[0.65rem] text-[var(--color-text-dim)]">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" strokeWidth={1.5} />
                            {w.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" strokeWidth={1.5} />
                            {w.like_count}
                          </span>
                          {w.average_rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" strokeWidth={1.5} />
                              {w.average_rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] px-3">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-20"
          >
            <Search className="w-8 h-8 text-[var(--color-text-dim)] mx-auto mb-4" strokeWidth={1} />
            <p className="text-[0.9rem] text-[var(--color-text-muted)] font-light mb-2">
              No works found
            </p>
            <p className="text-[0.75rem] text-[var(--color-text-dim)] font-light">
              {genre !== 'All'
                ? `No published works in the "${genre}" genre yet.`
                : 'Be the first to publish a work!'}
            </p>
            <Link href="/poem" className="mt-5 inline-block">
              <Button variant="outline" size="sm">
                Create &amp; Publish
                <ArrowRight className="ml-1.5 w-3 h-3" strokeWidth={1.5} />
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
