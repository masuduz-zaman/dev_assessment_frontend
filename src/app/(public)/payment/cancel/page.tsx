import { Suspense } from 'react';
import { PaymentResult } from '@/features/payments/payment-result';

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <PaymentResult variant="cancel" />
    </Suspense>
  );
}
