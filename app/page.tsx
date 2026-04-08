'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { ArrowRight, Flame, PenTool, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

const ease = [0.16, 1, 0.3, 1];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, ease },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col"
    >
      {/* Navigation */}
      <motion.nav
        variants={fadeIn}
        className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl z-50"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Logo size={36} withText />
          <div className="flex items-center gap-3 sm:gap-5">
            {authLoading ? null : isAuthed ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/poem">
                  <Button variant="outline" size="sm">
                    P.O.E.M. Engine
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="flex-1 max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-32 lg:py-40 flex flex-col justify-center w-full"
      >
        <div className="max-w-3xl">
          <motion.p
            variants={itemVariants}
            className="label mb-6 sm:mb-8"
          >
            AI-Powered Creative Ecosystem
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="font-serif text-gradient mb-6 sm:mb-8"
          >
            Create. Earn. Own.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[1rem] sm:text-[1.1rem] text-[var(--color-text-muted)] mb-10 sm:mb-14 leading-[1.8] max-w-xl font-light"
          >
            Where originality is verified, creativity is rewarded, and audiences
            earn for engaging with exceptional work.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            {isAuthed ? (
              <>
                <Link href="/poem">
                  <Button variant="primary" size="lg">
                    Open P.O.E.M. Engine
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="lg">
                    Explore Works
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button variant="primary" size="lg">
                    Start Creating
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/poem">
                  <Button variant="outline" size="lg">
                    Try P.O.E.M. Engine
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <div className="border-t border-[var(--color-border)]" />
      </div>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 sm:py-32"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.p variants={itemVariants} className="label mb-4">
            Core Features
          </motion.p>
          <motion.h2
            variants={itemVariants}
            className="font-serif text-[var(--color-text-primary)] mb-16 sm:mb-20"
          >
            Built for creators who
            <br />
            demand more
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-[var(--color-bg-primary)] p-8 sm:p-10 group hover:bg-[var(--color-bg-elevated)] transition-colors duration-500"
              >
                <div className="mb-6 text-[var(--color-text-dim)] group-hover:text-[var(--color-text-muted)] transition-colors duration-500">
                  {feature.icon}
                </div>
                <span className="label block mb-4">{feature.ref}</span>
                <h3 className="text-[1.1rem] text-[var(--color-text-primary)] mb-3 tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-[0.85rem] text-[var(--color-text-muted)] leading-[1.7] font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Statement Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="py-20 sm:py-32 border-t border-[var(--color-border)]"
      >
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <motion.blockquote
            variants={itemVariants}
            className="font-serif text-[clamp(1.5rem,3vw,2.2rem)] text-[var(--color-text-primary)] leading-[1.4] font-normal italic"
          >
            &ldquo;Every word carries weight. Every creation deserves proof of its merit.&rdquo;
          </motion.blockquote>
          <motion.p
            variants={itemVariants}
            className="label mt-8"
          >
            The VERSERTILE Manifesto
          </motion.p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={fadeIn}
        className="border-t border-[var(--color-border)] py-8 sm:py-10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.7rem] tracking-[0.1em] text-[var(--color-text-dim)] uppercase font-[family-name:var(--font-mono)]">
            &copy; 2026 VERSERTILE
          </p>
          <p className="text-[0.7rem] tracking-[0.1em] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)]">
            Set in Playfair Display &amp; Inter
          </p>
        </div>
      </motion.footer>
    </motion.div>
  );
}

const features = [
  {
    ref: 'VRS — 01',
    icon: <Flame className="w-5 h-5" strokeWidth={1.5} />,
    title: 'P.O.E.M. Engine',
    description:
      'AI-powered analysis that verifies originality, quality, and authenticity of creative works through Proof of Expressive Merit.',
  },
  {
    ref: 'VRS — 02',
    icon: <PenTool className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Create-to-Earn',
    description:
      'Publish verified works and earn $VERSE tokens instantly. Your creativity has measurable, tradeable value.',
  },
  {
    ref: 'VRS — 03',
    icon: <Users className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Engage-to-Earn',
    description:
      'Earn rewards for reading, rating, sharing, and engaging with community content. Every interaction counts.',
  },
];
