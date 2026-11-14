import { CheckCircle2, Code2, ShieldCheck, Trophy } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { site } from '@/config/site';

const highlights = [
  { icon: Code2, text: 'MCQ, written and coding assessments' },
  { icon: Trophy, text: 'Automatic ranking of every candidate' },
  { icon: ShieldCheck, text: 'Role-based access for admins, companies and candidates' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-10 h-80 w-80 animate-blob rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-96 w-96 animate-blob rounded-full bg-fuchsia-600/30 blur-3xl [animation-delay:-6s]" />
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="relative"><Logo light /></div>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">{site.tagline}. <span className="gradient-text">Hire with proof.</span></h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><item.icon className="h-4 w-4" /></span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Secure sign-in with email or Google</p>
      </div>
      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
