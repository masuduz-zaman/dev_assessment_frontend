'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form';
import { Modal } from '@/components/ui/modal';
import { getErrorMessage } from '@/lib/http';
import { jobsApi } from '../api';

export function ApplyModal({ job, onClose }: { job: { id: string; title: string; companyName: string } | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');

  const mutation = useMutation({
    mutationFn: () => jobsApi.apply({ jobId: job!.id, coverLetter: coverLetter || undefined }),
    onSuccess: () => {
      toast.success('Application submitted. Good luck!');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      setCoverLetter('');
      onClose();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <Modal
      open={Boolean(job)}
      onClose={onClose}
      title={`Apply for ${job?.title ?? ''}`}
      description={job?.companyName}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()} icon={<Send className="h-4 w-4" />}>Submit application</Button>
        </>
      }
    >
      <Textarea label="Cover letter (optional)" rows={6} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the team why you are a great fit…" hint="Your CV from your profile is attached automatically." />
    </Modal>
  );
}
