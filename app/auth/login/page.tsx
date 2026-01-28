'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!email || !password) {
      setErrors({ form: 'Email and password are required' });
      setLoading(false);
      return;
    }

    // TODO: Call login API
    console.log('Login attempt:', { email, password });
    setLoading(false);
  };

  const handleWalletLogin = async () => {
    setLoading(true);
    // TODO: Implement wallet connection
    console.log('Wallet login initiated');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-b border-gray-200 py-3 sm:py-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/">
            <Logo size={48} withText />
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      </motion.nav>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
      >
        <Card padding="lg" border className="w-full max-w-md">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-700 mb-1 sm:mb-2">Sign In</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back to VERSERTILE</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.form}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={errors.password}
            />

            <Button
              type="submit"
              fullWidth
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-600">or</span>
              </div>
            </div>

            <Button
              type="button"
              fullWidth
              variant="secondary"
              onClick={handleWalletLogin}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Sign In with Wallet'}
            </Button>

            <div className="pt-4 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-600 text-black hover:underline">
                Create one
              </Link>
            </div>
          </motion.form>
        </Card>
      </motion.section>
    </div>
  );
}
