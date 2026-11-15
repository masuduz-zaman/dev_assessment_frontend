'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { publicNav } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { UserMenu } from './user-menu';

export function Navbar() {
  const pathname = usePathname();
  const { user, ready } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={cn('sticky top-0 z-40 transition duration-300', scrolled ? 'glass shadow-soft' : 'bg-transparent')}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={cn('relative rounded-lg px-3 py-2 text-sm font-medium transition', active ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900')}>
                {item.label}
                {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-violet-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {ready && user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            ready && (
              <div className="hidden items-center gap-2 sm:flex">
                <ButtonLink href="/login" variant="ghost">Sign in</ButtonLink>
                <ButtonLink href="/register">Get started</ButtonLink>
              </div>
            )
          )}
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass overflow-hidden border-t md:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {publicNav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}
              {ready && !user && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ButtonLink href="/login" variant="outline">Sign in</ButtonLink>
                  <ButtonLink href="/register">Get started</ButtonLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
