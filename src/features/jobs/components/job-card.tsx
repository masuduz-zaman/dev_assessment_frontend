import { Building2, Clock, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import type { PublicJob } from '@/features/public/types';

export function JobCard({ job, onApply }: { job: PublicJob; onApply: () => void }) {
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={job.company.name} src={job.company.logoUrl} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 transition group-hover:text-brand-700">{job.title}</h3>
          <p className="flex items-center gap-1 truncate text-sm text-slate-500"><Building2 className="h-3.5 w-3.5" /> {job.company.name}</p>
        </div>
      </div>
      <p className="line-clamp-3 flex-1 text-sm text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {job.employmentType && <Badge tone="brand">{job.employmentType}</Badge>}
        <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" /> {job.location || 'Not specified'}</span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> {formatDate(job.createdAt)}</span>
      </div>
      <Button onClick={onApply} className="mt-5 w-full">Apply now</Button>
    </div>
  );
}
