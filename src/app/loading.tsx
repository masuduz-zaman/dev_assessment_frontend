import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container-page space-y-4 py-10">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid gap-4 pt-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
