'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/AppNav';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Loading } from '@/components/Loading';
import { Flame, Eraser, Send, X, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface PoemScore {
  originality: number;
  quality: number;
  expression: number;
  overall: number;
  feedback: string[];
}

const ease = [0.16, 1, 0.3, 1];

const GENRES = [
  'Poetry',
  'Prose',
  'Fiction',
  'Non-Fiction',
  'Essay',
  'Spoken Word',
  'Screenplay',
  'Song Lyrics',
] as const;

export default function PoemEngine() {
  const { user } = useAuth();
  const router = useRouter();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<PoemScore | null>(null);
  const [error, setError] = useState('');
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // Publish state
  const [showPublish, setShowPublish] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubGenre, setPubGenre] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setScore(null);

    if (!text.trim()) {
      setError('Please enter some text to analyze');
      setLoading(false);
      return;
    }

    if (text.trim().split(/\s+/).length < 10) {
      setError('Please enter at least 10 words');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/poem/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login?redirect=/poem');
          return;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      const a = data.data.analysis;
      setAnalysisId(a.id);
      setScore({
        originality: a.originality_score,
        quality: a.quality_score,
        expression: a.expression_score,
        overall: a.overall_score,
        feedback: a.feedback || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!pubTitle.trim()) {
      setPublishError('Title is required');
      return;
    }
    setPublishing(true);
    setPublishError('');

    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pubTitle.trim(),
          description: pubDesc.trim() || undefined,
          content: text.trim(),
          genre: pubGenre || undefined,
          analysis_id: analysisId || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPublished(true);
        setTimeout(() => {
          router.push(`/work/${json.data.work.id}`);
        }, 1200);
      } else {
        setPublishError(json.error || 'Failed to publish');
      }
    } catch {
      setPublishError('Network error. Please try again.');
    }
    setPublishing(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col"
    >
      {/* Navigation */}
      <AppNav />

      {/* Main Content */}
      <motion.section
        variants={itemVariants}
        className="flex-1 max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16 w-full"
      >
        <div className="mb-12 sm:mb-16">
          <motion.p variants={itemVariants} className="label mb-4">
            VRS — Analysis Engine
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="font-serif text-[var(--color-text-primary)] mb-4"
          >
            P.O.E.M. Engine
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-[0.95rem] text-[var(--color-text-muted)] max-w-xl leading-[1.7] font-light"
          >
            Verify your work&apos;s originality, quality, and expressive merit with
            our AI-powered analysis engine.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Input Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card padding="lg" border>
              <form onSubmit={handleAnalyze} className="space-y-6">
                <Textarea
                  label="Your Work"
                  placeholder="Paste your creative writing, poem, story, or any text you'd like to analyze..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={14}
                  error={error}
                  required
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                  >
                    <Flame className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    {loading ? 'Analyzing...' : 'Analyze with P.O.E.M.'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      setText('');
                      setScore(null);
                      setError('');
                    }}
                  >
                    <Eraser className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    Clear
                  </Button>
                </div>

                <p className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em]">
                  Minimum 10 words required &middot; Analysis is private and secure
                </p>
              </form>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <Card padding="lg" border className="flex items-center justify-center min-h-[320px]">
                    <div className="text-center space-y-5">
                      <Loading />
                      <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light">
                        Analyzing your work...
                      </p>
                      <div className="flex justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-1 rounded-full bg-[var(--color-text-dim)]"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : score ? (
                <motion.div
                  key="score"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <Card padding="lg" border glow className="space-y-6">
                    <div>
                      <span className="label block mb-4">Score Report</span>
                      <div className="space-y-5">
                        <ScoreMetric label="Originality" value={score.originality} />
                        <ScoreMetric label="Quality" value={score.quality} />
                        <ScoreMetric label="Expression" value={score.expression} />
                        <div className="pt-5 border-t border-[var(--color-border)]">
                          <ScoreMetric label="Overall" value={score.overall} large />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--color-bg-elevated)] p-4 rounded-[var(--radius-md)] border border-[var(--color-border)] space-y-3">
                      <span className="label block">Feedback</span>
                      <ul className="space-y-2.5">
                        {score.feedback.map((item, i) => (
                          <li key={i} className="text-[0.8rem] text-[var(--color-text-muted)] flex gap-2.5 font-light leading-[1.6]">
                            <span className="text-[var(--color-text-dim)] mt-0.5 shrink-0">&mdash;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button fullWidth variant="primary" size="lg" onClick={() => setShowPublish(true)}>
                      <Send className="mr-2 w-4 h-4" strokeWidth={1.5} />
                      Publish This Work
                    </Button>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <Card padding="lg" border className="flex items-center justify-center min-h-[320px]">
                    <div className="text-center space-y-3">
                      <Flame className="w-6 h-6 text-[var(--color-text-dim)] mx-auto" strokeWidth={1} />
                      <p className="text-[0.8rem] text-[var(--color-text-dim)] font-light max-w-[200px] mx-auto leading-[1.6]">
                        Submit your work to see your P.O.E.M. score
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-16 sm:py-24 border-t border-[var(--color-border)]"
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.p variants={itemVariants} className="label mb-4">
            Methodology
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="font-serif text-[var(--color-text-primary)] mb-12 sm:mb-16"
          >
            How P.O.E.M. Works
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[var(--color-bg-primary)] p-8 sm:p-10 group hover:bg-[var(--color-bg-elevated)] transition-colors duration-500"
              >
                <span className="label block mb-4">{metric.ref}</span>
                <h3 className="text-[1rem] text-[var(--color-text-primary)] mb-3 tracking-[-0.01em]">
                  {metric.name}
                </h3>
                <p className="text-[0.8rem] text-[var(--color-text-muted)] leading-[1.7] font-light">
                  {metric.description}
                </p>
                <div className="mt-5 text-[0.7rem] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)] tracking-[0.08em]">
                  Weight: {metric.weight}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !publishing && setShowPublish(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.4, ease }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card border padding="lg" glow>
                {published ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check className="w-10 h-10 text-emerald-400 mx-auto mb-4" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="font-serif text-[1.2rem] text-[var(--color-text-primary)] mb-2">Published!</h3>
                    <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light">Redirecting to your work...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <span className="label">Publish Work</span>
                      <button
                        onClick={() => setShowPublish(false)}
                        className="text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] transition-colors"
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="space-y-5">
                      <Input
                        label="Title"
                        value={pubTitle}
                        onChange={(e) => setPubTitle(e.target.value)}
                        placeholder="Give your work a title"
                        required
                      />

                      <Textarea
                        label="Description (optional)"
                        value={pubDesc}
                        onChange={(e) => setPubDesc(e.target.value)}
                        placeholder="Brief description of your work..."
                        rows={3}
                      />

                      <div>
                        <label className="block text-[0.65rem] font-[family-name:var(--font-mono)] tracking-[0.12em] uppercase text-[var(--color-text-dim)] mb-2">
                          Genre
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {GENRES.map((g) => (
                            <button
                              key={g}
                              onClick={() => setPubGenre(pubGenre === g ? '' : g)}
                              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[0.65rem] tracking-[0.06em] font-[family-name:var(--font-mono)] uppercase transition-all duration-300 ${
                                pubGenre === g
                                  ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-primary)]'
                                  : 'text-[var(--color-text-dim)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      {score && (
                        <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                          <span className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase">
                            P.O.E.M. Score
                          </span>
                          <span className="text-[1.1rem] font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] font-light">
                            {score.overall}
                          </span>
                          <span className="text-[0.6rem] text-[var(--color-text-dim)]">/100</span>
                        </div>
                      )}

                      {publishError && (
                        <p className="text-[0.75rem] text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-[var(--radius-md)]">
                          {publishError}
                        </p>
                      )}

                      <Button
                        fullWidth
                        variant="primary"
                        size="lg"
                        onClick={handlePublish}
                        disabled={publishing || !pubTitle.trim()}
                      >
                        {publishing ? (
                          <Loading size="sm" />
                        ) : (
                          <>
                            <Send className="mr-2 w-4 h-4" strokeWidth={1.5} />
                            Publish
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreMetric({
  label,
  value,
  large = false,
}: {
  label: string;
  value: number;
  large?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className={`font-light tracking-[0.02em] ${large ? 'text-[0.95rem]' : 'text-[0.8rem] text-[var(--color-text-muted)]'}`}>
          {label}
        </span>
        <span
          className={`font-[family-name:var(--font-mono)] tracking-tight ${large ? 'text-[1.6rem] font-light' : 'text-[1.1rem] font-light text-[var(--color-text-primary)]'}`}
        >
          {value}
        </span>
      </div>
      <div className="w-full bg-[var(--color-score-bar)] rounded-full h-[3px] overflow-hidden">
        <motion.div
          className="bg-[var(--color-score-fill)] h-[3px] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

const metrics = [
  {
    ref: 'P — 01',
    name: 'Originality',
    description:
      'Measures unique voice, originality, and plagiarism detection across millions of texts.',
    weight: '40%',
  },
  {
    ref: 'P — 02',
    name: 'Quality',
    description:
      'Evaluates grammar, structure, clarity, and overall writing competence.',
    weight: '35%',
  },
  {
    ref: 'P — 03',
    name: 'Expression',
    description:
      'Assesses emotional resonance, creativity, and stylistic effectiveness.',
    weight: '25%',
  },
];
