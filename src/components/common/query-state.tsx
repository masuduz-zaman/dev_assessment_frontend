'use client';

import { AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/lib/http';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton, ListSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from './empty-state';

interface QueryStateProps {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  skeleton?: 'cards' | 'list';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
}

/** One consistent loading / error / empty experience for every data-driven view. */
export function QueryState({ isLoading, error, isEmpty, onRetry, skeleton = 'list', emptyTitle = 'Nothing here yet', emptyDescription, emptyAction, children }: QueryStateProps) {
  if (isLoading) return skeleton === 'cards' ? <CardGridSkeleton /> : <ListSkeleton />;

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-7 w-7 text-rose-500" />}
        title="We couldn't load this"
        description={getErrorMessage(error)}
        action={onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
      />
    );
  }

  if (isEmpty) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  return <>{children}</>;
}
