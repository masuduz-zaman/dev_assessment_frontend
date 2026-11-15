import { AssessmentDetail } from '@/features/public/components/assessment-detail';

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssessmentDetail id={id} />;
}
