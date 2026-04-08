'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Mail, Wallet, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

const ease = [0.16, 1, 0.3, 1];

export default function SignUp() {
  const { user, signup, loginWithWallet, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'method' | 'email' | 'wallet'>('method');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !authLoading) router.push('/poem');
  }, [user, authLoading, router]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease } },
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

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

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, confirmPassword);
      router.push('/poem');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setErrors({});
    setLoading(true);
    try {
      await loginWithWallet();
      router.push('/poem');
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Wallet connection failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="border-b border-[var(--color-border)] py-4 sm:py-5"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
          <Link href="/">
            <Logo size={36} withText />
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Already have an account?
            </Button>
          </Link>
        </div>
      </motion.nav>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 sm:py-16"
      >
        <Card padding="lg" border glow className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'method' && (
              <motion.div
                key="method"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-7"
              >
                <div>
                  <h1 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] text-[var(--color-text-primary)] mb-2">
                    Create Account
                  </h1>
                  <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light">
                    Join VERSERTILE to start creating
                  </p>
                </div>

                <div className="space-y-3">
                  {errors.form && (
                    <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-[var(--radius-md)] text-[var(--color-error)] text-[0.8rem] font-light">
                      {errors.form}
                    </div>
                  )}
                  <Button
                    fullWidth
                    variant="primary"
                    size="lg"
                    onClick={() => setStep('email')}
                  >
                    <Mail className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    Sign Up with Email
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    size="lg"
                    onClick={() => setStep('wallet')}
                  >
                    <Wallet className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    Connect Wallet
                  </Button>
                </div>

                <div className="pt-6 border-t border-[var(--color-border)] text-center text-[0.8rem] text-[var(--color-text-muted)] font-light">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-[var(--color-text-primary)] hover:underline underline-offset-4 decoration-[var(--color-border-hover)]">
                    Sign In
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 'email' && (
              <motion.form
                key="email"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleEmailSignUp}
                className="space-y-7"
              >
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="flex items-center gap-2 text-[0.8rem] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Back
                </button>

                <h1 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] text-[var(--color-text-primary)]">
                  Create Account
                </h1>

                {errors.form && (
                  <div className="p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-[var(--radius-md)] text-[var(--color-error)] text-[0.8rem] font-light">
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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  error={errors.password}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={errors.confirmPassword}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="primary"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </motion.form>
            )}

            {step === 'wallet' && (
              <motion.div
                key="wallet"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-7"
              >
                <button
                  onClick={() => setStep('method')}
                  className="flex items-center gap-2 text-[0.8rem] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-300"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Back
                </button>

                <h1 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] text-[var(--color-text-primary)]">
                  Connect Wallet
                </h1>

                <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light leading-[1.7]">
                  Connect your wallet to create an account and start earning on VERSERTILE
                </p>

                <div className="space-y-3">
                  <Button
                    fullWidth
                    variant="primary"
                    size="lg"
                    onClick={handleWalletConnect}
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Connect MetaMask'}
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    size="lg"
                    onClick={handleWalletConnect}
                    disabled={loading}
                  >
                    Connect Base Wallet
                  </Button>
                </div>

                <p className="text-[0.7rem] text-[var(--color-text-dim)] text-center font-[family-name:var(--font-mono)] tracking-[0.08em]">
                  Supports MetaMask, WalletConnect &amp; Base Wallet
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.section>
    </div>
  );
}
