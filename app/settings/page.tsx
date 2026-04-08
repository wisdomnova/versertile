'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppNav } from '@/components/AppNav';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { useAuth } from '@/lib/auth/context';
import { Check, AlertCircle, User } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1];

export default function Settings() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          username: username,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        // Refresh auth context to reflect changes
        await refresh();
      } else {
        setMessage({
          type: 'error',
          text: json.error || 'Failed to update profile.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }

    setSaving(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AppNav />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14"
      >
        {/* Header */}
        <motion.div variants={item} className="mb-10 sm:mb-14">
          <p className="label mb-3">Settings</p>
          <h1 className="font-serif text-[var(--color-text-primary)] mb-2">
            Profile
          </h1>
          <p className="text-[0.85rem] text-[var(--color-text-muted)] font-light">
            Manage your public identity on Versertile
          </p>
        </motion.div>

        {/* Identity Info */}
        <motion.div variants={item} className="mb-8">
          <Card border padding="lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--color-text-dim)]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light">
                  {user?.email || (user?.wallet_address
                    ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                    : '')}
                </p>
                <p className="text-[0.6rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.08em] uppercase mt-0.5">
                  {user?.wallet_address ? 'Wallet Connected' : 'Email Account'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <Input
                label="Display Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your public display name"
              />

              <div>
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="your_username"
                />
                <p className="text-[0.6rem] text-[var(--color-text-dim)] font-light mt-1.5 ml-0.5">
                  Lowercase letters, numbers, and underscores. Minimum 3 characters.
                </p>
              </div>
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 mt-5 p-3 rounded-[var(--radius-md)] text-[0.75rem] ${
                  message.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {message.type === 'success' ? (
                  <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                )}
                {message.text}
              </motion.div>
            )}

            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loading size="sm" /> : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Account Section */}
        <motion.div variants={item}>
          <Card border padding="lg">
            <span className="label block mb-4">Account</span>

            <div className="space-y-3">
              {user?.email && (
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase mb-0.5">
                      Email
                    </p>
                    <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {user?.wallet_address && (
                <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                  <div>
                    <p className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase mb-0.5">
                      Wallet
                    </p>
                    <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light font-[family-name:var(--font-mono)]">
                      {user.wallet_address}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                <div>
                  <p className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] uppercase mb-0.5">
                    Member Since
                  </p>
                  <p className="text-[0.8rem] text-[var(--color-text-muted)] font-light">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.main>
    </div>
  );
}
