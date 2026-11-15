'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dashboardNav, roleLabel } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';
import { NotificationBell } from './notification-bell';
import { UserMenu } from './user-menu';

const ROOTS = ['/admin', '/company', '/candidate'];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const isActive = (href: string) => (ROOTS.includes(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Logo />
      </div>
      <div className="px-5 pb-2 pt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">{roleLabel[user.role]} workspace</div>
      <nav className="scroll-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {dashboardNav[user.role].map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={cn('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', active ? 'text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')}>
              {active && <motion.span layoutId="sidebar-pill" className="absolute inset-0 rounded-xl bg-brand-50 ring-1 ring-brand-100" transition={{ type: 'spring', damping: 30, stiffness: 380 }} />}
              <item.icon className="relative h-[18px] w-[18px]" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 320 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col">
        <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
