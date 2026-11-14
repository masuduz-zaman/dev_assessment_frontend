'use client';

import { motion } from 'framer-motion';
import { useId } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps<T extends string> {
  tabs: Array<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
}

export function Tabs<T extends string>({ tabs, value, onChange }: TabsProps<T>) {
  const id = useId();
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button key={tab.value} onClick={() => onChange(tab.value)} className={cn('relative rounded-xl px-4 py-2 text-sm font-medium transition', value === tab.value ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800')}>
          {value === tab.value && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-xl bg-white shadow-sm" transition={{ type: 'spring', damping: 28, stiffness: 340 }} />}
          <span className="relative">
            {tab.label}
            {tab.count !== undefined && <span className="ml-1.5 rounded-full bg-slate-200/80 px-1.5 text-xs">{tab.count}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
