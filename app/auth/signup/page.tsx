'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SignUp() {
  const [step, setStep] = useState<'method' | 'email' | 'wallet'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setErrors({ form: 'All fields are required' });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    // TODO: Call signup API
    console.log('Email signup:', { email, password });
    setLoading(false);
  };

  const handleWalletConnect = async () => {
    setLoading(true);
    // TODO: Implement wallet connection
    console.log('Wallet connection initiated');
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
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Already have an account?
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
          {step === 'method' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-700 mb-1 sm:mb-2">Create Account</h1>
                <p className="text-sm sm:text-base text-gray-600">Join VERSERTILE to start creating</p>
              </div>

              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={() => setStep('email')}
                >
                  Sign Up with Email
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setStep('wallet')}
                >
                  Connect Wallet
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-600 text-black hover:underline">
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}

          {step === 'email' && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleEmailSignUp}
              className="space-y-6"
            >
              <button
                type="button"
                onClick={() => setStep('method')}
                className="text-xs sm:text-sm text-gray-600 hover:text-black mb-4"
              >
                ← Back
              </button>

              <h1 className="text-2xl sm:text-3xl font-700">Create Account</h1>

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

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={errors.confirmPassword}
              />

              <Button
                type="submit"
                fullWidth
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </motion.form>
          )}

          {step === 'wallet' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep('method')}
                className="text-xs sm:text-sm text-gray-600 hover:text-black mb-4"
              >
                ← Back
              </button>

              <h1 className="text-2xl sm:text-3xl font-700">Connect Wallet</h1>

              <p className="text-sm sm:text-base text-gray-600">
                Connect your wallet to create an account and start earning on VERSERTILE
              </p>

              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={handleWalletConnect}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleWalletConnect}
                  disabled={loading}
                >
                  Connect Base Wallet
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 text-center">
                We support MetaMask, WalletConnect, and Base Wallet
              </p>
            </motion.div>
          )}
        </Card>
      </motion.section>
    </div>
  );
}
