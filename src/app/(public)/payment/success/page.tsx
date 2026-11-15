import { Suspense } from 'react';
import { PaymentResult } from '@/features/payments/payment-result';

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentResult variant="success" />
    </Suspense>
  );
}
