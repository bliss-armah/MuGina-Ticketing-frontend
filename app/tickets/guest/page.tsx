'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/layout/Navbar';
import { Button } from '../../../components/ui/Button';

function GuestTicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentStatus = searchParams.get('payment');

  if (paymentStatus !== 'success') {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-black text-brand-dark mb-2">Payment Incomplete</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your payment was not completed. No tickets were issued.
        </p>
        <Button variant="ghost" onClick={() => router.push('/')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-black text-brand-dark mb-2">You&apos;re In!</h2>
      <p className="text-gray-600 text-sm mb-6 max-w-xs mx-auto">
        Your tickets have been confirmed. Entry PINs have been sent to your phone via SMS — show
        your PIN or QR code at the gate.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-xs mx-auto mb-8 text-left">
        <p className="text-sm font-semibold text-amber-800 mb-1">Check your SMS</p>
        <p className="text-xs text-amber-700">
          Each ticket has a unique 6-digit entry PIN. If you don&apos;t receive it within a few
          minutes, check that you entered the correct phone number.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Button fullWidth onClick={() => router.push('/')}>
          Browse More Events
        </Button>
        <Button fullWidth variant="ghost" onClick={() => router.push('/login')}>
          Create an Account
        </Button>
      </div>
    </div>
  );
}

export default function GuestTicketPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense>
        <GuestTicketContent />
      </Suspense>
    </div>
  );
}
