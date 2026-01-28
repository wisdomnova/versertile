'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Textarea } from '@/components/Textarea';
import { Card } from '@/components/Card';
import { Loading } from '@/components/Loading';

interface PoemScore {
  originality: number;
  quality: number;
  expression: number;
  overall: number;
  feedback: string[];
}

export default function PoemEngine() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<PoemScore | null>(null);
  const [error, setError] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
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

    if (text.trim().split(/\s+/).length < 50) {
      setError('Please enter at least 50 words');
      setLoading(false);
      return;
    }

    try {
      // TODO: Call P.O.E.M. API
      console.log('Analyzing text:', text.substring(0, 100) + '...');

      // Mock response for now
      setTimeout(() => {
        setScore({
          originality: 82,
          quality: 78,
          expression: 85,
          overall: 81,
          feedback: [
            'Strong unique voice detected',
            'Good narrative structure',
            'Rich descriptive language',
            'Consider varying sentence length for better flow',
          ],
        });
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-white flex flex-col"
    >
      {/* Navigation */}
      <motion.nav
        variants={itemVariants}
        className="border-b border-gray-200 sticky top-0 bg-white z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size={48} withText />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.section
        variants={itemVariants}
        className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full"
      >
        <div className="mb-8 sm:mb-12">
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-700 mb-2 sm:mb-4"
          >
            P.O.E.M. Engine
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-600"
          >
            Verify your work's originality, quality, and expressive merit with
            our AI-powered analysis engine.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Input Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card padding="lg" border>
              <form onSubmit={handleAnalyze} className="space-y-4 sm:space-y-6">
                <Textarea
                  label="Your Work"
                  placeholder="Paste your creative writing, poem, story, or any text you'd like to analyze..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  error={error}
                  required
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : 'Analyze with P.O.E.M.'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setText('');
                      setScore(null);
                      setError('');
                    }}
                  >
                    Clear
                  </Button>
                </div>

                <p className="text-xs text-gray-600">
                  Minimum 50 words required. Your analysis is private and secure.
                </p>
              </form>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            {loading ? (
              <Card padding="lg" border className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <div className="mb-4">
                    <Loading />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Analyzing your work...</p>
                </div>
              </Card>
            ) : score ? (
              <Card padding="lg" border className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-700 mb-4 sm:mb-6">Your Score</h2>

                  <div className="space-y-3 sm:space-y-4">
                    <ScoreMetric
                      label="Originality"
                      value={score.originality}
                    />
                    <ScoreMetric label="Quality" value={score.quality} />
                    <ScoreMetric
                      label="Expression"
                      value={score.expression}
                    />

                    <div className="pt-4 border-t border-gray-200">
                      <ScoreMetric
                        label="Overall"
                        value={score.overall}
                        large
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <h3 className="font-600 text-xs sm:text-sm">Feedback</h3>
                  <ul className="space-y-1 sm:space-y-2">
                    {score.feedback.map((item, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-700 flex gap-2">
                        <span className="text-gray-400">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button fullWidth variant="primary">
                  Publish This Work
                </Button>
              </Card>
            ) : (
              <Card padding="lg" border className="flex items-center justify-center min-h-64">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Submit your work above to see your P.O.E.M. score
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Info Section */}
      <motion.section
        variants={itemVariants}
        className="bg-gray-50 py-8 sm:py-12 border-t border-gray-200"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-2xl font-700 mb-6 sm:mb-8"
          >
            How P.O.E.M. Works
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg"
              >
                <h3 className="font-600 text-base sm:text-base mb-2 sm:mb-3">{metric.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{metric.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
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
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className={`font-500 ${large ? 'text-lg sm:text-lg' : 'text-xs sm:text-sm'}`}>
          {label}
        </span>
        <span
          className={`font-700 ${large ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}
        >
          {value}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const metrics = [
  {
    name: 'Originality',
    description:
      'Measures unique voice, originality, and plagiarism detection across millions of texts',
  },
  {
    name: 'Quality',
    description:
      'Evaluates grammar, structure, clarity, and overall writing competence',
  },
  {
    name: 'Expression',
    description:
      'Assesses emotional resonance, creativity, and stylistic effectiveness',
  },
];
