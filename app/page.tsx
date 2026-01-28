'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
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
          <Logo size={48} withText />
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

      {/* Hero Section */}
      <motion.section
        variants={itemVariants}
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center w-full"
      >
        <div className="max-w-2xl">
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-700 leading-tight mb-4 sm:mb-6"
          >
            Create. Earn. Own.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed"
          >
            VERSERTILE is an AI-powered creative ecosystem where originality is verified, creativity is rewarded, and audiences earn for engaging with exceptional work.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg">
                Start Creating
              </Button>
            </Link>
            <Link href="/poem">
              <Button variant="outline" size="lg">
                Try P.O.E.M. Engine
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Preview */}
      <motion.section
        variants={itemVariants}
        className="bg-gray-50 py-12 sm:py-20 border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-700 mb-8 sm:mb-12"
          >
            Core Features
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg"
              >
                <h3 className="text-base sm:text-lg font-600 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        variants={itemVariants}
        className="border-t border-gray-200 bg-white py-6 sm:py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-600 text-xs sm:text-sm">
          <p>© 2026 VERSERTILE. All rights reserved.</p>
        </div>
      </motion.footer>
    </motion.div>
  );
}

const features = [
  {
    title: 'P.O.E.M. Engine',
    description:
      'AI-powered analysis that verifies originality, quality, and authenticity of creative works.',
  },
  {
    title: 'Create-to-Earn',
    description:
      'Publish verified works and earn tokens instantly for your creative contributions.',
  },
  {
    title: 'Engage-to-Earn',
    description:
      'Earn rewards for reading, rating, sharing, and engaging with community content.',
  },
];
