'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Briefcase, Building2, ClipboardCheck, Code2, Medal, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';
import { CountUp } from '@/components/motion/count-up';
import { FadeIn } from '@/components/motion/fade-in';
import { Stagger, StaggerItem } from '@/components/motion/stagger';
import { ButtonLink } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/ui/skeleton';
import { JobCard } from '@/features/jobs/components/job-card';
import { useJobApply } from '@/features/jobs/use-job-apply';
import { ApplyModal } from '@/features/jobs/components/apply-modal';
import { publicApi } from '../api';
import { AssessmentCard } from './assessment-card';

const features = [
  { icon: Code2, title: 'Real skill assessments', text: 'MCQ, written and coding questions with timed attempts, automatic grading and manual review.' },
  { icon: Medal, title: 'Transparent rankings', text: 'Every finished assessment feeds a public and a company-level leaderboard.' },
  { icon: Users, title: 'Team permissions', text: 'Let evaluators, recruiters and creators work inside one company workspace with exact permissions.' },
  { icon: Briefcase, title: 'Hiring pipeline', text: 'Post jobs, review applications, shortlist and send employment offers without leaving the platform.' },
  { icon: ShieldCheck, title: 'Secure by design', text: 'JWT sessions, role-based access, server-side validation and verified payment webhooks.' },
  { icon: Zap, title: 'Fast and modern', text: 'Instant feedback, notifications and a smooth interface on every device.' },
];

const steps = [
  { icon: Building2, title: 'Companies publish', text: 'Create an assessment, set the duration and invite candidates or go public.' },
  { icon: ClipboardCheck, title: 'Candidates prove skills', text: 'Take timed assessments, run code and get scored automatically.' },
  { icon: BadgeCheck, title: 'Hire with confidence', text: 'Compare ranked results, shortlist applicants and send an offer.' },
];

export function HomeView() {
  const stats = useQuery({ queryKey: ['public-stats'], queryFn: publicApi.stats });
  const assessments = useQuery({ queryKey: ['home-assessments'], queryFn: () => publicApi.assessments() });
  const jobs = useQuery({ queryKey: ['home-jobs'], queryFn: () => publicApi.jobs({}) });
  const apply = useJobApply();

  const counters = [
    { label: 'Approved companies', value: stats.data?.companies },
    { label: 'Active candidates', value: stats.data?.candidates },
    { label: 'Published assessments', value: stats.data?.assessments },
    { label: 'Open positions', value: stats.data?.openJobs },
  ];

  return (
    <div className="-mt-10 space-y-24">
      <section className="relative -mx-4 overflow-hidden bg-slate-950 px-4 pb-24 pt-28 text-white sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-blob rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -right-20 top-20 h-[28rem] w-[28rem] animate-blob rounded-full bg-fuchsia-600/30 blur-3xl [animation-delay:-5s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-sky-500/20 blur-3xl [animation-delay:-9s]" />
        <div className="bg-grid absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Skills-first recruitment platform
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Assess real skills.{' '}
              <span className="bg-gradient-to-r from-brand-300 via-violet-300 to-fuchsia-300 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">Hire with confidence.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-6 max-w-xl text-lg text-slate-300">
              Build structured assessments, evaluate coding and written work, rank candidates automatically and manage your whole hiring pipeline in one place.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">Get started free</ButtonLink>
              <ButtonLink href="/assessments" size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/10 hover:text-white">Explore assessments</ButtonLink>
            </motion.div>
          </div>

          <div className="relative hidden h-[26rem] lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="absolute left-4 top-6 w-72 animate-float rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">Live assessment</p>
              <p className="mt-2 text-lg font-bold">JavaScript Fundamentals</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ delay: 0.9, duration: 1.2 }} className="h-full rounded-full bg-gradient-to-r from-brand-400 to-fuchsia-400" /></div>
              <p className="mt-2 text-xs text-slate-300">Question 5 of 7 · 12:40 left</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="absolute right-0 top-40 w-64 animate-float-slow rounded-2xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Result</p>
              <p className="mt-2 text-4xl font-extrabold">92%</p>
              <p className="text-sm text-slate-300">Passed · Rank #1 this week</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="absolute bottom-0 left-16 w-60 animate-float rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl [animation-delay:-3s]">
              <p className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck className="h-4 w-4 text-sky-300" /> Offer sent</p>
              <p className="mt-1 text-xs text-slate-300">Senior Full-stack Engineer</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="-mt-32 relative z-10">
        <FadeIn>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-xl lg:grid-cols-4">
            {counters.map((counter) => (
              <div key={counter.label} className="bg-white p-6 text-center sm:p-8">
                <p className="gradient-text text-3xl font-extrabold sm:text-4xl">{counter.value === undefined ? '–' : <CountUp value={counter.value} />}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{counter.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <section>
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Everything in one place</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Built for modern developer hiring</h2>
        </FadeIn>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-md transition group-hover:rotate-6 group-hover:scale-110"><feature.icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">From assessment to offer in three steps</h2>
        </FadeIn>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <StaggerItem key={step.title}>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-soft">
                <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{index + 1}</span>
                <step.icon className="mx-auto mb-4 mt-2 h-10 w-10 text-brand-600" />
                <h3 className="font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{step.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Try one now</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Featured assessments</h2>
          </div>
          <ButtonLink href="/assessments" variant="ghost" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">View all</ButtonLink>
        </div>
        {assessments.isLoading ? <CardGridSkeleton count={3} /> : (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(assessments.data ?? []).slice(0, 3).map((assessment) => (
              <StaggerItem key={assessment.id}><AssessmentCard assessment={assessment} /></StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Now hiring</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Latest openings</h2>
          </div>
          <ButtonLink href="/jobs" variant="ghost" icon={<ArrowRight className="h-4 w-4" />} className="flex-row-reverse">View all</ButtonLink>
        </div>
        {jobs.isLoading ? <CardGridSkeleton count={3} /> : (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(jobs.data ?? []).slice(0, 3).map((job) => (
              <StaggerItem key={job.id}><JobCard job={job} onApply={() => apply.start(job)} /></StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <FadeIn>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-glow">
          <div className="absolute -right-10 -top-10 h-56 w-56 animate-blob rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to hire on proof, not promises?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-brand-100">Create a free account and run your first assessment today.</p>
          <ButtonLink href="/register" size="lg" variant="secondary" className="relative mt-8 bg-white text-black hover:bg-brand-50 hover:text-white">Create your account</ButtonLink>
        </section>
      </FadeIn>

      <ApplyModal job={apply.target} onClose={apply.close} />
    </div>
  );
}
