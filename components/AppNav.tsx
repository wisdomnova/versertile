'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Flame, LayoutDashboard, Compass, Settings, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/poem', label: 'P.O.E.M.', icon: Flame },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/dashboard">
            <Logo size={32} withText />
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-[0.75rem] tracking-[0.06em] uppercase transition-all duration-300',
                    isActive
                      ? 'text-[var(--color-text-primary)] bg-[rgba(255,255,255,0.06)]'
                      : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.03)]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <span className="text-[0.7rem] text-[var(--color-text-dim)] font-[family-name:var(--font-mono)] tracking-[0.06em] hidden md:block">
              {user.wallet_address
                ? `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                : user.username || user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-[var(--color-border)] flex overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[0.6rem] tracking-[0.08em] uppercase transition-colors',
                isActive
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-dim)]'
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
