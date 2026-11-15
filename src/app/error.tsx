'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mb-6 mt-2 text-slate-500">The page could not be displayed. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
