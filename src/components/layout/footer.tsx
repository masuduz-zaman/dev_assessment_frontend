import Link from 'next/link';
import { publicNav } from '@/config/navigation';
import { site } from '@/config/site';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">{site.description}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Explore</p>
          <ul className="space-y-2 text-sm text-slate-500">
            {publicNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-brand-600">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-900">Get started</p>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/register" className="transition hover:text-brand-600">Create an account</Link></li>
            <li><Link href="/login" className="transition hover:text-brand-600">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
    </footer>
  );
}
