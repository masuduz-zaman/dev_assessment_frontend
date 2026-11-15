import { AssessmentBuilder } from '@/features/assessments/components/assessment-builder';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentBuilder assessmentId={id} />;
}
