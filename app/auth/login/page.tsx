'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

const ease = [0.16, 1, 0.3, 1];

function LoginForm() {
  const { user, login, loginWithWallet, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/poem';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !authLoading) router.push(redirect);
  }, [user, authLoading, router, redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!email || !password) {
      setErrors({ form: 'Email and password are required' });
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setErrors({});
    setLoading(true);
    try {
      await loginWithWallet();
      router.push(redirect);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Wallet login failed' });
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
          <Link href="/auth/signup">
            <Button variant="ghost" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      </motion.nav>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 sm:py-16"
      >
        <Card padding="lg" border glow className="w-full max-w-md">
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            onSubmit={handleLogin}
            className="space-y-7"
          >
            <div>
              <h1 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] text-[var(--color-text-primary)] mb-2">
                Sign In
              </h1>
              <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light">
                Welcome back to VERSERTILE
              </p>
            </div>

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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={errors.password}
            />

            <Button
              type="submit"
              fullWidth
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[var(--color-bg-surface)] text-[0.7rem] text-[var(--color-text-dim)] tracking-[0.1em] uppercase font-[family-name:var(--font-mono)]">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              fullWidth
              variant="secondary"
              size="lg"
              onClick={handleWalletLogin}
              disabled={loading}
            >
              <Wallet className="mr-2 w-4 h-4" strokeWidth={1.5} />
              {loading ? 'Connecting...' : 'Sign In with Wallet'}
            </Button>

            <div className="pt-6 border-t border-[var(--color-border)] text-center text-[0.8rem] text-[var(--color-text-muted)] font-light">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-[var(--color-text-primary)] hover:underline underline-offset-4 decoration-[var(--color-border-hover)]">
                Create one
              </Link>
            </div>
          </motion.form>
        </Card>
      </motion.section>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}