import { AuthGuard } from '@/components/layout/auth-guard';
import { Logo } from '@/components/layout/logo';
import { ExamRunner } from '@/features/assessments/components/exam-runner';

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <div className="container-page py-4"><Logo /></div>
        <div className="container-page pb-16"><ExamRunner id={id} /></div>
      </div>
    </AuthGuard>
  );
}
